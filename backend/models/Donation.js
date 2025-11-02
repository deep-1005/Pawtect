const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donationId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    enum: ['shelter', 'platform', 'sponsor'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  amountETH: {
    type: Number,
    required: false
  },
  paymentMethod: {
    type: String,
    enum: ['crypto', 'card', 'upi', 'other'],
    default: 'crypto'
  },
  // Donor Information
  donor: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: String,
    message: String,
    walletAddress: String // For crypto donations
  },
  // Recipient Information
  shelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter'
  },
  dog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  },
  // Blockchain Transaction Details (for crypto)
  transactionHash: {
    type: String,
    trim: true
  },
  fromWallet: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address']
  },
  toWallet: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address']
  },
  blockNumber: Number,
  // Status
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  // Timestamps
  donatedAt: {
    type: Date,
    default: Date.now
  },
  // Receipt
  receiptGenerated: {
    type: Boolean,
    default: false
  },
  receiptUrl: String,
  // Notes
  adminNotes: String
}, {
  timestamps: true
});

// Generate unique donation ID before saving
donationSchema.pre('save', async function(next) {
  if (!this.donationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.donationId = `DON-${timestamp}-${random}`.toUpperCase();
  }
  next();
});

// Indexes for faster queries
donationSchema.index({ donationId: 1 });
donationSchema.index({ transactionHash: 1 });
donationSchema.index({ shelter: 1 });
donationSchema.index({ donatedAt: -1 });
donationSchema.index({ 'donor.email': 1 });

module.exports = mongoose.model('Donation', donationSchema);
