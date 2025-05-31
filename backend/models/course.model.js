const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: String,
  description: String, 
  videoUrl: [String],
  resourceLink: [String]
}, { _id: true });

const enrolledUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  progress: { type: Number, default: 0 }, // %
  completedModules: [{ type: mongoose.Schema.Types.ObjectId }], 
  enrolledAt: { type: Date, default: Date.now },
  completedAt: Date
});

const courseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: String, 
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  preRequisites: [String], 
  skillsGained: [String], 
  eta: String,            

  content: [contentSchema],
  enrolledUsers: [enrolledUserSchema], 
  badgeReward: { 
    type: String, 
    enum: ['Green', 'Cyan', 'Blue', 'Purple','Red'] 
  }
}, {
  timestamps: true 
});

courseSchema.index({ category: 1 });
courseSchema.index({ 'skillsGained': 1 });

module.exports = mongoose.model('Course', courseSchema);