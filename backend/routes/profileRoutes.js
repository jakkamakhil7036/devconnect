const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadAvatar, getAllStudents, deleteProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', protect, getAllStudents);
router.get('/:id', protect, getProfile);
router.put('/', protect, updateProfile);
router.delete('/', protect, deleteProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
