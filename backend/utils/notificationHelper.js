const Notification = require('../models/Notification');

const createNotification = async (userId, content, type, projectId = null, invitationId = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      content,
      type,
      project: projectId,
      invitation: invitationId
    });
    return notification;
  } catch (error) {
    console.error(`Error creating notification: ${error.message}`);
    return null;
  }
};

module.exports = { createNotification };
