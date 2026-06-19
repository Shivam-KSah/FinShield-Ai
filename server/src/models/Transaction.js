const mongoose = require('mongoose');

const riskFactorSchema = new mongoose.Schema({
  rule: { type: String, required: true },
  score: { type: Number, required: true },
  description: { type: String, required: true },
});

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1'],
    },
    description: {
      type: String,
      default: 'Transfer',
      maxlength: 200,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    riskFactors: [riskFactorSchema],
    status: {
      type: String,
      enum: ['pending', 'approved', 'flagged', 'blocked'],
      default: 'pending',
    },
    location: {
      type: String,
      default: 'Unknown',
    },
    deviceId: {
      type: String,
      default: null,
    },
    isNewDevice: {
      type: Boolean,
      default: false,
    },
    aiReport: {
      type: String,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewNote: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Index for velocity check
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
