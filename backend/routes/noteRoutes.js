const express = require('express');
const router = express.Router();
const { getNotes, addNote, updateNote, deleteNote } = require('../controllers/noteController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getNotes).post(addNote);
router.route('/:id').put(updateNote).delete(deleteNote);

module.exports = router;
