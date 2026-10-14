const Invitation = require('../models/Invitation');
const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Send a project invitation (Leader only)
// @route   POST /api/invitations
// @access  Private
const sendInvitation = async (req, res) => {
  try {
    const { projectId, email, role } = req.body;
    if (!projectId || !email || !role) {
      return res.status(400).json({ message: 'Project ID, student email, and role are required.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Verify requesting user is creator or Team Leader
    const isLeader = project.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'Team Leader'
    );
    const isOwner = project.creator.toString() === req.user._id.toString();

    if (!isOwner && !isLeader) {
      return res.status(403).json({ message: 'Unauthorized. Only project leaders can invite members.' });
    }

    // Find recipient student by email
    const recipient = await User.findOne({ email: email.toLowerCase().trim() });
    if (!recipient) {
      return res.status(404).json({ message: 'No registered student found with this email on DevConnect.' });
    }

    if (recipient.role !== 'student') {
      return res.status(400).json({ message: 'Invitations can only be sent to student accounts.' });
    }

    // Check if recipient is already a team member
    const alreadyMember = project.members.some(
      m => m.user.toString() === recipient._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'This student is already a member of the project.' });
    }

    // Check if there is already a pending invitation for this project and recipient
    const existingInvite = await Invitation.findOne({
      project: projectId,
      recipient: recipient._id,
      status: 'Pending'
    });
    if (existingInvite) {
      return res.status(400).json({ message: 'A pending invitation has already been sent to this student.' });
    }

    // Check if team is full
    if (project.members.length >= project.requiredTeamSize) {
      return res.status(400).json({ message: 'Project team is already full.' });
    }

    // Create invitation
    const invitation = await Invitation.create({
      project: projectId,
      sender: req.user._id,
      recipient: recipient._id,
      role
    });

    // Create invite notification for recipient
    await createNotification(
      recipient._id,
      `You have been invited by ${req.user.name} to join project "${project.title}" as ${role}.`,
      'invite',
      projectId,
      invitation._id
    );

    res.status(201).json({ message: 'Invitation sent successfully!', invitation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's pending invitations
// @route   GET /api/invitations
// @access  Private
const getInvitations = async (req, res) => {
  try {
    const invitations = await Invitation.find({
      recipient: req.user._id,
      status: 'Pending'
    })
      .populate('project', 'title description category')
      .populate('sender', 'name email profilePicture');

    res.json(invitations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept or Decline invitation
// @route   PUT /api/invitations/:id
// @access  Private
const respondToInvitation = async (req, res) => {
  try {
    const { action } = req.body; // 'Accept' or 'Decline'
    if (!action || !['Accept', 'Decline'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "Accept" or "Decline".' });
    }

    const invitation = await Invitation.findById(req.params.id);
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    // Verify user is the recipient
    if (invitation.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized. You are not the recipient of this invitation.' });
    }

    if (invitation.status !== 'Pending') {
      return res.status(400).json({ message: `This invitation has already been ${invitation.status.toLowerCase()}.` });
    }

    const project = await Project.findById(invitation.project);
    if (!project) {
      invitation.status = 'Declined';
      await invitation.save();
      return res.status(404).json({ message: 'Project no longer exists. Invitation declined automatically.' });
    }

    if (action === 'Accept') {
      // Check if team is already full
      if (project.members.length >= project.requiredTeamSize) {
        invitation.status = 'Declined';
        await invitation.save();
        return res.status(400).json({ message: 'Team is already full. Invitation auto-declined.' });
      }

      // Check if user is already a member
      const alreadyMember = project.members.some(
        m => m.user.toString() === req.user._id.toString()
      );
      if (alreadyMember) {
        invitation.status = 'Accepted';
        await invitation.save();
        return res.status(400).json({ message: 'You are already a member of this project.' });
      }

      // Add user to project members list
      project.members.push({
        user: req.user._id,
        role: invitation.role
      });

      // Update project status to In Progress if team is full
      if (project.members.length === project.requiredTeamSize && project.status === 'Open') {
        project.status = 'In Progress';
      }

      await project.save();

      invitation.status = 'Accepted';
      await invitation.save();

      // Create notification for sender/leader
      await createNotification(
        invitation.sender,
        `${req.user.name} accepted your invitation to join project "${project.title}" as ${invitation.role}.`,
        'join',
        project._id
      );

      // Create notification for other members about the new team member
      for (const m of project.members) {
        if (m.user.toString() !== req.user._id.toString() && m.user.toString() !== invitation.sender.toString()) {
          await createNotification(
            m.user,
            `${req.user.name} joined project "${project.title}" as ${invitation.role}.`,
            'join',
            project._id
          );
        }
      }
    } else {
      // Action is Decline
      invitation.status = 'Declined';
      await invitation.save();

      // Create decline notification for sender
      await createNotification(
        invitation.sender,
        `${req.user.name} declined your invitation to join project "${project.title}".`,
        'join',
        project._id
      );
    }

    // Mark the recipient's notification corresponding to this invitation as read
    await Notification.updateMany(
      { user: req.user._id, invitation: invitation._id },
      { $set: { read: true } }
    );

    res.json({ message: `Invitation ${action.toLowerCase()}ed successfully!`, invitation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendInvitation, getInvitations, respondToInvitation };
