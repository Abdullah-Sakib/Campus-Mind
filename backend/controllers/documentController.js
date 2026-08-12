const fs = require('fs');
const path = require('path');
const Document = require('../models/Document');
const { toPublicPath, UPLOAD_DIR } = require('../middleware/upload');

const EXT_TO_TYPE = { pdf: 'pdf', jpg: 'jpg', jpeg: 'jpg', png: 'png' };

// @route GET /api/documents
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ documents });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/documents  (multipart/form-data, field name "file")
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { title, category } = req.body;
    if (!title) {
      // clean up the orphaned file since we're rejecting the request
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: 'title is required' });
    }

    const ext = path.extname(req.file.filename).replace('.', '').toLowerCase();
    const fileType = EXT_TO_TYPE[ext] || 'pdf';

    const document = await Document.create({
      user: req.user._id,
      title,
      category: category || 'Other',
      fileType,
      originalName: req.file.originalname,
      fileUrl: toPublicPath(req.file.filename),
      fileSize: req.file.size,
    });

    res.status(201).json({ document });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/documents/:id
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!document) return res.status(404).json({ message: 'Document not found' });

    const filename = path.basename(document.fileUrl);
    const filePath = path.join(UPLOAD_DIR, filename);
    fs.unlink(filePath, () => {}); // best-effort cleanup, ignore errors

    res.json({ message: 'Document removed' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };
