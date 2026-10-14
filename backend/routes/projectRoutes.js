const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProjectById, updateProject, joinProject, addTeamMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createProject)
  .get(protect, getProjects);

router.route('/:id')
  .get(protect, getProjectById)
  .put(protect, updateProject);

router.post('/:id/join', protect, joinProject);
router.post('/:id/members', protect, addTeamMember);

module.exports = router;
