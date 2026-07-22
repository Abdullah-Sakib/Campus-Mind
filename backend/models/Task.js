const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Assignment', 'Project', 'Exam', 'Quiz'], required: true },
    course: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'Urgent'], default: 'Medium' },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    notes: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['pending', 'submitted'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);
