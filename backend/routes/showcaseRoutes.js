const express = require('express');
const router = express.Router();
const { createShowcase, getShowcases, likeShowcase, commentShowcase } = require('../controllers/showcaseController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .post(protect, upload.array('screenshots', 5), createShowcase)
  .get(protect, getShowcases);

router.put('/:id/like', protect, likeShowcase);
router.post('/:id/comments', protect, commentShowcase);

module.exports = router;
