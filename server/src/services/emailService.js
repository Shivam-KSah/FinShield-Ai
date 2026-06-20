const nodemailer = require('nodemailer');

// Create transporter — uses Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (not your real password)
  },
});

/**
 * Base HTML email template
 */
function baseTemplate(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #F1F5F9; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 32px auto; background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
    .header { background: #2563EB; padding: 24px 32px; display: flex; align-items: center; gap: 12px; }
    .header-logo { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.01em; }
    .header-sub { font-size: 0.7rem; font-weight: 700; color: rgba(255,255,255,0.6); letter-spacing: 0.1em; text-transform: uppercase; }
    .body { padding: 28px 32px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.03em; margin-bottom: 16px; }
    .badge-flagged { background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A; }
    .badge-blocked  { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
    .badge-approved { background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
    .badge-welcome  { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
    h2 { font-size: 1.2rem; font-weight: 700; color: #0F172A; margin: 0 0 8px; }
    p  { font-size: 0.875rem; color: #64748B; line-height: 1.6; margin: 0 0 16px; }
    .detail-box { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #F1F5F9; font-size: 0.82rem; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #94A3B8; font-weight: 500; }
    .detail-value { color: #0F172A; font-weight: 600; }
    .risk-bar-bg { background: #E2E8F0; border-radius: 999px; height: 6px; margin-top: 8px; overflow: hidden; }
    .cta { display: inline-block; margin-top: 8px; padding: 11px 22px; background: #2563EB; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 0.875rem; }
    .footer { padding: 16px 32px; border-top: 1px solid #F1F5F9; font-size: 0.72rem; color: #CBD5E1; text-align: center; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div>
        <div class="header-logo">🛡️ FinShield-AI</div>
        <div class="header-sub">Enterprise Fraud Detection</div>
      </div>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      This is an automated alert from FinShield-AI. Do not reply to this email.<br/>
      © 2024 FinShield-AI · Secured with 256-bit TLS
    </div>
  </div>
</body>
</html>`;
}

/**
 * Send transaction flagged alert
 */
async function sendFlaggedAlert({ to, name, amount, riskScore, description, transactionId }) {
  if (!process.env.EMAIL_USER) return; // skip if email not configured

  const html = baseTemplate(`
    <span class="badge badge-flagged">⚠ Transaction Flagged</span>
    <h2>Your transaction has been flagged for review</h2>
    <p>Hi ${name}, our fraud detection system has flagged your transaction and it is currently on hold pending compliance review.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">₹${amount.toLocaleString('en-IN')}</span></div>
      <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${description}</span></div>
      <div class="detail-row"><span class="detail-label">Risk Score</span><span class="detail-value">${riskScore}/100</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Under Review</span></div>
      <div class="detail-row"><span class="detail-label">Reference ID</span><span class="detail-value">${transactionId}</span></div>
    </div>
    <p>A compliance officer will review this transaction within 24 hours. You will receive another email once a decision is made.</p>
    <p>If you did not initiate this transaction, contact support immediately.</p>
  `);

  await transporter.sendMail({
    from: `"FinShield-AI Alerts" <${process.env.EMAIL_USER}>`,
    to,
    subject: `⚠ Action Required: Transaction of ₹${amount.toLocaleString('en-IN')} flagged for review`,
    html,
  });
}

/**
 * Send transaction blocked alert
 */
async function sendBlockedAlert({ to, name, amount, riskScore, description, transactionId }) {
  if (!process.env.EMAIL_USER) return;

  const html = baseTemplate(`
    <span class="badge badge-blocked">🚫 Transaction Blocked</span>
    <h2>Your transaction was automatically blocked</h2>
    <p>Hi ${name}, our AI fraud detection system has automatically blocked your transaction due to a high risk score of <strong>${riskScore}/100</strong>.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">₹${amount.toLocaleString('en-IN')}</span></div>
      <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${description}</span></div>
      <div class="detail-row"><span class="detail-label">Risk Score</span><span class="detail-value">${riskScore}/100 (High Risk)</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Blocked — No funds deducted</span></div>
      <div class="detail-row"><span class="detail-label">Reference ID</span><span class="detail-value">${transactionId}</span></div>
    </div>
    <p><strong>No funds have been deducted from your account.</strong> A compliance officer can review and approve this transaction if it was legitimate.</p>
    <p>If this was you, please contact your compliance officer with the Reference ID above.</p>
  `);

  await transporter.sendMail({
    from: `"FinShield-AI Alerts" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🚫 Transaction Blocked: ₹${amount.toLocaleString('en-IN')} — Risk Score ${riskScore}/100`,
    html,
  });
}

/**
 * Send transaction approved alert (after officer review)
 */
async function sendApprovedAlert({ to, name, amount, description, transactionId, reviewNote }) {
  if (!process.env.EMAIL_USER) return;

  const html = baseTemplate(`
    <span class="badge badge-approved">✅ Transaction Approved</span>
    <h2>Your transaction has been approved</h2>
    <p>Hi ${name}, a compliance officer has reviewed and approved your transaction. The funds have been transferred.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">₹${amount.toLocaleString('en-IN')}</span></div>
      <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${description}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">✅ Approved — Funds transferred</span></div>
      ${reviewNote ? `<div class="detail-row"><span class="detail-label">Officer Note</span><span class="detail-value">${reviewNote}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Reference ID</span><span class="detail-value">${transactionId}</span></div>
    </div>
    <p>Thank you for your patience during the review process.</p>
  `);

  await transporter.sendMail({
    from: `"FinShield-AI Alerts" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Transaction Approved: ₹${amount.toLocaleString('en-IN')} transferred successfully`,
    html,
  });
}

/**
 * Send final block alert (officer decided to block)
 */
async function sendFinalBlockAlert({ to, name, amount, description, transactionId, reviewNote }) {
  if (!process.env.EMAIL_USER) return;

  const html = baseTemplate(`
    <span class="badge badge-blocked">🚫 Transaction Rejected</span>
    <h2>Your transaction has been rejected after review</h2>
    <p>Hi ${name}, after compliance review, your transaction has been permanently blocked.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Amount</span><span class="detail-value">₹${amount.toLocaleString('en-IN')}</span></div>
      <div class="detail-row"><span class="detail-label">Description</span><span class="detail-value">${description}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">Permanently Blocked</span></div>
      ${reviewNote ? `<div class="detail-row"><span class="detail-label">Reason</span><span class="detail-value">${reviewNote}</span></div>` : ''}
      <div class="detail-row"><span class="detail-label">Reference ID</span><span class="detail-value">${transactionId}</span></div>
    </div>
    <p><strong>No funds were deducted.</strong> If you believe this is an error, please contact support.</p>
  `);

  await transporter.sendMail({
    from: `"FinShield-AI Alerts" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🚫 Transaction Rejected: ₹${amount.toLocaleString('en-IN')} blocked after review`,
    html,
  });
}

/**
 * Send welcome email on registration
 */
async function sendWelcomeEmail({ to, name, role }) {
  if (!process.env.EMAIL_USER) return;

  const html = baseTemplate(`
    <span class="badge badge-welcome">👋 Welcome</span>
    <h2>Welcome to FinShield-AI, ${name}!</h2>
    <p>Your account has been created successfully. You are registered as a <strong>${role.charAt(0).toUpperCase() + role.slice(1)}</strong>.</p>
    <div class="detail-box">
      <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${to}</span></div>
      <div class="detail-row"><span class="detail-label">Role</span><span class="detail-value">${role.charAt(0).toUpperCase() + role.slice(1)}</span></div>
      <div class="detail-row"><span class="detail-label">Platform</span><span class="detail-value">FinShield-AI Fraud Detection</span></div>
    </div>
    <p>You can now log in and start using the platform. All your transactions will be monitored in real-time for fraud.</p>
  `);

  await transporter.sendMail({
    from: `"FinShield-AI" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Welcome to FinShield-AI, ${name}!`,
    html,
  });
}

module.exports = {
  sendFlaggedAlert,
  sendBlockedAlert,
  sendApprovedAlert,
  sendFinalBlockAlert,
  sendWelcomeEmail,
};
