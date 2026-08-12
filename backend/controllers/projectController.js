const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');
const { toPublicPath, UPLOAD_DIR } = require('../middleware/upload');

const EXT_TO_TYPE = { pdf: 'pdf', jpg: 'jpg', jpeg: 'jpg', png: 'png' };

// @route GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/projects  (JSON body)
const addProject = async (req, res, next) => {
  try {
    const { title, description, technologies, features, objectives } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'title is required' });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : (technologies || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const project = await Project.create({
      user: req.user._id,
      title,
      description,
      technologies: techArray,
      features,
      objectives,
    });

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// @route PUT /api/projects/:id  (JSON body)
const updateProject = async (req, res, next) => {
  try {
    const { title, description, technologies, features, objectives } = req.body;
    const update = { title, description, features, objectives };

    if (technologies !== undefined) {
      update.technologies = Array.isArray(technologies)
        ? technologies
        : (technologies || '')
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      update,
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // best-effort cleanup of any attached files
    for (const att of project.attachments) {
      const filename = path.basename(att.fileUrl);
      fs.unlink(path.join(UPLOAD_DIR, filename), () => {});
    }

    res.json({ message: 'Project removed' });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/projects/:id/attachments  (multipart/form-data, field name "files", multiple)
const addAttachments = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) {
      // clean up any uploaded files since the project doesn't exist / isn't theirs
      (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
      return res.status(404).json({ message: 'Project not found' });
    }

    const files = req.files || [];
    if (files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const newAttachments = files.map((file) => {
      const ext = path.extname(file.filename).replace('.', '').toLowerCase();
      return {
        fileType: EXT_TO_TYPE[ext] || 'pdf',
        originalName: file.originalname,
        fileUrl: toPublicPath(file.filename),
        fileSize: file.size,
      };
    });

    project.attachments.push(...newAttachments);
    await project.save();

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// @route DELETE /api/projects/:id/attachments/:attachmentId
const deleteAttachment = async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user._id });
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const attachment = project.attachments.id(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });

    const filename = path.basename(attachment.fileUrl);
    fs.unlink(path.join(UPLOAD_DIR, filename), () => {});

    attachment.deleteOne();
    await project.save();

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
  addAttachments,
  deleteAttachment,
};
