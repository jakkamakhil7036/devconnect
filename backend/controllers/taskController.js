const Task = require('../models/Task');
const Project = require('../models/Project');
const { awardPoints } = require('../utils/contributionHelper');
const { createNotification } = require('../utils/notificationHelper');

// Helper to update project progress percentage dynamically
const updateProjectProgress = async (projectId) => {
  try {
    const tasks = await Task.find({ project: projectId });
    if (tasks.length === 0) {
      await Project.findByIdAndUpdate(projectId, { progress: 0 });
      return;
    }

    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    const updateFields = { progress };
    if (progress === 100 && tasks.length > 0) {
      updateFields.status = 'Completed';
    } else if (progress > 0 && progress < 100) {
      updateFields.status = 'In Progress';
    }

    await Project.findByIdAndUpdate(projectId, updateFields);
  } catch (error) {
    console.error(`Error updating project progress: ${error.message}`);
  }
};

// @desc    Create a new task for a project
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Task title and project ID are required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null
    });

    await updateProjectProgress(projectId);

    // Send notification if assigned to someone
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await createNotification(
        assignedTo,
        `You have been assigned the task: "${title}" in project "${project.title}".`,
        'task',
        projectId
      );
    }

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getProjectTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate('assignedTo', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task status & award points if Completed
// @route   PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);
    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // Recalculate project progress dynamically
    await updateProjectProgress(task.project);

    // If marked completed, award points (+5 points) to the assigned user
    if (status === 'Completed' && oldStatus !== 'Completed' && task.assignedTo) {
      await awardPoints(
        task.assignedTo,
        task.project,
        'Task Completed',
        `Completed the task "${task.title}" in project "${project.title}"`
      );

      // Notify task assignee
      await createNotification(
        task.assignedTo,
        `Task "${task.title}" completed. +5 points awarded!`,
        'task',
        task.project
      );
    }

    const updatedTask = await Task.findById(task._id).populate('assignedTo', 'name email profilePicture');
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task details (title, description, assignee, dueDate, status)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTaskDetails = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo || null;
    if (dueDate !== undefined) task.dueDate = dueDate || null;
    if (status) task.status = status;

    await task.save();

    // Recalculate project progress
    await updateProjectProgress(task.project);

    const updatedTask = await Task.findById(task._id).populate('assignedTo', 'name email profilePicture');
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task and recalculate progress
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const projectId = task.project;
    await Task.findByIdAndDelete(req.params.id);

    // Recalculate project progress dynamically
    await updateProjectProgress(projectId);

    res.json({ message: 'Task deleted successfully.', projectId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign user to a task
// @route   PUT /api/tasks/:id/assign
// @access  Private
const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const project = await Project.findById(task.project);

    task.assignedTo = assignedTo || null;
    await task.save();

    if (assignedTo) {
      await createNotification(
        assignedTo,
        `You have been assigned the task: "${task.title}" in project "${project.title}".`,
        'task',
        task.project
      );
    }

    const updatedTask = await Task.findById(task._id).populate('assignedTo', 'name email profilePicture');
    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getProjectTasks, updateTaskStatus, updateTaskDetails, deleteTask, assignTask };
