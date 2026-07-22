const express = require('express');
const router = express.Router();
const {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getGpaSummary,
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/gpa-summary', getGpaSummary);
router.route('/').get(getCourses).post(addCourse);
router.route('/:id').put(updateCourse).delete(deleteCourse);

module.exports = router;
