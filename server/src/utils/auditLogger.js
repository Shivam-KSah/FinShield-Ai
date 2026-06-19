const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 * @param {Object} params
 */
async function createAuditLog({
  actor,
  actorRole,
  action,
  targetTransaction = null,
  details = {},
  ipAddress = null,
  severity = 'info',
}) {
  try {
    await AuditLog.create({
      actor,
      actorRole,
      action,
      targetTransaction,
      details,
      ipAddress,
      severity,
    });
  } catch (err) {
    console.error('[AuditLogger] Failed to log:', err.message);
  }
}

module.exports = { createAuditLog };
