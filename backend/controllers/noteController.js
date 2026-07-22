const Note = require('../models/Note');

// @route GET /api/notes?tag=Compiler
const getNotes = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.tag && req.query.tag !== 'All') filter.tag = req.query.tag;

    const notes = await Note.find(filter).sort({ updatedAt: -1 });
    res.json({ notes });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/notes
const addNote = async (req, res, next) => {
  try {
    const { title, tag, content, pages, sharedWithClassmates } = req.body;

    if (!title || !tag) {
      return res.status(400).json({ message: 'title and tag are required' });
    }

    const note = await Note.create({
      user: req.user._id,
      title,
      tag,
      content,
      pages,
      sharedWithClassmates,
    });

    res.status(201).json({ note });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/notes/:id
const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ note });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/notes/:id
const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotes, addNote, updateNote, deleteNote };
