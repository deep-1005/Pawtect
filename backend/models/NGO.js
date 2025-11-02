const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  ngo_id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide NGO name'],
    trim: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  registrationType: {
    type: String,
    enum: ['Trust', 'Society', '80G', '12A', 'FCRA', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  foundedYear: {
    type: Number,
    required: true
  },
  contactInfo: {
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    alternatePhone: String,
    website: String,
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String
    }
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
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  founder: {
    name: String,
    contact: String
  },
  president: {
    name: String,
    contact: String
  },
  teamMembers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: String,
    joinedDate: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  volunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  servicesProvided: [{
    type: String,
    enum: [
      'Animal Rescue',
      'Veterinary Care',
      'Adoption Services',
      'Foster Care',
      'Vaccination Drives',
      'Sterilization Programs',
      'Ambulance Service',
      'Awareness Programs',
      'Feeding Programs',
      'Shelter Management',
      'Wildlife Rescue',
      'Emergency Response'
    ]
  }],
  operatingAreas: [{
    city: String,
    state: String,
    pincode: String
  }],
  sheltersManaged: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter'
  }],
  animalsRescued: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  }],
  statistics: {
    totalRescues: { type: Number, default: 0 },
    totalAdoptions: { type: Number, default: 0 },
    totalVaccinations: { type: Number, default: 0 },
    totalSterilizations: { type: Number, default: 0 },
    activeVolunteers: { type: Number, default: 0 },
    sheltersCount: { type: Number, default: 0 }
  },
  funding: {
    donationsReceived: { type: Number, default: 0 },
    totalExpenditure: { type: Number, default: 0 },
    bankAccount: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String
    }
  },
  documents: [{
    type: {
      type: String,
      enum: ['Registration Certificate', '80G Certificate', '12A Certificate', 'FCRA', 'Other']
    },
    documentUrl: String,
    uploadedDate: Date,
    expiryDate: Date,
    isVerified: {
      type: Boolean,
      default: false
    }
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
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    imageUrl: String
  }],
  events: [{
    title: String,
    description: String,
    date: Date,
    location: String,
    type: {
      type: String,
      enum: ['Adoption Drive', 'Vaccination Camp', 'Awareness Program', 'Fundraiser', 'Other']
    },
    participants: Number
  }]
}, {
  timestamps: true
});

// Generate NGO ID before saving
ngoSchema.pre('save', function(next) {
  if (!this.ngo_id) {
    const prefix = 'NGO';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ngo_id = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

// Update statistics before saving
ngoSchema.pre('save', function(next) {
  this.statistics.activeVolunteers = this.volunteers.length;
  this.statistics.sheltersCount = this.sheltersManaged.length;
  next();
});

module.exports = mongoose.model('NGO', ngoSchema);
