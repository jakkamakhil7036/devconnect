const Contribution = require('../models/Contribution');
const User = require('../models/User');

const awardPoints = async (userId, projectId, actionType, description) => {
  try {
    let points = 0;
    switch (actionType) {
      case 'Code Upload':
        points = 10;
        break;
      case 'Task Completed':
        points = 5;
        break;
      case 'Forum Post':
        points = 2;
        break;
      case 'Forum Reply':
        points = 1;
        break;
      case 'Project Completion':
        points = 50;
        break;
      default:
        points = 0;
    }

    if (points === 0) return null;

    // Create contribution log
    const contribution = await Contribution.create({
      user: userId,
      project: projectId,
      points,
      actionType,
      description
    });

    // Update user score
    await User.findByIdAndUpdate(userId, {
      $inc: { contributionScore: points }
    });

    return contribution;
  } catch (error) {
    console.error(`Error awarding contribution points: ${error.message}`);
    return null;
  }
};

module.exports = { awardPoints };
