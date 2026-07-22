const express = require('express');
const router = express.Router();
const { getRoutine, addClass, updateClass, deleteClass } = require('../controllers/routineController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getRoutine).post(addClass);
router.route('/:id').put(updateClass).delete(deleteClass);

module.exports = router;
