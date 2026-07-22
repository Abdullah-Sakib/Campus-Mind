const ClassRoutine = require('../models/ClassRoutine');
const Task = require('../models/Task');
const Course = require('../models/Course');

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// @route GET /api/home/dashboard
// Aggregates today's classes, upcoming deadlines, GPA, and due-today count
const getDashboard = async (req, res, next) => {
  try {
    const today = new Date();
    const todayName = DAY_NAMES[today.getDay()];

    const todaysClasses = await ClassRoutine.find({ user: req.user._id, day: todayName });

    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(new Date(startOfToday).setHours(23, 59, 59, 999));

    const dueTodayCount = await Task.countDocuments({
      user: req.user._id,
      status: 'pending',
      dueDate: { $gte: startOfToday, $lte: endOfToday },
    });

    const upcomingDeadlines = await Task.find({
      user: req.user._id,
      status: 'pending',
    })
      .sort({ dueDate: 1 })
      .limit(5);

    const courses = await Course.find({ user: req.user._id });
    let totalCredits = 0;
    let totalPoints = 0;
    for (const c of courses) {
      totalCredits += c.creditHours;
      totalPoints += c.gradePointsEarned;
    }
    const currentGpa = totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;

    res.json({
      user: {
        fullName: req.user.fullName,
        semester: req.user.semester,
        department: req.user.department,
      },
      date: new Date(),
      currentGpa,
      dueTodayCount,
      todaysClasses,
      upcomingDeadlines,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
