/**
 * FinShield Fraud Engine
 * Rule-based risk scoring with anomaly detection
 */

const Transaction = require('../models/Transaction');

// Risk scoring rules
const RULES = {
  HIGH_AMOUNT_EXTREME: {
    id: 'HIGH_AMOUNT_EXTREME',
    score: 50,
    description: 'Transaction amount exceeds ₹1,00,000 — extremely high value transfer',
    check: ({ amount }) => amount > 100000,
  },
  HIGH_AMOUNT: {
    id: 'HIGH_AMOUNT',
    score: 30,
    description: 'Transaction amount exceeds ₹50,000 — above normal transfer threshold',
    check: ({ amount }) => amount > 50000 && amount <= 100000,
  },
  NIGHT_TRANSFER: {
    id: 'NIGHT_TRANSFER',
    score: 10,
    description: 'Transfer initiated between 00:00–05:00 — suspicious off-hours activity',
    check: () => {
      const hour = new Date().getHours();
      return hour >= 0 && hour < 5;
    },
  },
  VELOCITY_BREACH: {
    id: 'VELOCITY_BREACH',
    score: 25,
    description: 'More than 3 transfers in the last 10 minutes — rapid transaction velocity',
    check: async ({ senderId }) => {
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const count = await Transaction.countDocuments({
        sender: senderId,
        createdAt: { $gte: tenMinutesAgo },
      });
      return count >= 3;
    },
  },
  NEW_DEVICE: {
    id: 'NEW_DEVICE',
    score: 15,
    description: 'Transfer initiated from an unrecognized device fingerprint',
    check: ({ isNewDevice }) => isNewDevice === true,
  },
  ROUND_AMOUNT: {
    id: 'ROUND_AMOUNT',
    score: 5,
    description: 'Perfectly round amount — common pattern in structuring attacks',
    check: ({ amount }) => amount % 10000 === 0 && amount >= 10000,
  },
};

// Thresholds
const THRESHOLD_FLAGGED = 30;
const THRESHOLD_BLOCKED = 70;

/**
 * Calculate risk score for a transaction
 * @param {Object} params - { amount, senderId, isNewDevice, location }
 * @returns {{ riskScore, riskFactors, status }}
 */
async function calculateRisk({ amount, senderId, isNewDevice = false, location = 'Unknown' }) {
  const triggeredFactors = [];
  let totalScore = 0;

  for (const rule of Object.values(RULES)) {
    let triggered = false;
    try {
      triggered = await rule.check({ amount, senderId, isNewDevice, location });
    } catch {
      triggered = false;
    }

    if (triggered) {
      triggeredFactors.push({
        rule: rule.id,
        score: rule.score,
        description: rule.description,
      });
      totalScore += rule.score;
    }
  }

  // Cap at 100
  const riskScore = Math.min(totalScore, 100);

  let status = 'approved';
  if (riskScore >= THRESHOLD_BLOCKED) {
    status = 'blocked';
  } else if (riskScore >= THRESHOLD_FLAGGED) {
    status = 'flagged';
  }

  return { riskScore, riskFactors: triggeredFactors, status };
}

module.exports = { calculateRisk, THRESHOLD_FLAGGED, THRESHOLD_BLOCKED };
