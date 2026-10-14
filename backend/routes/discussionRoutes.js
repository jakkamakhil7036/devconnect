const express = require('express');
const router = express.Router();
const { createPost, getProjectDiscussions, editPost, deletePost, addComment, addReply } = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createPost);
router.get('/project/:projectId', protect, getProjectDiscussions);
router.route('/:id')
  .put(protect, editPost)
  .delete(protect, deletePost);

router.post('/:id/comments', protect, addComment);
router.post('/:id/comments/:commentId/replies', protect, addReply);

module.exports = router;
