const Project = require('../models/project.model');
const User = require('../models/user.model');

// Asigning a Project to a User
const assignProjectToUser = async (userId, projectId) => {
  const user = await User.findById(userId);
  const project = await Project.findById(projectId);

  if (!user || !project) throw new Error('User or Project not found');

  // ✅ Add user to project if not already assigned
  if (!project.assignedUsers.includes(user._id)) {
    project.assignedUsers.push(user._id);
    await project.save();
  }

  const period = getCurrentBiMonthPeriod();
  let metricIndex = user.performanceMetrics.findIndex(m => m.period === period);

  if (metricIndex === -1) {
    // ✅ If period doesn't exist, add metric and initial goal with refId
    user.performanceMetrics.push({
      period,
      goals: [{
        title: project.name,
        mode: 'Project',
        description: project.description,
        status: 'in-progress',
        refId: project._id // ✅ Required
      }],
      badgesEarned: []
    });
  } else {
    const metric = user.performanceMetrics[metricIndex];
    const goalExists = metric.goals.find(
      goal => goal.refId.toString() === project._id.toString() && goal.mode === 'Project'
    );

    if (!goalExists) {
      // ✅ Push new goal with refId
      user.performanceMetrics[metricIndex].goals.push({
        title: project.name,
        mode: 'Project',
        description: project.description,
        status: 'in-progress',
        refId: project._id // ✅ Required
      });
    }
  }

  await user.save();
};

const deassignProjectFromUser = async (userId, projectId) => {
  const user = await User.findById(userId);
  const project = await Project.findById(projectId);

  if (!user || !project) throw new Error('User or Project not found');

  // Step 1: Remove project from user's performanceMetrics
  const period = getCurrentBiMonthPeriod();
  const metric = user.performanceMetrics.find(m => m.period === period);

  if (metric) {
    // Filter out the goal related to this project
    metric.goals = metric.goals.filter(
      goal => !(goal.title === project.name && goal.mode === 'Project')
    );

    // Clean up empty metric
    if (metric.goals.length === 0 && metric.badgesEarned.length === 0) {
      user.performanceMetrics = user.performanceMetrics.filter(m => m.period !== period);
    }

    await user.save();
  }

  // Step 2: Remove user from project.assignedUsers if still present
  const userIndex = project.assignedUsers.findIndex(id => id.toString() === user._id.toString());
  if (userIndex > -1) {
    project.assignedUsers.splice(userIndex, 1);
    await project.save();
  }
};

// Helper to get period string like "Jan-Feb"
const getCurrentBiMonthPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const isEvenMonth = (month + 1) % 2 === 0;
  const periodStart = isEvenMonth ? month - 1 : month;
  const periodEnd = isEvenMonth ? month : month + 1;

  const formatter = new Intl.DateTimeFormat('en', { month: 'short' });
  const startMonth = formatter.format(new Date(year, periodStart));
  const endMonth = formatter.format(new Date(year, periodEnd));

  return `${startMonth}-${endMonth} ${year}`;
};

// GET /api/project/getProject/:id
const getProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id).populate('assignedUsers', 'name email role');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.status(200).json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
};

// GET /api/project/getAllProjects
const getAllProjects = async (req, res) => {
  try {
    
    const projects = await Project.find()
      .populate('assignedUsers', 'name email role')
      .populate('managedBy', 'name email role')
      .sort({ createdAt: -1 });
    
    // Return projects in the format your frontend expects
    res.status(200).json({
      success: true,
      projects: projects,
      count: projects.length
    });
    
  } catch (error) {
    console.error('Error in getAllProjects:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch projects',
      message: error.message 
    });
  }
};

// POST /api/project/addProject
const addProject = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status, 
      priority, 
      assignedUsers, 
      deadline, 
      budget, 
      skillsRequired, 
      skillsGained, 
      badgeReward,
      managerId // Add this to destructure managerId from request
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    // Validate assigned users
    let validatedUsers = [];
    if (assignedUsers && assignedUsers.length > 0) {
      const userIds = assignedUsers.map(user => user._id || user);
      const existingUsers = await User.find({ _id: { $in: userIds } });
      validatedUsers = existingUsers.map(user => user._id);
    }

    // Validate badge reward if provided
    const validBadges = ['Green', 'Cyan', 'Blue', 'Purple', 'Red'];
    if (badgeReward && !validBadges.includes(badgeReward)) {
      return res.status(400).json({ error: 'Invalid badge reward' });
    }

    // Use managerId as managedBy (project lead)
    if (!managerId) {
      return res.status(400).json({ error: 'Project manager/lead is required' });
    }

    // Verify the manager exists
    const projectLead = await User.findById(managerId);
    if (!projectLead) {
      return res.status(400).json({ error: 'Selected project manager not found' });
    }

    const newProject = new Project({
      name,
      description,
      status: status || 'planning',
      priority: priority || 'medium',
      assignedUsers: validatedUsers,
      deadline: deadline || null,
      budget: budget || null,
      skillsRequired: skillsRequired || [],
      skillsGained: skillsGained || [],
      badgeReward: badgeReward || null,
      managedBy: managerId // Use the selected manager as project lead
    });

    const savedProject = await newProject.save();
    await savedProject.populate([
      { path: 'assignedUsers', select: 'name email role' },
      { path: 'managedBy', select: 'name email role' }
    ]);

    // Assign project to users' goals
    for (const userId of validatedUsers) {
      await assignProjectToUser(userId, savedProject._id);
    }

    res.status(201).json({
      message: 'Project created successfully',
      project: savedProject
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
};

// PUT /api/project/modifyProject/:id
const modifyProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      status, 
      priority, 
      assignedUsers, 
      deadline, 
      budget, 
      skillsRequired, 
      skillsGained, 
      badgeReward,
      managerId // Add this
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }

    if (!managerId) {
      return res.status(400).json({ error: 'Project manager/lead is required' });
    }

    // Get existing project
    const oldProject = await Project.findById(id);
    if (!oldProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Validate assigned users
    let validatedUsers = [];
    if (assignedUsers && assignedUsers.length > 0) {
      const userIds = assignedUsers.map(user => user._id || user);
      const existingUsers = await User.find({ _id: { $in: userIds } });
      validatedUsers = existingUsers.map(user => user._id);
    }

    // Validate badge reward if provided
    const validBadges = ['Green', 'Cyan', 'Blue', 'Purple', 'Red'];
    if (badgeReward && !validBadges.includes(badgeReward)) {
      return res.status(400).json({ error: 'Invalid badge reward' });
    }

    // Handle user assignment changes
    const oldUserIds = oldProject.assignedUsers.map(id => id.toString());
    const newUserIds = validatedUsers.map(id => id.toString());

    // Remove users who are no longer assigned
    const removedUserIds = oldUserIds.filter(id => !newUserIds.includes(id));
    for (const userId of removedUserIds) {
      await deassignProjectFromUser(userId, id);
    }

    // Add newly assigned users
    const addedUserIds = newUserIds.filter(id => !oldUserIds.includes(id));
    for (const userId of addedUserIds) {
      await assignProjectToUser(userId, id);
    }

    // Update project
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name,
        description,
        status,
        priority,
        assignedUsers: validatedUsers,
        deadline: deadline || null,
        budget: budget || null,
        skillsRequired: skillsRequired || [],
        skillsGained: skillsGained || [],
        badgeReward: badgeReward || null,
        managedBy: managerId // Update the project lead
      },
      { new: true }
    ).populate([
      { path: 'assignedUsers', select: 'name email role' },
      { path: 'managedBy', select: 'name email role' }
    ]);

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
};

// PUT /api/project/modifyUsers/:id
const modifyUsers = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedUsers } = req.body;

    if (!Array.isArray(assignedUsers)) {
      return res.status(400).json({ error: 'assignedUsers must be an array of user IDs' });
    }

    // Validate user IDs
    const userIds = assignedUsers.map(user => user._id || user);
    const existingUsers = await User.find({ _id: { $in: userIds } });
    const validatedUsers = existingUsers.map(user => user._id);

    // Fetch the existing project
    const oldProject = await Project.findById(id);
    if (!oldProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Compare old and new assigned users
    const oldUserIds = oldProject.assignedUsers.map(id => id.toString());
    const newUserIds = validatedUsers.map(id => id.toString());

    const removedUserIds = oldUserIds.filter(id => !newUserIds.includes(id));
    for (const userId of removedUserIds) {
      await deassignProjectFromUser(userId, id);
    }

    const addedUserIds = newUserIds.filter(id => !oldUserIds.includes(id));
    for (const userId of addedUserIds) {
      await assignProjectToUser(userId, id);
    }

    // ✅ Use findByIdAndUpdate to avoid versioning conflict
    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { assignedUsers: validatedUsers },
      { new: true }
    ).populate([
      { path: 'assignedUsers', select: 'name email role' },
      { path: 'managedBy', select: 'name email role' }
    ]);

    res.json({
      message: 'Assigned users updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Error modifying assigned users:', error);
    res.status(500).json({ error: 'Failed to update assigned users' });
  }
};

// DELETE /api/project/deleteProject/:id
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Deassign project from all assigned users
    const assignedUsers = project.assignedUsers;
    for (const userId of assignedUsers) {
      await deassignProjectFromUser(userId, id);
    }

    // Now delete the project
    await Project.findByIdAndDelete(id);

    res.json({ message: 'Project deleted successfully and users deassigned' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
};

// POST /api/project/completeProject/:id
const completeProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    project.status = 'completed';
    project.updatedAt = new Date();
    await project.save();

    const period = getCurrentBiMonthPeriod();

    // Update all assigned users
    const assignedUsers = await User.find({ _id: { $in: project.assignedUsers } });

    for (const user of assignedUsers) {
      // --- Metrics ---
      let metric = user.performanceMetrics.find(m => m.period === period);
      if (!metric) {
        metric = {
          period,
          goals: [],
          badgesEarned: []
        };
        user.performanceMetrics.push(metric);
      }

      // --- Complete goal ---
      const goal = metric.goals.find(
        g => g.refId.toString() === project._id.toString() && g.mode === 'Project'
      );

      if (goal) {
        goal.status = 'completed';
        goal.completedAt = new Date();
      }

      // --- Add badge ---
      if (project.badgeReward) {
        metric.badgesEarned.push({
          title: project.badgeReward, // assuming string like 'Red'
          type: 'project',
          description: `Successfully completed the project: ${project.name}`,
          dateEarned: new Date()
        });
      }

      // --- Add new skills (avoid duplicates) ---
      if (Array.isArray(project.skillsGained)) {
        const currentSkills = new Set(user.skills.map(skill => skill.toLowerCase().trim()));
        for (const skill of project.skillsGained) {
          const normalized = skill.toLowerCase().trim();
          if (!currentSkills.has(normalized)) {
            user.skills.push(skill.trim()); // preserve original casing
            currentSkills.add(normalized);
          }
        }
      }

      await user.save();
    }

    res.status(200).json({ message: 'Project marked as completed', project });
  } catch (error) {
    console.error('Error completing project:', error);
    res.status(500).json({ error: 'Failed to complete project' });
  }
};

module.exports = {
  getProject,
  getAllProjects,
  addProject,
  modifyProject,
  modifyUsers,
  deleteProject,
  completeProject
};