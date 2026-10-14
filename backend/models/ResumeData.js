const mongoose = require('mongoose');

const EducationSchema = new mongoose.Schema({
  school: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startYear: { type: String },
  endYear: { type: String },
  grade: { type: String }
});

const ResumeDataSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  objective: {
    type: String,
    default: 'A highly motivated student seeking a challenging role to leverage technical skills, academic knowledge, and collaborative project experiences in a professional environment.'
  },
  education: [EducationSchema],
  certifications: {
    type: [String],
    default: []
  },
  skills: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResumeData', ResumeDataSchema);
