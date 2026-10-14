const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user suspension (Admin only)
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot suspend another administrator account.' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      message: `User account has been successfully ${user.isSuspended ? 'suspended' : 'activated'}.`,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user account (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an administrator account.' });
    }

    await user.deleteOne();
    res.json({ message: 'User account permanently deleted.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects (Admin only)
// @route   GET /api/admin/projects
// @access  Private/Admin
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete project (Admin only)
// @route   DELETE /api/admin/projects/:id
// @access  Private/Admin
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project permanently removed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics statistics (Admin only)
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const activeProjects = await Project.countDocuments({ status: { $in: ['Open', 'In Progress'] } });
    const completedProjects = await Project.countDocuments({ status: 'Completed' });

    // Calculate most popular technologies
    const allProjects = await Project.find({}).select('technologies');
    const techCounts = {};
    allProjects.forEach(p => {
      p.technologies.forEach(t => {
        const cleaned = t.trim();
        if (cleaned) {
          techCounts[cleaned] = (techCounts[cleaned] || 0) + 1;
        }
      });
    });

    // Sort technologies by count
    const popularTechs = Object.entries(techCounts)
      .map(([tech, count]) => ({ tech, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate Branch Distribution
    const branchStats = await User.aggregate([
      { $match: { role: 'student', branch: { $ne: '' } } },
      { $group: { _id: "$branch", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      metrics: {
        totalUsers,
        activeProjects,
        completedProjects
      },
      popularTechs,
      branchStats: branchStats.map(item => ({ branch: item._id, count: item.count }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  suspendUser,
  deleteUser,
  getAllProjects,
  deleteProject,
  getAnalytics
};
