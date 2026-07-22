const Course = require('../models/Course');

// @route GET /api/courses?semester=4
const getCourses = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.semester) filter.semester = Number(req.query.semester);

    const courses = await Course.find(filter).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/courses
const addCourse = async (req, res, next) => {
  try {
    const { semester, courseName, creditHours, grade, status } = req.body;

    if (!semester || !courseName || !creditHours || !grade) {
      return res.status(400).json({ message: 'semester, courseName, creditHours, grade are required' });
    }
    if (!Course.GRADE_POINTS[grade]) {
      return res.status(400).json({ message: 'Invalid grade value' });
    }

    const course = await Course.create({
      user: req.user._id,
      semester,
      courseName,
      creditHours,
      grade,
      status,
    });

    res.status(201).json({ course });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/courses/:id
const updateCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/courses/:id
const deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course removed' });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/courses/gpa-summary
// Computes per-semester GPA and cumulative GPA (CGPA)
const getGpaSummary = async (req, res, next) => {
  try {
    const courses = await Course.find({ user: req.user._id });

    const bySemester = {};
    let totalCredits = 0;
    let totalPoints = 0;

    for (const c of courses) {
      const points = c.gradePointsEarned;
      totalCredits += c.creditHours;
      totalPoints += points;

      if (!bySemester[c.semester]) {
        bySemester[c.semester] = { semester: c.semester, credits: 0, points: 0, courses: [] };
      }
      bySemester[c.semester].credits += c.creditHours;
      bySemester[c.semester].points += points;
      bySemester[c.semester].courses.push(c);
    }

    const semesterSummaries = Object.values(bySemester)
      .map((s) => ({
        semester: s.semester,
        gpa: s.credits ? +(s.points / s.credits).toFixed(2) : 0,
        totalCredits: s.credits,
        courses: s.courses,
      }))
      .sort((a, b) => a.semester - b.semester);

    const cgpa = totalCredits ? +(totalPoints / totalCredits).toFixed(2) : 0;

    res.json({ cgpa, totalCredits, semesters: semesterSummaries });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCourses, addCourse, updateCourse, deleteCourse, getGpaSummary };
