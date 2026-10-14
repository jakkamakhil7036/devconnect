const User = require('../models/User');
const Contribution = require('../models/Contribution');

// @desc    Get leaderboard rankings
// @route   GET /api/contributions/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    // Overall Ranking
    const overallRanking = await User.find({ role: 'student' })
      .select('name email branch year collegeName contributionScore profilePicture')
      .sort({ contributionScore: -1 })
      .limit(20);

    // Weekly Ranking (simulate using contributions created within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyContributions = await Contribution.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: "$user",
          weeklyScore: { $sum: "$points" }
        }
      },
      {
        $sort: { weeklyScore: -1 }
      },
      {
        $limit: 20
      }
    ]);

    // Populate user details for weekly ranking
    const weeklyRanking = [];
    for (const item of weeklyContributions) {
      const userData = await User.findById(item._id)
        .select('name branch year profilePicture contributionScore');
      if (userData) {
        weeklyRanking.push({
          user: userData,
          weeklyScore: item.weeklyScore
        });
      }
    }

    res.json({
      overall: overallRanking,
      weekly: weeklyRanking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user contribution log history
// @route   GET /api/contributions/user/:userId
// @access  Private
const getUserContributions = async (req, res) => {
  try {
    const logs = await Contribution.find({ user: req.params.userId })
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getLeaderboard, getUserContributions };
