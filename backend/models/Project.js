const mongoose = require('mongoose');

const AttachmentSchema = new mongoose.Schema(
  {
    fileType: { type: String, enum: ['pdf', 'jpg', 'png'], required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ProjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    technologies: [{ type: String, trim: true }],
    features: { type: String, trim: true, default: '' },
    objectives: { type: String, trim: true, default: '' },
    attachments: [AttachmentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Project', ProjectSchema);
