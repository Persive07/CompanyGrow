const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('../models/project.model'); // Adjust path as needed
const User = require('../models/user.model'); // For referencing manager's ObjectId

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for project seeding.');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedProjects = async () => {
  await connectDB();

  try {
    // Fetch a manager to assign as creator
    const manager = await User.findOne({ role: 'manager' });
    if (!manager) {
      throw new Error('No manager found in the database. Please seed users first.');
    }

    const projects = [
      {
        name: "AI-Powered Resume Screener",
        description: "Develop a smart web-based application to automate resume screening using NLP techniques and machine learning models. The system should rank candidates based on job-specific criteria.",
        skillsRequired: ["Node.js", "Express", "Machine Learning", "NLP", "MongoDB"],
        skillsGained: ["Text Classification", "Model Deployment", "REST API Design"],
        status: "planning",
        priority: "high",
        deadline: new Date("2025-08-15"),
        budget: 5000,
        managedBy: manager._id,
        badgeReward: 'Blue' 
      },
      {
        name: "Cross-Platform Inventory Tracker",
        description: "Create a responsive web and mobile application for real-time inventory tracking across multiple warehouses, with barcode scanning, data syncing, and admin dashboards.",
        skillsRequired: ["React", "Node.js", "MongoDB", "REST APIs", "React Native"],
        skillsGained: ["Cross-platform Development", "State Management", "Cloud Sync"],
        status: "in-progress",
        priority: "medium",
        deadline: new Date("2025-09-30"),
        budget: 7500,
        managedBy: manager._id,
        badgeReward: 'Purple' 
      },
      {
        name: "Company-Wide Analytics Dashboard",
        description: "Build a centralized dashboard to visualize key performance indicators (KPIs) for various departments using charts, tables, and dynamic filtering based on roles.",
        skillsRequired: ["MongoDB Aggregation", "Chart.js", "Express.js", "Authentication"],
        skillsGained: ["Data Visualization", "Dashboard Design", "Access Control"],
        status: "on-hold",
        priority: "low",
        deadline: new Date("2025-12-01"),
        budget: 3000,
        managedBy: manager._id,
        badgeReward: 'Blue'
      }
    ];

    await Project.insertMany(projects);
    console.log('✅ Projects seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding projects:', error.message);
  } finally {
    mongoose.connection.close();
  }
};

seedProjects();