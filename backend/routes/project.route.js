const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const {
  getAllProjects,
  addProject,
  modifyProject,
  modifyUsers,
  deleteProject,
  completeProject
} = require('../controllers/project.controller');

// GET /api/project/getAllProjects
router.get('/getAllProjects',auth, getAllProjects);

// ADMIN Routes
// POST /api/project/addProject
router.post('/addProject',auth, addProject);
// PUT /api/project/modifyProject/:id
router.put('/modifyProject/:id',auth, modifyProject);
// PUT /api/project/modifyUsers/:id
router.put('/modifyUsers/:id',auth, modifyUsers);
// DELETE /api/project/deleteProject/:id
router.delete('/deleteProject/:id',auth, deleteProject);

// MANAGER Routes
// POST /api/project/completeProject/:id
router.post('/completeProject/:id',completeProject);

module.exports = router;