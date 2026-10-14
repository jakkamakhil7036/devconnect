const express = require('express');
const router = express.Router();
const { 
  createTask, 
  getProjectTasks, 
  updateTaskStatus, 
  updateTaskDetails, 
  deleteTask, 
  assignTask 
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getProjectTasks);
router.put('/:id/status', protect, updateTaskStatus);
router.put('/:id/assign', protect, assignTask);
router.put('/:id', protect, updateTaskDetails);
router.delete('/:id', protect, deleteTask);

module.exports = router;
