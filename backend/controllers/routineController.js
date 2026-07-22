const ClassRoutine = require('../models/ClassRoutine');

const DAY_ORDER = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const timeToMinutes = (t) => {
  // "8:30 AM" -> minutes since midnight
  const match = /(\d+):(\d+)\s*(AM|PM)/i.exec(t);
  if (!match) return 0;
  let [, h, m, ap] = match;
  h = parseInt(h, 10);
  m = parseInt(m, 10);
  if (/pm/i.test(ap) && h !== 12) h += 12;
  if (/am/i.test(ap) && h === 12) h = 0;
  return h * 60 + m;
};

// @route GET /api/routine?day=Sat
const getRoutine = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.day) filter.day = req.query.day;

    let classes = await ClassRoutine.find(filter);
    classes = classes.sort((a, b) => {
      const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

    res.json({ classes });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/routine
const addClass = async (req, res, next) => {
  try {
    const { day, subject, type, room, startTime, endTime, colorTag } = req.body;

    if (!day || !subject || !startTime || !endTime) {
      return res.status(400).json({ message: 'day, subject, startTime, endTime are required' });
    }

    const newClass = await ClassRoutine.create({
      user: req.user._id,
      day,
      subject,
      type,
      room,
      startTime,
      endTime,
      colorTag,
    });

    res.status(201).json({ class: newClass });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/routine/:id
const updateClass = async (req, res, next) => {
  try {
    const updated = await ClassRoutine.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Class not found' });
    res.json({ class: updated });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/routine/:id
const deleteClass = async (req, res, next) => {
  try {
    const removed = await ClassRoutine.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!removed) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRoutine, addClass, updateClass, deleteClass };
