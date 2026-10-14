const express = require('express');
const router = express.Router();
const { getAllUsers, suspendUser, deleteUser, getAllProjects, deleteProject, getAnalytics } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Secure all admin routes with protect and adminOnly
router.use(protect);
router.use(adminOnly);

router.get('/users', getAllUsers);
router.put('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);

router.get('/projects', getAllProjects);
router.delete('/projects/:id', deleteProject);

router.get('/analytics', getAnalytics);

module.exports = router;
