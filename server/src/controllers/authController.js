const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createAuditLog } = require('../utils/auditLogger');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const allowedRoles = ['customer', 'officer', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'customer';

    const user = await User.create({ name, email, password, role: userRole });
    const token = signToken(user._id);

    // Non-blocking audit log — don't let it break registration
    createAuditLog({
      actor: user._id,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      details: { email, role: userRole },
      ipAddress: req.ip,
      severity: 'info',
    }).catch(err => console.error('[Auth] Audit log error (register):', err.message));

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message, err.code);
    res.status(500).json({ success: false, message: `Registration failed: ${err.message}` });
  }

};


// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Use findByIdAndUpdate to avoid triggering pre-save hook
    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

    const token = signToken(user._id);

    // Non-blocking audit log — don't let it break login
    createAuditLog({
      actor: user._id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      details: { email },
      ipAddress: req.ip,
      severity: 'info',
    }).catch(err => console.error('[Auth] Audit log error:', err.message));

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};


// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { register, login, getMe };
