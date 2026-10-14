const Repository = require('../models/Repository');
const Project = require('../models/Project');
const path = require('path');
const fs = require('fs');
const { awardPoints } = require('../utils/contributionHelper');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Upload file to project repository
// @route   POST /api/repository/upload
// @access  Private
const uploadFile = async (req, res) => {
  try {
    const { projectId, version } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    // Create repository entry
    const repoFile = await Repository.create({
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
      version: version || '1.0.0',
      uploadedBy: req.user._id,
      project: projectId
    });

    // Award 10 points to the uploader
    await awardPoints(
      req.user._id,
      projectId,
      'Code Upload',
      `Uploaded file "${req.file.originalname}" (v${version || '1.0.0'})`
    );

    // Notify other team members
    for (const member of project.members) {
      if (member.user.toString() !== req.user._id.toString()) {
        await createNotification(
          member.user,
          `${req.user.name} uploaded a file "${req.file.originalname}" to the project repository.`,
          'upload',
          projectId
        );
      }
    }

    const populatedFile = await Repository.findById(repoFile._id).populate('uploadedBy', 'name email profilePicture');
    res.status(201).json(populatedFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all repository files for a project
// @route   GET /api/repository/project/:projectId
// @access  Private
const getProjectFiles = async (req, res) => {
  try {
    const files = await Repository.find({ project: req.params.projectId })
      .populate('uploadedBy', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download repository file
// @route   GET /api/repository/download/:fileId
// @access  Private
const downloadFile = async (req, res) => {
  try {
    const fileEntry = await Repository.findById(req.params.fileId);
    if (!fileEntry) {
      return res.status(404).json({ message: 'File entry not found in database.' });
    }

    const filePath = fileEntry.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File does not exist on server disk.' });
    }

    res.download(filePath, fileEntry.originalname);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const isTextFile = (filename) => {
  const ext = path.extname(filename).toLowerCase().replace('.', '');
  const textExtensions = ['txt', 'js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'md', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'sh', 'sql', 'xml', 'yml', 'yaml'];
  return textExtensions.includes(ext);
};

// @desc    Get file text content
// @route   GET /api/repository/files/:fileId/content
// @access  Private
const getFileContent = async (req, res) => {
  try {
    const fileEntry = await Repository.findById(req.params.fileId);
    if (!fileEntry) {
      return res.status(404).json({ message: 'File not found.' });
    }

    if (!isTextFile(fileEntry.originalname)) {
      return res.status(400).json({ message: 'Only text/code files can be viewed or edited online.' });
    }

    const filePath = fileEntry.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found on disk.' });
    }

    const content = fs.readFileSync(filePath, 'utf8');
    res.json({
      _id: fileEntry._id,
      originalname: fileEntry.originalname,
      version: fileEntry.version,
      content
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update file text content and increment version
// @route   PUT /api/repository/files/:fileId/content
// @access  Private
const updateFileContent = async (req, res) => {
  try {
    const { content, version } = req.body;
    if (content === undefined) {
      return res.status(400).json({ message: 'File content is required.' });
    }

    const fileEntry = await Repository.findById(req.params.fileId);
    if (!fileEntry) {
      return res.status(404).json({ message: 'File not found.' });
    }

    if (!isTextFile(fileEntry.originalname)) {
      return res.status(400).json({ message: 'Only text/code files can be edited.' });
    }

    const filePath = fileEntry.path;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found on disk.' });
    }

    // Write new content to disk
    fs.writeFileSync(filePath, content, 'utf8');

    // Update metadata (new size, version, and updatedBy uploader)
    const stats = fs.statSync(filePath);
    fileEntry.size = stats.size;
    if (version) {
      fileEntry.version = version;
    }
    fileEntry.uploadedBy = req.user._id;
    await fileEntry.save();

    const project = await Project.findById(fileEntry.project);

    // Award 5 points to the modifier
    await awardPoints(
      req.user._id,
      fileEntry.project,
      'Code Modification',
      `Modified file "${fileEntry.originalname}" (v${fileEntry.version})`
    );

    // Notify other team members
    if (project) {
      for (const member of project.members) {
        if (member.user.toString() !== req.user._id.toString()) {
          await createNotification(
            member.user,
            `${req.user.name} modified file "${fileEntry.originalname}" (v${fileEntry.version}) in the repository.`,
            'upload',
            fileEntry.project
          );
        }
      }
    }

    const populatedFile = await Repository.findById(fileEntry._id).populate('uploadedBy', 'name email profilePicture');
    res.json({ message: 'File updated successfully!', file: populatedFile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadFile, getProjectFiles, downloadFile, getFileContent, updateFileContent };
