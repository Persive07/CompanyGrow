const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['employee', 'manager', 'admin'],
    default: 'employee'
  },
  
  // Professional Information
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  phone: {
    type: String,
    trim: true
  },
  
  // Skills and Competencies
  skills: [{
    type: String,
    trim: true
  }],
  
  // Address Information
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  // Performance Tracking
  performanceMetrics: [{
    period: {
      type: String, 
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 4
    },
    goals: [{
      title: String,
      mode: {
        type: String,
        enum: ['Training', 'Project'],
        default: 'Training'
      },
      description: String,
      refId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // No strict ref because it can point to either Course or Project
      },
      status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
      },
      completedAt: Date
    }],
    feedback: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewDate: {
      type: Date,
      default: Date.now
    },

    badgesEarned: [{
      title: {
        type: String, 
        enum: ['Green', 'Cyan', 'Blue', 'Purple','Red'] ,
        required: true
      },
      type: {
        type: String,
        enum: ['course', 'project'],
        required: true
      },
      description: String,
      dateEarned: {
        type: Date,
        default: Date.now
      },
       approved: {
        type: Boolean,
        default: false
      }
    }]

  }],
  
  // System Fields
  profileImage: String,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'skills': 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);