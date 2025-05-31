const Course = require('../models/course.model');
const User = require('../models/user.model');

const getCurrentBiMonthPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const startMonthIndex = month % 2 === 0 ? month : month - 1;
  const endMonthIndex = startMonthIndex + 1;

  return `${monthNames[startMonthIndex]}-${monthNames[endMonthIndex]} ${year}`;
};

// GET /api/course/getAllCourses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Server error while fetching courses' });
  }
};

// POST /api/course/addCourse
const addCourse = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      difficulty,
      preRequisites,
      skillsGained,
      eta,
      content,
      badgeReward
    } = req.body;

    if (!name || !description || !category || !difficulty || !eta || !content) {
      return res.status(400).json({ error: 'Missing required course fields' });
    }

    const course = new Course({
      name,
      description,
      category,
      difficulty,
      preRequisites,
      skillsGained,
      eta,
      content,
      badgeReward
    });

    await course.save();
    res.status(201).json({ message: 'Course added successfully', course });
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Server error while adding course' });
  }
};

// PUT api/course/modifyCourse/:id
const modifyCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedFields = req.body;

    const course = await Course.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    res.status(200).json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Server error while updating course' });
  }
};

// DELETE api/course/deleteCourse/:id
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Server error while deleting course' });
  }
};

// POST /api/course/enrollCourse/:userId/:courseId
// POST /api/course/enrollCourse/:userId/:courseId
const enrollCourse = async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ message: 'User or Course not found' });
    }

    const alreadyEnrolled = course.enrolledUsers.find(
      (u) => u.userId.toString() === userId
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'User already enrolled in this course' });
    }

    // Enroll user in the course
    course.enrolledUsers.push({
      userId: user._id,
      progress: 0,
      completedModules: [],
      enrolledAt: new Date()
    });

    // Get the current period
    const period = getCurrentBiMonthPeriod();
    let metric = user.performanceMetrics.find(m => m.period === period);
    if (!metric) {
      metric = {
        period,
        goals: [],
        badgesEarned: []
      };
      user.performanceMetrics.push(metric);
    }

    // Add the goal with refId pointing to the course
    const goalExists = metric.goals.find(
      goal => goal.refId.toString() === course._id.toString() && goal.mode === 'Training'
    );

    if (!goalExists) {
      metric.goals.push({
        title: course.name,
        mode: 'Training',
        description: `Complete the ${course.name} course`,
        refId: course._id, // 🔥 THIS FIXES THE ERROR
        status: 'in-progress'
      });
    }

    await course.save();
    await user.save();

    res.status(200).json({ message: 'User enrolled and goal created successfully' });

  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/course/completeModule/:userId/:courseId/:contentId
const completeModule = async (req, res) => {
  const { userId, courseId, contentId } = req.params;

  try {
    const course = await Course.findById(courseId);
    const user = await User.findById(userId);

    if (!course || !user) {
      return res.status(404).json({ message: 'User or Course not found' });
    }

    const userProgress = course.enrolledUsers.find(
      (u) => u.userId.toString() === userId
    );

    if (!userProgress) {
      return res.status(400).json({ message: 'User not enrolled in this course' });
    }

    const alreadyCompleted = userProgress.completedModules.includes(contentId);
    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Module already completed' });
    }

    // Add module to completed list
    userProgress.completedModules.push(contentId);

    const totalModules = course.content.length;
    const completedModules = userProgress.completedModules.length;

    // Update progress
    userProgress.progress = Math.round((completedModules / totalModules) * 100);

    let goalStatus = 'in-progress';

    // Check for full completion
    if (userProgress.progress === 100) {
      userProgress.completedAt = new Date();
      goalStatus = 'completed';

      const periodKey = getCurrentBiMonthPeriod();

      let metric = user.performanceMetrics.find(pm => pm.period === periodKey);
      if (!metric) {
        metric = {
          period: periodKey,
          goals: [],
          badgesEarned: []
        };
        user.performanceMetrics.push(metric);
      }

      // Update goal status if exists
      const goal = metric.goals.find(g => g.refId?.toString() === course._id.toString() && g.mode === 'Training');
      if (goal) {
        goal.status = 'completed';
        goal.completedAt = new Date();
      }

      // Add course badge
      if (course.badgeReward) {
        metric.badgesEarned.push({
          title: course.badgeReward,
          type: 'course',
          description: 'Successfully Completed the Course of ' + course.name,
          dateEarned: new Date()
        });
      }

      // Add new skills (avoid duplicates)
      if (Array.isArray(course.skillsGained)) {
        const currentSkills = new Set(user.skills.map(s => s.toLowerCase().trim()));
        for (const skill of course.skillsGained) {
          const normalized = skill.toLowerCase().trim();
          if (!currentSkills.has(normalized)) {
            user.skills.push(skill.trim());
            currentSkills.add(normalized);
          }
        }
      }
    }

    await course.save();
    await user.save();

    res.status(200).json({
      message: 'Module completed successfully',
      progress: userProgress.progress,
      goalStatus
    });

  } catch (error) {
    console.error('Complete module error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCourses,
  addCourse,
  modifyCourse,
  deleteCourse,
  enrollCourse,
  completeModule
};