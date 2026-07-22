const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    tag: { type: String, required: true, trim: true },
    content: { type: String, default: '' },
    pages: { type: Number, default: 1 },
    sharedWithClassmates: { type: Boolean, default: false },
    sharedCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Note', NoteSchema);
