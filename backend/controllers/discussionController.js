const Discussion = require('../models/Discussion');
const Project = require('../models/Project');
const { awardPoints } = require('../utils/contributionHelper');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create a new discussion post
// @route   POST /api/discussions
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, projectId } = req.body;

    if (!title || !content || !projectId) {
      return res.status(400).json({ message: 'Title, content and project ID are required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const discussion = await Discussion.create({
      project: projectId,
      user: req.user._id,
      title,
      content,
      comments: []
    });

    // Award 2 points for Forum Post
    await awardPoints(
      req.user._id,
      projectId,
      'Forum Post',
      `Posted in discussion forum: "${title}"`
    );

    // Notify other members of a new post
    for (const member of project.members) {
      if (member && member.user) {
        const memberUserId = (member.user._id || member.user).toString();
        if (memberUserId !== req.user._id.toString()) {
          await createNotification(
            member.user._id || member.user,
            `${req.user.name} created a new discussion: "${title}".`,
            'comment',
            projectId
          );
        }
      }
    }

    const populatedDisc = await Discussion.findById(discussion._id)
      .populate('user', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture')
      .populate('comments.replies.user', 'name email profilePicture');

    res.status(201).json(populatedDisc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all discussions for a project (with optional search)
// @route   GET /api/discussions/project/:projectId
// @access  Private
const getProjectDiscussions = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { project: req.params.projectId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const discussions = await Discussion.find(query)
      .populate('user', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture')
      .populate('comments.replies.user', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(discussions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit a discussion post
// @route   PUT /api/discussions/:id
// @access  Private
const editPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion post not found.' });
    }

    const discUserId = (discussion.user?._id || discussion.user)?.toString();
    if (discUserId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You can only edit your own posts.' });
    }

    discussion.title = title || discussion.title;
    discussion.content = content || discussion.content;
    await discussion.save();

    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture')
      .populate('comments.replies.user', 'name email profilePicture');

    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a discussion post
// @route   DELETE /api/discussions/:id
// @access  Private
const deletePost = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion post not found.' });
    }

    const discUserId = (discussion.user?._id || discussion.user)?.toString();
    if (discUserId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized. You can only delete your own posts.' });
    }

    await discussion.deleteOne();
    res.json({ message: 'Discussion post removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to a discussion post
// @route   POST /api/discussions/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required.' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion post not found.' });
    }

    discussion.comments.push({
      user: req.user._id,
      content,
      replies: []
    });

    await discussion.save();

    // Award 1 point for Comment
    await awardPoints(
      req.user._id,
      discussion.project,
      'Forum Reply', // mapping Forum Reply to replies/comments
      `Commented on discussion: "${discussion.title}"`
    );

    // Notify post creator
    if (discussion.user) {
      const discUserId = (discussion.user._id || discussion.user).toString();
      if (discUserId !== req.user._id.toString()) {
        await createNotification(
          discussion.user._id || discussion.user,
          `${req.user.name} commented on your post "${discussion.title}".`,
          'comment',
          discussion.project
        );
      }
    }

    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture')
      .populate('comments.replies.user', 'name email profilePicture');

    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add reply to a comment
// @route   POST /api/discussions/:id/comments/:commentId/replies
// @access  Private
const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Reply content is required.' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ message: 'Discussion post not found.' });
    }

    const comment = discussion.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    comment.replies.push({
      user: req.user._id,
      content
    });

    await discussion.save();

    // Award 1 point for Reply
    await awardPoints(
      req.user._id,
      discussion.project,
      'Forum Reply',
      `Replied to comment on: "${discussion.title}"`
    );

    // Notify comment creator
    if (comment.user) {
      const commentUserId = (comment.user._id || comment.user).toString();
      if (commentUserId !== req.user._id.toString()) {
        await createNotification(
          comment.user._id || comment.user,
          `${req.user.name} replied to your comment in "${discussion.title}".`,
          'comment',
          discussion.project
        );
      }
    }

    const populated = await Discussion.findById(discussion._id)
      .populate('user', 'name email profilePicture')
      .populate('comments.user', 'name email profilePicture')
      .populate('comments.replies.user', 'name email profilePicture');

    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPost, getProjectDiscussions, editPost, deletePost, addComment, addReply };

