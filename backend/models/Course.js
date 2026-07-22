const mongoose = require('mongoose');

// Standard 4.0 grading scale
const GRADE_POINTS = {
  'A+': 4.0, A: 4.0, 'A-': 3.7,
  'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7,
  'D+': 1.3, D: 1.0, F: 0.0,
};

const CourseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    semester: { type: Number, required: true },
    courseName: { type: String, required: true, trim: true },
    creditHours: { type: Number, required: true, min: 0 },
    grade: { type: String, enum: Object.keys(GRADE_POINTS), required: true },
    status: { type: String, enum: ['on-track', 'good', 'midterm-soon', 'at-risk'], default: 'on-track' },
  },
  { timestamps: true }
);

CourseSchema.virtual('gradePoint').get(function () {
  return GRADE_POINTS[this.grade] ?? 0;
});

CourseSchema.virtual('gradePointsEarned').get(function () {
  return +(this.creditHours * (GRADE_POINTS[this.grade] ?? 0)).toFixed(2);
});

CourseSchema.set('toJSON', { virtuals: true });
CourseSchema.set('toObject', { virtuals: true });

CourseSchema.statics.GRADE_POINTS = GRADE_POINTS;

module.exports = mongoose.model('Course', CourseSchema);
