// routes/user.route.js
const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
  getAllUsers,
  getProfile,
  modifyProfile,
  getUserPerf,
  addUser,
  deleteUser,
  getUserCourses,
  getCourseStatus,
  getUserProjects
} = require('../controllers/user.controller');

// GET /api/user/getAllUsers
router.get('/getAllUsers',auth, getAllUsers);
// GET /api/user/getProfile/:id
router.get('/getProfile/:id',auth, getProfile);
// PUT /api/user/modifyProfile/:id
router.put('/modifyProfile/:id',auth, modifyProfile);
// GET /api/user/getUserPerf/:id
router.get('/getUserPerf/:id',auth, getUserPerf);

// ADMIN Routes
// POST /api/user/addUser
router.post('/addUser',auth, addUser);
// DELETE /api/user/deleteUser/:id
router.delete('/deleteUser/:id',auth, deleteUser);

// EMPLOYEE Routes
// GET /api/user/getUserCourses/:id
router.get('/getUserCourses/:id',auth, getUserCourses);
// GET /api/user/getCourseStatus/:userId/:courseId
router.get('/getCourseStatus/:userId/:courseId',auth, getCourseStatus);
// GET /api/user/getUserProjects/:id
router.get('/getUserProjects/:id',auth, getUserProjects);

module.exports = router;