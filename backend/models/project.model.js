const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  skillsRequired: [String],
  skillsGained: [String],
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'on-hold', 'completed'],
    default: 'planning'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  deadline: {
    type: Date,
    default: null
  },
  budget: {
    type: Number,
    min: 0,
    default: null
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  badgeReward: { 
    type: String, 
    enum: ['Green', 'Cyan', 'Blue', 'Purple','Red'] 
  }
}, {
  timestamps: true 
});

// Index for better query performance
projectSchema.index({ status: 1, priority: 1 });
projectSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);