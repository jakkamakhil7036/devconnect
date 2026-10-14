const { getAIRecommendations, generateSearchSuggestions } = require('../utils/aiRecommender');

// @desc    Get project recommendations based on skills, interests, and branch
// @route   POST /api/ai/recommend
// @access  Private
const recommendProjects = async (req, res) => {
  try {
    const { skills, interests, branch } = req.body;

    const recommendations = await getAIRecommendations(skills, interests, branch);
    
    res.json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project search suggestions matching a search term (ChatGPT/Gemini style)
// @route   GET /api/ai/suggest
// @access  Private
const suggestProjects = async (req, res) => {
  try {
    const { query } = req.query;
    const branch = req.user?.branch || '';

    const suggestions = await generateSearchSuggestions(query, branch);
    
    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { recommendProjects, suggestProjects };
