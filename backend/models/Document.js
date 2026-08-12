const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['CV/Resume', 'Academic Certificate', 'Achievement Certificate', 'Course Certificate', 'Internship Certificate', 'Training Certificate', 'Other'],
      default: 'Other',
    },
    fileType: { type: String, enum: ['pdf', 'jpg', 'png'], required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true }, // relative path, e.g. /uploads/xyz.pdf
    fileSize: { type: Number, default: 0 }, // bytes
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', DocumentSchema);
