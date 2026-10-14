const express = require('express');
const router = express.Router();
const { recommendProjects, suggestProjects } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, recommendProjects);
router.get('/suggest', protect, suggestProjects);

module.exports = router;
