const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    unique: true
  },
  reportType: {
    type: String,
    enum: ['Injured Animal', 'Stray Sighting', 'Cruelty', 'Dead Animal', 'Lost Pet', 'Other'],
    required: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    minlength: 10
  },
  location: {
    address: {
      type: String,
      required: true
    },
    city: String,
    state: String,
    coordinates: {
      lat: {
        type: Number,
        required: true
      },
      lng: {
        type: Number,
        required: true
      }
    }
  },
  animalDetails: {
    species: {
      type: String,
      enum: ['Dog', 'Cat', 'Other'],
      default: 'Dog'
    },
    breed: String,
    color: String,
    size: {
      type: String,
      enum: ['Small', 'Medium', 'Large', 'Unknown']
    },
    age: {
      type: String,
      enum: ['Puppy', 'Adult', 'Senior', 'Unknown']
    },
    condition: String
  },
  media: {
    photos: [String],
    videos: [String]
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    name: String,
    phone: String,
    email: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Assigned', 'Rescued', 'Resolved', 'Closed', 'Invalid'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedTo: {
    shelter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shelter'
    },
    assignedDate: Date,
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  linkedAnimal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Animal'
  },
  updates: [{
    date: {
      type: Date,
      default: Date.now
    },
    status: String,
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  resolvedDate: Date,
  resolutionNotes: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Generate unique report ID
reportSchema.pre('save', async function(next) {
  if (!this.reportId) {
    const count = await mongoose.model('Report').countDocuments();
    this.reportId = `REP-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);