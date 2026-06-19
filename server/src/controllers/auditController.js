const AuditLog = require('../models/AuditLog');
const { createAuditLog } = require('../utils/auditLogger');

// GET /api/audit
const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, severity, actorId } = req.query;
    const query = {};

    if (action) query.action = action;
    if (severity) query.severity = severity;
    if (actorId) query.actor = actorId;

    const logs = await AuditLog.find(query)
      .populate('actor', 'name email role')
      .populate('targetTransaction', 'amount status riskScore')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(query);

    await createAuditLog({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'AUDIT_LOG_VIEWED',
      details: { filters: { action, severity, actorId } },
      ipAddress: req.ip,
      severity: 'info',
    });

    res.status(200).json({
      success: true,
      logs,
      pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Audit] Fetch error:', err.message);
    res.status(500).json({ success: false, message: 'Error fetching audit logs.' });
  }
};

module.exports = { getAuditLogs };
