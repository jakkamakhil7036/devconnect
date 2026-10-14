const ResumeData = require('../models/ResumeData');
const User = require('../models/User');
const Project = require('../models/Project');
const Contribution = require('../models/Contribution');

// @desc    Get resume data for a student user
// @route   GET /api/resume
// @access  Private
const getResumeData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find saved custom resume details
    let resume = await ResumeData.findOne({ user: userId });

    // Fetch live profile details
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch projects they contributed to
    const projects = await Project.find({
      'members.user': userId
    }).populate('members.user', 'name');

    // Get contribution score logs
    const contributions = await Contribution.find({ user: userId })
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // If no resume document exists yet, initialize a dummy one in response (don't save yet to avoid clogging DB)
    const activeResume = resume || {
      objective: 'A highly motivated student seeking a challenging role to leverage technical skills, academic knowledge, and collaborative project experiences in a professional environment.',
      education: [
        {
          school: user.collegeName || 'Current College',
          degree: 'Bachelor of Technology',
          fieldOfStudy: user.branch || 'Engineering Branch',
          startYear: '2022',
          endYear: user.year ? (2022 + parseInt(user.year.replace(/\D/g,'') || 4)).toString() : '2026',
          grade: 'A'
        }
      ],
      certifications: user.certifications || [],
      skills: user.skills || []
    };

    // Format projects list for the resume template
    const formattedProjects = projects.map(p => {
      const myRole = p.members.find(m => m.user._id.toString() === userId.toString())?.role || 'Developer';
      return {
        title: p.title,
        description: p.description,
        role: myRole,
        technologies: p.technologies,
        status: p.status
      };
    });

    // Format contributions
    const formattedContributions = contributions.map(c => ({
      actionType: c.actionType,
      projectTitle: c.project?.title || 'General',
      points: c.points,
      description: c.description,
      date: c.createdAt
    }));

    res.json({
      personalDetails: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        collegeName: user.collegeName,
        branch: user.branch,
        year: user.year,
        linkedinUrl: user.linkedinUrl,
        githubUrl: user.githubUrl,
        profilePicture: user.profilePicture
      },
      objective: activeResume.objective,
      education: activeResume.education,
      skills: activeResume.skills.length > 0 ? activeResume.skills : user.skills,
      certifications: activeResume.certifications.length > 0 ? activeResume.certifications : user.certifications,
      projects: formattedProjects,
      contributions: formattedContributions,
      contributionScore: user.contributionScore
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update custom resume data
// @route   POST /api/resume
// @access  Private
const saveResumeData = async (req, res) => {
  try {
    const { objective, education, certifications, skills } = req.body;
    const userId = req.user._id;

    let resume = await ResumeData.findOne({ user: userId });

    if (resume) {
      resume.objective = objective !== undefined ? objective : resume.objective;
      resume.education = education !== undefined ? education : resume.education;
      resume.certifications = certifications !== undefined ? certifications : resume.certifications;
      resume.skills = skills !== undefined ? skills : resume.skills;
      await resume.save();
    } else {
      resume = await ResumeData.create({
        user: userId,
        objective,
        education,
        certifications,
        skills
      });
    }

    res.json({ message: 'Resume details saved successfully', resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getResumeData, saveResumeData };
