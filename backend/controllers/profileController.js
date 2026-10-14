const User = require('../models/User');
const Project = require('../models/Project');
const ResumeData = require('../models/ResumeData');

// @desc    Get user profile and dashboard statistics
// @route   GET /api/profile/:id
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate Dashboard Statistics
    // 1. Projects Joined
    const projectsJoined = await Project.find({
      'members.user': user._id
    });

    const projectsJoinedCount = projectsJoined.length;

    // 2. Projects Completed
    const projectsCompletedCount = projectsJoined.filter(p => p.status === 'Completed').length;

    // 3. Team Members Collaborated With
    const teamMembersSet = new Set();
    projectsJoined.forEach(project => {
      project.members.forEach(member => {
        if (member.user.toString() !== user._id.toString()) {
          teamMembersSet.add(member.user.toString());
        }
      });
    });
    const teamMembersCount = teamMembersSet.size;

    // 4. Resume Generated (Check if ResumeData document exists)
    const resumeExists = await ResumeData.findOne({ user: user._id });
    const resumeGenerated = !!resumeExists;

    res.json({
      user,
      stats: {
        projectsJoined: projectsJoinedCount,
        projectsCompleted: projectsCompletedCount,
        contributionScore: user.contributionScore || 0,
        teamMembers: teamMembersCount,
        resumeGenerated
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile details
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone !== undefined ? req.body.phone : user.phone;
      user.collegeName = req.body.collegeName !== undefined ? req.body.collegeName : user.collegeName;
      user.branch = req.body.branch !== undefined ? req.body.branch : user.branch;
      user.year = req.body.year !== undefined ? req.body.year : user.year;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      user.linkedinUrl = req.body.linkedinUrl !== undefined ? req.body.linkedinUrl : user.linkedinUrl;
      user.githubUrl = req.body.githubUrl !== undefined ? req.body.githubUrl : user.githubUrl;

      // Handle skills array
      if (req.body.skills) {
        user.skills = Array.isArray(req.body.skills)
          ? req.body.skills
          : req.body.skills.split(',').map(s => s.trim()).filter(Boolean);
      }

      // Handle certifications array
      if (req.body.certifications) {
        user.certifications = Array.isArray(req.body.certifications)
          ? req.body.certifications
          : req.body.certifications.split(',').map(c => c.trim()).filter(Boolean);
      }

      // Handle interests array
      if (req.body.interests) {
        user.interests = Array.isArray(req.body.interests)
          ? req.body.interests
          : req.body.interests.split(',').map(i => i.trim()).filter(Boolean);
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        collegeName: updatedUser.collegeName,
        branch: updatedUser.branch,
        year: updatedUser.year,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        certifications: updatedUser.certifications,
        interests: updatedUser.interests,
        linkedinUrl: updatedUser.linkedinUrl,
        githubUrl: updatedUser.githubUrl,
        profilePicture: updatedUser.profilePicture,
        contributionScore: updatedUser.contributionScore
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload user profile picture
// @route   POST /api/profile/avatar
// @access  Private
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image file.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save relative URL path for files
    const fileUrl = `/uploads/${req.file.filename}`;
    user.profilePicture = fileUrl;
    await user.save();

    res.json({
      message: 'Avatar uploaded successfully',
      profilePicture: fileUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all student profiles with search and filters
// @route   GET /api/profile
// @access  Private
const getAllStudents = async (req, res) => {
  try {
    const { search, skill, branch, year } = req.query;
    const query = { role: 'student' };

    if (branch) query.branch = { $regex: branch, $options: 'i' };
    if (year) query.year = year;
    if (skill) query.skills = { $in: [new RegExp(skill, 'i')] };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('name email branch year skills profilePicture contributionScore')
      .sort({ name: 1 });

    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user profile and cascading records
// @route   DELETE /api/profile
// @access  Private
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Delete user from MongoDB
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2. Cascade deletes / cleanup:
    // Remove user as member from any projects they joined
    await Project.updateMany(
      { 'members.user': userId },
      { $pull: { members: { user: userId } } }
    );

    // If the user was the owner of any projects, delete those projects
    await Project.deleteMany({ creator: userId });

    // Delete tasks assigned to this user (set assignedTo to null)
    const Task = require('../models/Task');
    if (Task) {
      await Task.updateMany({ assignedTo: userId }, { $set: { assignedTo: null } });
    }

    // Delete resume data
    await ResumeData.deleteMany({ user: userId });

    res.json({ message: 'Account deleted completely and successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, uploadAvatar, getAllStudents, deleteProfile };
