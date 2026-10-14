const express = require('express');
const router = express.Router();
const { getResumeData, saveResumeData } = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getResumeData)
  .post(protect, saveResumeData);

module.exports = router;
