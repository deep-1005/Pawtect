const mongoose = require('mongoose');

const animalSchema = new mongoose.Schema({
  paw_id: {
    type: String,
    unique: true,
    sparse: true
    // Format: PAW-TIMESTAMP-RANDOM
  },
  animalId: {
    type: String,
    required: false, // Make it optional
    unique: true,
    sparse: true,
    // Format: PAW-CITY-XXXX
  },
  name: {
    type: String,
    default: 'Unknown'
  },
  species: {
    type: String,
    enum: ['Dog', 'Cat', 'Other'],
    default: 'Dog'
  },
  type: {
    type: String, // Generic type like "Indian Street Dog"
    default: 'Mixed'
  },
  breed: {
    type: String,
    required: false // Make breed optional
  },
  color: {
    type: String, // Color/pattern description
    default: 'Mixed'
  },
  age: {
    type: mongoose.Schema.Types.Mixed, // Allow both number and enum values
    default: 'Unknown'
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Unknown'],
    default: 'Unknown'
  },
  status: {
    type: String,
    enum: ['Rescued', 'In Shelter', 'Under Treatment', 'Ready for Adoption', 'Adopted', 'Deceased', 'Recently Rescued', 'In Quarantine'],
    default: 'Rescued'
  },
  health: {
    vaccinated: { type: Boolean, default: false },
    sterilized: { type: Boolean, default: false },
    injuries: [String],
    medicalHistory: String
  },
  aiAnalysis: {
    isFake: Boolean,
    confidence: Number,
    isInjured: Boolean,
    injuryConfidence: Number
  },
  healthStatus: {
    vaccinated: { type: Boolean, default: false },
    sterilized: { type: Boolean, default: false },
    injured: { type: Boolean, default: false },
    medicalNotes: { type: String, default: '' },
    aiAnalysis: {
      injuryDetection: {
        is_injured: Boolean,
        confidence: Number,
        status: String
      },
      aiImageDetection: {
        is_ai_generated: Boolean,
        confidence: Number,
        status: String
      },
      analyzedAt: Date
    }
  },
  location: {
    city: String,
    area: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    rescueDate: Date,
    rescueLocation: {
      address: String,
      city: String,
      state: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    currentLocation: {
      shelterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shelter'
      },
      shelterName: String,
      address: String
    }
  },
  rescueDetails: {
    rescueDate: {
      type: Date,
      default: Date.now
    },
    rescuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rescuerName: String,
    rescueReason: String,
    // Initial condition when rescued
    initialCondition: String
  },
  rescuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter'
  },
  currentShelter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter'
  },
  description: {
    type: String
  },
  media: {
    photos: [String], // URLs to images
    videos: [String],  // URLs to videos
    medicalReports: [{
      filename: String,
      filepath: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      uploadedBy: String,
      description: String
    }]
  },
  qrCode: {
    type: String, // URL to QR code image
  },
  timeline: [{
    date: {
      type: Date,
      default: Date.now
    },
    event: String,
    description: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  adoptionDetails: {
    isAdopted: {
      type: Boolean,
      default: false
    },
    adoptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    adopterName: String,
    adoptionDate: Date,
    adopterContact: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate unique animal ID
animalSchema.pre('save', async function(next) {
  if (!this.animalId) {
    const city = this.location.rescueLocation.city || 'UNK';
    const count = await mongoose.model('Animal').countDocuments();
    this.animalId = `PAW-${city.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Animal', animalSchema);