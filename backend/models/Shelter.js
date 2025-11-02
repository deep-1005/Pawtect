const mongoose = require('mongoose');

const shelterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide shelter name'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Government', 'NGO', 'Private', 'Municipal'],
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    website: String
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  capacity: {
    total: {
      type: Number,
      required: true
    },
    current: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    }
  },
  facilities: {
    veterinaryService: { type: Boolean, default: false },
    adoptionService: { type: Boolean, default: false },
    ambulanceService: { type: Boolean, default: false },
    vaccinationService: { type: Boolean, default: false },
    sterilizationService: { type: Boolean, default: false }
  },
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staff: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  animals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  }],
  statistics: {
    totalRescues: { type: Number, default: 0 },
    totalAdoptions: { type: Number, default: 0 },
    currentAnimals: { type: Number, default: 0 }
  },
  funding: {
    donationsReceived: { type: Number, default: 0 },
    totalExpenditure: { type: Number, default: 0 },
    walletAddress: {
      type: String,
      match: [/^0x[a-fA-F0-9]{40}$/, 'Please provide a valid Ethereum wallet address'],
      trim: true
    },
    donations: [{
      amount: Number,
      donorName: String,
      donorEmail: String,
      date: { type: Date, default: Date.now },
      message: String,
      transactionHash: String, // For crypto donations
      paymentMethod: {
        type: String,
        enum: ['crypto', 'card', 'upi', 'other'],
        default: 'other'
      }
    }]
  },
  adoptions: [{
    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Animal'
    },
    adopterName: String,
    adopterContact: String,
    adoptionDate: { type: Date, default: Date.now },
    adoptionFee: Number
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Update available capacity
shelterSchema.pre('save', function(next) {
  this.capacity.available = this.capacity.total - this.capacity.current;
  next();
});

module.exports = mongoose.model('Shelter', shelterSchema);