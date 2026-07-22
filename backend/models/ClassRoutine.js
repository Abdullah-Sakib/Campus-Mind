const mongoose = require('mongoose');

const ClassRoutineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    day: { type: String, enum: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'], required: true },
    subject: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Theory', 'Lab'], default: 'Theory' },
    room: { type: String, trim: true },
    startTime: { type: String, required: true }, // e.g. "8:30 AM"
    endTime: { type: String, required: true },
    colorTag: { type: String, default: '#6C63FF' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassRoutine', ClassRoutineSchema);
