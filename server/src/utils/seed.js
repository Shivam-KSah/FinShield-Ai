/**
 * FinShield-AI Database Seed Script
 * Creates demo users and sample transactions for testing
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');

const DEMO_USERS = [
  { name: 'Alice Customer', email: 'customer@demo.com', password: 'demo1234', role: 'customer', balance: 250000 },
  { name: 'Bob Customer', email: 'bob@demo.com', password: 'demo1234', role: 'customer', balance: 180000 },
  { name: 'Officer Ravi', email: 'officer@demo.com', password: 'demo1234', role: 'officer', balance: 500000 },
  { name: 'Admin Priya', email: 'admin@demo.com', password: 'demo1234', role: 'admin', balance: 1000000 },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data
    await Promise.all([
      User.deleteMany({ email: { $in: DEMO_USERS.map(u => u.email) } }),
    ]);
    console.log('🗑  Cleared old demo users');

    // Create users
    const users = [];
    for (const userData of DEMO_USERS) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`👤 Created ${user.role}: ${user.email}`);
    }

    const alice = users[0];
    const bob = users[1];

    // Create sample transactions
    const txData = [
      { sender: alice._id, receiver: bob._id, amount: 5000, description: 'Coffee shop payment', riskScore: 0, riskFactors: [], status: 'approved' },
      { sender: alice._id, receiver: bob._id, amount: 75000, description: 'Business invoice', riskScore: 30, riskFactors: [{ rule: 'HIGH_AMOUNT', score: 30, description: 'Amount > ₹50K' }], status: 'flagged' },
      { sender: bob._id, receiver: alice._id, amount: 150000, description: 'Property deposit', riskScore: 80, riskFactors: [{ rule: 'HIGH_AMOUNT_EXTREME', score: 50, description: 'Amount > ₹1L' }, { rule: 'ROUND_AMOUNT', score: 5, description: 'Round amount' }, { rule: 'NEW_DEVICE', score: 15, description: 'New device' }, { rule: 'NIGHT_TRANSFER', score: 10, description: 'Night transfer' }], status: 'blocked' },
      { sender: alice._id, receiver: bob._id, amount: 12000, description: 'Rent', riskScore: 0, riskFactors: [], status: 'approved' },
      { sender: bob._id, receiver: alice._id, amount: 8500, description: 'Loan repayment', riskScore: 0, riskFactors: [], status: 'approved' },
    ];

    for (const tx of txData) {
      await Transaction.create(tx);
    }
    console.log(`💸 Created ${txData.length} sample transactions`);

    // Audit logs
    for (const user of users) {
      await AuditLog.create({
        actor: user._id,
        actorRole: user.role,
        action: 'USER_REGISTERED',
        details: { email: user.email },
        severity: 'info',
      });
    }
    console.log('📋 Created audit log entries');

    console.log('\n🎉 Seed complete! Demo credentials:');
    DEMO_USERS.forEach(u => console.log(`   ${u.role}: ${u.email} / ${u.password}`));

  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
