// controllers/user.controller.js
const User = require('../models/user.model');
const Project = require('../models/project.model');
const Course = require('../models/course.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// GET /api/user/getAllUsers
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users, excluding passwords
    const users = await User.find().select('-password');

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found.' });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};

// GET /api/user/getProfile/:id
const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user 
    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

// PUT /api/user/modifyProfile/:id
const modifyProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Destructure disallowed fields and prevent them from being updated
    const { performanceMetrics, ...updateData } = req.body;

    // Sanity: Do not allow changing email or performance metrics
    if (performanceMetrics) {
      return res.status(400).json({
        message: "You cannot modify 'email' or 'performanceMetrics' through this endpoint."
      });
    }

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-performanceMetrics');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error while updating profile.' });
  }
};

// GET /api/user/getUserPerf/:id
const getUserPerf = async (req, res) => {
  try {
    const { id } = req.params;

    // Direct validation in controller
    if (!id || id === 'null' || id === 'undefined') {
      return res.status(400).json({ 
        message: 'Valid user ID is required.' 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: 'Invalid user ID format.' 
      });
    }

    const user = await User.findById(id).select('performanceMetrics');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Performance data retrieved successfully.',
      performanceMetrics: user.performanceMetrics || []
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ 
      message: 'Server error while retrieving performance data.',
      error: error.message
    });
  }
};



// POST /api/user/addUser
const addUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      experience,
      phone,
      skills,
      address,
      emergencyContact,
      profileImage
    } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user object
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      position,
      experience,
      phone,
      skills,
      address,
      emergencyContact,
      profileImage
    });

    // Save to DB
    await newUser.save();

    res.status(201).json({
      message: 'User added successfully.',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Server error while adding user.' });
  }
};

// DELETE /api/user/deleteUser/:id
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/user/getUserCourses/:id
const getUserCourses = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user || !user.performanceMetrics) return res.status(404).json({ message: 'User or performance metrics not found' });

    const trainingGoals = user.performanceMetrics.goals.filter(goal => goal.mode === 'Training');
    return res.status(200).json(trainingGoals);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/user/getCourseStatus/:userId/:courseId
const getCourseStatus = async (req, res) => {
  try {
    const { userId, courseId } = req.params;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const enrolledUser = course.enrolledUsers.find(user => user.userId.toString() === userId);
    const completedModules = enrolledUser ? enrolledUser.completedModules : [];
    const progress = enrolledUser ? enrolledUser.progress : 0;

    return res.status(200).json({
      courseContent: course.content,
      completedModules,
      progress
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/user/getUserProjects/:id
const getUserProjects = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user || !user.performanceMetrics) return res.status(404).json({ message: 'User or performance metrics not found' });

    const projectGoals = user.performanceMetrics.goals.filter(goal => goal.mode === 'Project');
    const projectIds = projectGoals.map(goal => goal.projectId || goal._id);

    const projects = await Project.find({ _id: { $in: projectIds } });
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  getAllUsers,
  getProfile,
  modifyProfile,
  getUserPerf,
  addUser,
  deleteUser,
  getUserCourses,
  getCourseStatus,
  getUserProjects
};