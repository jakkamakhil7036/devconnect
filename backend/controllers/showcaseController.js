const ShowcaseProject = require('../models/ShowcaseProject');
const Project = require('../models/Project');

// @desc    Publish a project to showcase
// @route   POST /api/showcases
// @access  Private
const createShowcase = async (req, res) => {
  try {
    const { projectId, title, description, videoLink, githubLink, technologies } = req.body;

    if (!projectId || !title || !description) {
      return res.status(400).json({ message: 'Project ID, title and description are required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Verify showcase doesn't already exist for this project
    const existingShowcase = await ShowcaseProject.findOne({ project: projectId });
    if (existingShowcase) {
      return res.status(400).json({ message: 'This project is already showcased.' });
    }

    // Collect team members ObjectIds
    const teamMemberIds = project.members.map(m => m.user);

    // Collect technologies
    const techArray = technologies 
      ? (Array.isArray(technologies) ? technologies : technologies.split(',').map(t => t.trim()))
      : project.technologies;

    // Handle files if uploaded
    let screenshots = [];
    if (req.files) {
      screenshots = req.files.map(f => `/uploads/${f.filename}`);
    }

    const showcase = await ShowcaseProject.create({
      project: projectId,
      title,
      description,
      teamMembers: teamMemberIds,
      technologies: techArray,
      videoLink: videoLink || '',
      githubLink: githubLink || '',
      screenshots,
      likes: [],
      comments: []
    });

    res.status(201).json(showcase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all showcases (with trending, search, and details)
// @route   GET /api/showcases
// @access  Private
const getShowcases = async (req, res) => {
  try {
    const { search, trending } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 }; // default: newest

    if (trending === 'true') {
      // Sort by length of likes array descending or trending boolean
      sortOption = { likesCount: -1, createdAt: -1 };
    }

    // Mongoose aggregation or find with virtual count
    const showcases = await ShowcaseProject.aggregate([
      { $match: query },
      {
        $addFields: {
          likesCount: { $size: "$likes" }
        }
      },
      { $sort: sortOption }
    ]);

    // Populate the showcases data manually since aggregate doesn't automatically populate
    const populatedShowcases = await ShowcaseProject.populate(showcases, [
      { path: 'teamMembers', select: 'name email profilePicture branch' },
      { path: 'comments.user', select: 'name email profilePicture' }
    ]);

    res.json(populatedShowcases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like or unlike a showcase project
// @route   PUT /api/showcases/:id/like
// @access  Private
const likeShowcase = async (req, res) => {
  try {
    const showcase = await ShowcaseProject.findById(req.params.id);
    if (!showcase) {
      return res.status(404).json({ message: 'Showcase project not found.' });
    }

    const userId = req.user._id;
    const alreadyLiked = showcase.likes.includes(userId);

    if (alreadyLiked) {
      // Remove like
      showcase.likes = showcase.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Add like
      showcase.likes.push(userId);
    }

    await showcase.save();

    const updated = await ShowcaseProject.findById(showcase._id)
      .populate('teamMembers', 'name email profilePicture branch')
      .populate('comments.user', 'name email profilePicture');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Comment on a showcase project
// @route   POST /api/showcases/:id/comments
// @access  Private
const commentShowcase = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const showcase = await ShowcaseProject.findById(req.params.id);
    if (!showcase) {
      return res.status(404).json({ message: 'Showcase project not found.' });
    }

    showcase.comments.push({
      user: req.user._id,
      content
    });

    await showcase.save();

    const updated = await ShowcaseProject.findById(showcase._id)
      .populate('teamMembers', 'name email profilePicture branch')
      .populate('comments.user', 'name email profilePicture');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createShowcase, getShowcases, likeShowcase, commentShowcase };
