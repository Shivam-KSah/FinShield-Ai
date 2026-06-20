const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { calculateRisk } = require('../services/fraudEngine');
const { generateFraudReport } = require('../services/geminiService');
const { createAuditLog } = require('../utils/auditLogger');
const { sendFlaggedAlert, sendBlockedAlert, sendApprovedAlert, sendFinalBlockAlert } = require('../services/emailService');

// POST /api/transactions/transfer
const transfer = async (req, res) => {
  try {
    const { receiverEmail, amount, description, location, deviceId } = req.body;
    const sender = req.user;

    if (!receiverEmail || !amount) {
      return res.status(400).json({ success: false, message: 'Receiver email and amount are required.' });
    }
    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be positive.' });
    }
    if (sender.balance < amount) {
      return res.status(400).json({ success: false, message: 'Insufficient balance.' });
    }

    const receiver = await User.findOne({ email: receiverEmail });
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Receiver not found.' });
    }
    if (receiver._id.toString() === sender._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot transfer to yourself.' });
    }

    // Detect new device
    const isNewDevice = deviceId && sender.deviceFingerprint && sender.deviceFingerprint !== deviceId;

    // Run fraud engine
    const { riskScore, riskFactors, status } = await calculateRisk({
      amount,
      senderId: sender._id,
      isNewDevice,
      location: location || 'Unknown',
    });

    // Create transaction
    const transaction = await Transaction.create({
      sender: sender._id,
      receiver: receiver._id,
      amount,
      description: description || 'Transfer',
      riskScore,
      riskFactors,
      status,
      location: location || 'Unknown',
      deviceId: deviceId || null,
      isNewDevice,
    });

    // Only deduct balance if not blocked
    if (status !== 'blocked') {
      await User.findByIdAndUpdate(sender._id, { $inc: { balance: -amount } });
      await User.findByIdAndUpdate(receiver._id, { $inc: { balance: amount } });

      // Update device fingerprint
      if (deviceId) {
        await User.findByIdAndUpdate(sender._id, { deviceFingerprint: deviceId });
      }
    }

    // Audit log
    const auditAction =
      status === 'blocked'
        ? 'TRANSACTION_BLOCKED'
        : status === 'flagged'
        ? 'TRANSACTION_FLAGGED'
        : 'TRANSACTION_INITIATED';

    createAuditLog({
      actor: sender._id,
      actorRole: sender.role,
      action: auditAction,
      targetTransaction: transaction._id,
      details: { amount, riskScore, status, receiverEmail },
      ipAddress: req.ip,
      severity: status === 'blocked' ? 'critical' : status === 'flagged' ? 'warning' : 'info',
    }).catch(err => console.error('[AuditLog] Error:', err.message));

    // Send email alert to sender (non-blocking)
    if (status === 'flagged') {
      sendFlaggedAlert({
        to: sender.email,
        name: sender.name,
        amount,
        riskScore,
        description: description || 'Transfer',
        transactionId: transaction._id,
      }).catch(err => console.error('[Email] Flagged alert error:', err.message));
    } else if (status === 'blocked') {
      sendBlockedAlert({
        to: sender.email,
        name: sender.name,
        amount,
        riskScore,
        description: description || 'Transfer',
        transactionId: transaction._id,
      }).catch(err => console.error('[Email] Blocked alert error:', err.message));
    }

    const populated = await Transaction.findById(transaction._id)
      .populate('sender', 'name email accountNumber')
      .populate('receiver', 'name email accountNumber');

    res.status(201).json({
      success: true,
      message:
        status === 'blocked'
          ? 'Transaction blocked due to high fraud risk.'
          : status === 'flagged'
          ? 'Transaction flagged for compliance review.'
          : 'Transfer completed successfully.',
      transaction: populated,
    });
  } catch (err) {
    console.error('[Transaction] Transfer error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during transfer.' });
  }
};

// GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;
    const query = {};

    // Customers only see their own
    if (req.user.role === 'customer') {
      query.$or = [{ sender: req.user._id }, { receiver: req.user._id }];
    }
    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('sender', 'name email accountNumber')
      .populate('receiver', 'name email accountNumber')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Transaction.countDocuments(query);

    res.status(200).json({
      success: true,
      transactions,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching transactions.' });
  }
};

// GET /api/transactions/flagged
const getFlagged = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      status: { $in: ['flagged', 'blocked'] },
    })
      .populate('sender', 'name email accountNumber balance')
      .populate('receiver', 'name email accountNumber')
      .populate('reviewedBy', 'name email')
      .sort({ riskScore: -1, createdAt: -1 })
      .limit(100);

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error fetching flagged transactions.' });
  }
};

// PATCH /api/transactions/:id/review
const reviewTransaction = async (req, res) => {
  try {
    const { action, note } = req.body; // action: 'approve' | 'block'
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }
    if (!['flagged', 'blocked'].includes(transaction.status)) {
      return res.status(400).json({ success: false, message: 'Only flagged/blocked transactions can be reviewed.' });
    }
    if (!['approve', 'block'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be "approve" or "block".' });
    }

    const newStatus = action === 'approve' ? 'approved' : 'blocked';

    // If approving a previously blocked transaction, transfer funds
    if (action === 'approve' && transaction.status === 'blocked') {
      const sender = await User.findById(transaction.sender);
      if (sender.balance >= transaction.amount) {
        await User.findByIdAndUpdate(transaction.sender, { $inc: { balance: -transaction.amount } });
        await User.findByIdAndUpdate(transaction.receiver, { $inc: { balance: transaction.amount } });
      }
    }

    transaction.status = newStatus;
    transaction.reviewedBy = req.user._id;
    transaction.reviewedAt = new Date();
    transaction.reviewNote = note || null;
    await transaction.save();

    createAuditLog({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'TRANSACTION_REVIEWED',
      targetTransaction: transaction._id,
      details: { action, newStatus, note },
      ipAddress: req.ip,
      severity: action === 'block' ? 'critical' : 'warning',
    }).catch(err => console.error('[AuditLog] Error:', err.message));

    // Email alert to the original sender
    const senderUser = await User.findById(transaction.sender);
    if (senderUser) {
      if (action === 'approve') {
        sendApprovedAlert({
          to: senderUser.email,
          name: senderUser.name,
          amount: transaction.amount,
          description: transaction.description,
          transactionId: transaction._id,
          reviewNote: note,
        }).catch(err => console.error('[Email] Approved alert error:', err.message));
      } else {
        sendFinalBlockAlert({
          to: senderUser.email,
          name: senderUser.name,
          amount: transaction.amount,
          description: transaction.description,
          transactionId: transaction._id,
          reviewNote: note,
        }).catch(err => console.error('[Email] Block alert error:', err.message));
      }
    }

    const populated = await Transaction.findById(transaction._id)
      .populate('sender', 'name email accountNumber')
      .populate('receiver', 'name email accountNumber')
      .populate('reviewedBy', 'name email');

    res.status(200).json({ success: true, message: `Transaction ${newStatus}.`, transaction: populated });
  } catch (err) {
    console.error('[Transaction] Review error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during review.' });
  }
};

// POST /api/transactions/:id/investigate
const investigate = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    const report = await generateFraudReport({
      amount: transaction.amount,
      riskScore: transaction.riskScore,
      riskFactors: transaction.riskFactors,
      status: transaction.status,
      location: transaction.location,
      senderName: transaction.sender.name,
      receiverName: transaction.receiver.name,
      description: transaction.description,
      createdAt: transaction.createdAt,
    });

    // Cache the report
    transaction.aiReport = report;
    await transaction.save();

    await createAuditLog({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'AI_INVESTIGATION_REQUESTED',
      targetTransaction: transaction._id,
      details: { riskScore: transaction.riskScore },
      ipAddress: req.ip,
      severity: 'warning',
    });

    res.status(200).json({ success: true, report });
  } catch (err) {
    console.error('[Transaction] Investigate error:', err.message);
    res.status(500).json({ success: false, message: 'Error generating AI report.' });
  }
};

// GET /api/transactions/stats
const getStats = async (req, res) => {
  try {
    const query = req.user.role === 'customer'
      ? { $or: [{ sender: req.user._id }, { receiver: req.user._id }] }
      : {};

    const [total, flagged, blocked, approved] = await Promise.all([
      Transaction.countDocuments(query),
      Transaction.countDocuments({ ...query, status: 'flagged' }),
      Transaction.countDocuments({ ...query, status: 'blocked' }),
      Transaction.countDocuments({ ...query, status: 'approved' }),
    ]);

    const avgRisk = await Transaction.aggregate([
      { $match: query },
      { $group: { _id: null, avg: { $avg: '$riskScore' } } },
    ]);

    // Last 7 days volume
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyVolume = await Transaction.aggregate([
      { $match: { ...query, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          amount: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const riskDistribution = await Transaction.aggregate([
      { $match: query },
      {
        $bucket: {
          groupBy: '$riskScore',
          boundaries: [0, 30, 60, 80, 101],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        flagged,
        blocked,
        approved,
        avgRisk: Math.round(avgRisk[0]?.avg || 0),
        dailyVolume,
        riskDistribution,
        balance: req.user.balance,
      },
    });
  } catch (err) {
    console.error('[Transaction] Stats error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching stats.' });
  }
};

module.exports = { transfer, getTransactions, getFlagged, reviewTransaction, investigate, getStats };
