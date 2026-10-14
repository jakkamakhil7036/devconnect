const Project = require('../models/Project');
const User = require('../models/User');
const Task = require('../models/Task');
const { awardPoints } = require('../utils/contributionHelper');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, technologies, requiredTeamSize, category, difficulty } = req.body;

    if (!title || !description || !requiredTeamSize || !category) {
      return res.status(400).json({ message: 'Title, description, required team size and category are required.' });
    }

    const processedTechs = Array.isArray(technologies)
      ? technologies
      : (technologies || '').split(',').map(t => t.trim()).filter(Boolean);

    const project = await Project.create({
      title,
      description,
      requiredTeamSize,
      category,
      difficulty,
      technologies: processedTechs,
      creator: req.user._id,
      members: [{
        user: req.user._id,
        role: 'Team Leader'
      }],
      progress: 0
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all projects with search and filters
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    const { search, category, difficulty, status, tech, branch, aiSearchBySkills } = req.query;

    if (aiSearchBySkills === 'true') {
      const userSkills = req.query.skills
        ? req.query.skills.split(',').map(s => s.trim()).filter(Boolean)
        : (req.user?.skills || []);

      if (userSkills.length === 0) {
        return res.json([]);
      }

      // Fetch all projects to rank/filter
      const allProjects = await Project.find({})
        .populate('creator', 'name email branch year')
        .populate('members.user', 'name email branch skills profilePicture');

      const apiKey = process.env.OPENAI_API_KEY;
      if (apiKey) {
        try {
          // Dynamic integration with OpenAI if Key is provided
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [
                {
                  role: "system",
                  content: "You are an expert AI matchmaker. Compare the student's skills with the provided project records. Return a JSON object with a 'matchedIds' array containing the MongoDB ObjectIDs of projects that are highly relevant or suitable for a student with these skills. Output strictly in JSON format: {\"matchedIds\": [\"id1\", \"id2\"]}"
                },
                {
                  role: "user",
                  content: `Student Skills: ${userSkills.join(', ')}. Project Records: ${JSON.stringify(allProjects.map(p => ({ id: p._id, title: p.title, description: p.description, technologies: p.technologies })))}`
                }
              ],
              response_format: { type: "json_object" }
            })
          });
          const data = await response.json();
          const parsed = JSON.parse(data.choices[0].message.content);
          const matchedIds = parsed.matchedIds || [];
          
          const filtered = allProjects.filter(p => matchedIds.includes(p._id.toString()));
          return res.json(filtered);
        } catch (error) {
          console.warn("OpenAI project search failed, falling back to rule-based filtering:", error.message);
        }
      }

      // Fallback matching logic: intersection of technologies or matching in title/description
      const filtered = allProjects.filter(p => {
        return p.technologies.some(t => 
          userSkills.some(skill => 
            t.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(t.toLowerCase())
          )
        ) || userSkills.some(skill => 
          p.title.toLowerCase().includes(skill.toLowerCase()) || 
          p.description.toLowerCase().includes(skill.toLowerCase())
        );
      });

      return res.json(filtered);
    }

    const query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;
    if (tech) query.technologies = { $in: [new RegExp(tech, 'i')] };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } }
      ];
    }

    // Branch filter: projects created by users of a specific branch
    if (branch) {
      const usersInBranch = await User.find({ branch: { $regex: branch, $options: 'i' } }).select('_id');
      const userIds = usersInBranch.map(u => u._id);
      query.creator = { $in: userIds };
    }

    const projects = await Project.find(query)
      .populate('creator', 'name email branch year')
      .populate('members.user', 'name email branch skills profilePicture')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('creator', 'name email branch year linkedinUrl githubUrl')
      .populate('members.user', 'name email branch skills profilePicture contributionScore');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the creator or a leader
    const isLeader = project.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'Team Leader'
    );

    if (project.creator.toString() !== req.user._id.toString() && !isLeader) {
      return res.status(403).json({ message: 'Unauthorized, only project leaders can edit details.' });
    }

    const oldStatus = project.status;
    const { title, description, technologies, requiredTeamSize, category, difficulty, status, progress } = req.body;

    project.title = title || project.title;
    project.description = description || project.description;
    project.requiredTeamSize = requiredTeamSize || project.requiredTeamSize;
    project.category = category || project.category;
    project.difficulty = difficulty || project.difficulty;
    project.status = status || project.status;
    project.progress = progress !== undefined ? progress : project.progress;

    if (technologies) {
      project.technologies = Array.isArray(technologies)
        ? technologies
        : technologies.split(',').map(t => t.trim()).filter(Boolean);
    }

    const updatedProject = await project.save();

    // Trigger Point System on Completion
    if (status === 'Completed' && oldStatus !== 'Completed') {
      // Award 50 points to each project team member
      for (const member of project.members) {
        await awardPoints(
          member.user,
          project._id,
          'Project Completion',
          `Successfully completed the project "${project.title}" as ${member.role}`
        );

        // Notify member
        await createNotification(
          member.user,
          `Congratulations! Your project "${project.title}" has been completed! +50 Points awarded.`,
          'complete',
          project._id
        );
      }
    }

    res.json(updatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join a project team
// @route   POST /api/projects/:id/join
// @access  Private
const joinProject = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ message: 'Please select a role to join.' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot join a completed project.' });
    }

    // Check if user is already a member
    const userAlreadyMember = project.members.some(
      m => m.user.toString() === req.user._id.toString()
    );

    if (userAlreadyMember) {
      return res.status(400).json({ message: 'You are already a member of this project.' });
    }

    // Check if team size limit exceeded
    if (project.members.length >= project.requiredTeamSize) {
      return res.status(400).json({ message: 'Team is already full.' });
    }

    project.members.push({
      user: req.user._id,
      role
    });

    // If team has reached limit, we can auto change status to In Progress
    if (project.members.length === project.requiredTeamSize && project.status === 'Open') {
      project.status = 'In Progress';
    }

    await project.save();

    // Create notifications for all other members
    const joiner = await User.findById(req.user._id);
    for (const m of project.members) {
      if (m.user.toString() !== req.user._id.toString()) {
        await createNotification(
          m.user,
          `${joiner.name} joined your project "${project.title}" as ${role}.`,
          'join',
          project._id
        );
      }
    }

    // Return the updated project details
    const populatedProject = await Project.findById(project._id)
      .populate('creator', 'name email branch year')
      .populate('members.user', 'name email branch skills profilePicture contributionScore');

    res.json(populatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a team member (Leader only)
// @route   POST /api/projects/:id/members
// @access  Private
const addTeamMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and role are required.' });
    }

    const targetProject = await Project.findById(req.params.id);
    if (!targetProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Check if requesting user is project creator or has Team Leader role in the project
    const isLeader = targetProject.members.some(
      m => m.user.toString() === req.user._id.toString() && m.role === 'Team Leader'
    );
    const isOwner = targetProject.creator.toString() === req.user._id.toString();

    if (!isOwner && !isLeader) {
      return res.status(403).json({ message: 'Unauthorized. Only project leaders can manually add members.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Target student not found.' });
    }

    // Check if target user is already a member
    const alreadyMember = targetProject.members.some(
      m => m.user.toString() === userId.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'Student is already a member of this project.' });
    }

    // Check if team is full
    if (targetProject.members.length >= targetProject.requiredTeamSize) {
      return res.status(400).json({ message: 'Team is already full.' });
    }

    // Add member
    targetProject.members.push({
      user: userId,
      role
    });

    // Auto update status to In Progress if team is full
    if (targetProject.members.length === targetProject.requiredTeamSize && targetProject.status === 'Open') {
      targetProject.status = 'In Progress';
    }

    await targetProject.save();

    // Create notification for the added user
    await createNotification(
      userId,
      `You have been added to the project "${targetProject.title}" as ${role} by the Team Leader.`,
      'join',
      targetProject._id
    );

    // Return populated project
    const populatedProject = await Project.findById(targetProject._id)
      .populate('creator', 'name email branch year')
      .populate('members.user', 'name email branch skills profilePicture contributionScore');

    res.json(populatedProject);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createProject, getProjects, getProjectById, updateProject, joinProject, addTeamMember };
