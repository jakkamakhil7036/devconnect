const express = require('express');
const router = express.Router();
const { sendInvitation, getInvitations, respondToInvitation } = require('../controllers/invitationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, sendInvitation)
  .get(protect, getInvitations);

router.route('/:id')
  .put(protect, respondToInvitation);

module.exports = router;
