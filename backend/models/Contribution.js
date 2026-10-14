const mongoose = require('mongoose');

const ContributionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  actionType: {
    type: String,
    enum: ['Code Upload', 'Task Completed', 'Forum Post', 'Forum Reply', 'Project Completion'],
    required: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contribution', ContributionSchema);
