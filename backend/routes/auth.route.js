const express = require('express');
const router = express.Router();
const { loginUser, logoutUser } = require('../controllers/auth.controller');

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/logout
router.post('/logout', logoutUser);

module.exports = router;