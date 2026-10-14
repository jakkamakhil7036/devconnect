const express = require('express');
const router = express.Router();
const { uploadFile, getProjectFiles, downloadFile, getFileContent, updateFileContent } = require('../controllers/repositoryController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/upload', protect, upload.single('file'), uploadFile);
router.get('/project/:projectId', protect, getProjectFiles);
router.get('/download/:fileId', protect, downloadFile);
router.get('/files/:fileId/content', protect, getFileContent);
router.put('/files/:fileId/content', protect, updateFileContent);

module.exports = router;
