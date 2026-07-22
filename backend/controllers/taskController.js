const Task = require('../models/Task');

// @route GET /api/tasks?status=pending
const getTasks = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.status && req.query.status !== 'All' && req.query.status !== 'all') {
      filter.status = req.query.status.toLowerCase();
    }
    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/tasks
const addTask = async (req, res, next) => {
  try {
    const { title, type, course, dueDate, priority, progress, notes } = req.body;

    if (!title || !type || !course || !dueDate) {
      return res.status(400).json({ message: 'title, type, course, dueDate are required' });
    }

    const task = await Task.create({
      user: req.user._id,
      title,
      type,
      course,
      dueDate,
      priority,
      progress,
      notes,
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTasks, addTask, updateTask, deleteTask };
