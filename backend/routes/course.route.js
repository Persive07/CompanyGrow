const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
  getAllCourses,
  addCourse,
  deleteCourse,
  modifyCourse,
  enrollCourse,
  completeModule
} = require('../controllers/course.controller');

// GET /api/course/getAllCourses
router.get('/getAllCourses',auth, getAllCourses);

// ADMIN Routes
// POST /api/course/addCourse
router.post('/addCourse',auth, addCourse);
// DELETE api/course/deleteCourse/:id
router.delete('/deleteCourse/:id',auth, deleteCourse);
// PUT api/course/modifyCourse/:id
router.put('/modifyCourse/:id',auth, modifyCourse);


// EMPLOYEE Routes
// POST /api/course/enrollCourse/:userId/:courseId
router.post('/enrollCourse/:userId/:courseId',auth, enrollCourse);
// POST /api/course/completeModule/:userId/:courseId/:contentId
router.post('/completeModule/:userId/:courseId/:contentId',auth, completeModule);

module.exports = router;