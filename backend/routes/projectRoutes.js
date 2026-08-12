const express = require('express');
const router = express.Router();
const {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  addAttachments,
  deleteAttachment,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.route('/').get(getProjects).post(addProject);
router.route('/:id').put(updateProject).delete(deleteProject);
router.post('/:id/attachments', upload.array('files', 5), addAttachments);
router.delete('/:id/attachments/:attachmentId', deleteAttachment);

module.exports = router;
