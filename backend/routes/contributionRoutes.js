const express = require('express');
const router = express.Router();
const { getLeaderboard, getUserContributions } = require('../controllers/contributionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/leaderboard', protect, getLeaderboard);
router.get('/user/:userId', protect, getUserContributions);

module.exports = router;
