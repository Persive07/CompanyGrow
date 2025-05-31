const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { approveBadges,createBonusSession, getSessionDetails } = require('../controllers/payment.controller');

router.post('/create-bonus-session',auth, createBonusSession);

// Route: GET /api/payment/session/:sessionId
router.get('/session/:sessionId',auth, getSessionDetails);

// POST /api/payment/approve-badges
router.post('/approve-badges',auth,approveBadges);


module.exports = router;
