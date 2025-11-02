const mongoose = require('mongoose');

const crueltyReportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Reporter Information
  reportedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: String,
    email: String,
    phone: String,
    isAnonymous: {
      type: Boolean,
      default: false
    }
  },
  
  // Incident Details
  incident: {
    type: {
      type: String,
      enum: ['Physical Abuse', 'Neglect', 'Abandonment', 'Illegal Trade', 'Fighting', 'Other'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    dateTime: {
      type: Date,
      default: Date.now
    },
    isOngoing: {
      type: Boolean,
      default: false
    }
  },
  
  // Location
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    landmark: String
  },
  
  // Evidence
  evidence: {
    photos: [{
      path: String,
      uploadedAt: Date
    }],
    videos: [{
      path: String,
      uploadedAt: Date
    }]
  },
  
  // Status Tracking
  status: {
    type: String,
    enum: ['Pending', 'Under Investigation', 'Action Taken', 'Resolved', 'Dismissed'],
    default: 'Pending'
  },
  
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shelter',
    default: null
  },
  
  // Resolution
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    resolvedAt: Date,
    notes: String,
    actionTaken: String,
    animalsRescued: Number,
    followUpRequired: Boolean
  },
  
  // Timeline
  timeline: [{
    action: String,
    description: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Admin Notes (Internal)
  adminNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  
  isPublic: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
crueltyReportSchema.index({ status: 1, createdAt: -1 });
crueltyReportSchema.index({ 'incident.severity': 1 });
crueltyReportSchema.index({ 'location.city': 1 });
crueltyReportSchema.index({ priority: 1 });

module.exports = mongoose.model('CrueltyReport', crueltyReportSchema);
