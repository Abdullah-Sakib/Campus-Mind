const express = require('express');
const router = express.Router();
const { getTasks, addTask, updateTask, deleteTask, setTaskStatus } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getTasks).post(addTask);
router.route('/:id').put(updateTask).delete(deleteTask);
router.patch('/:id/status', setTaskStatus);

module.exports = router;
