const express = require('express');
const router = express.Router();
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(protect);

router.route('/').get(getDocuments).post(upload.single('file'), uploadDocument);
router.delete('/:id', deleteDocument);

module.exports = router;
