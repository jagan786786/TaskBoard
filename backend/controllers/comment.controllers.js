const Comment = require('../models/comment.model');
const Task = require('../models/task.model');
const mongoose = require('mongoose');

exports.addComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { body } = req.body;
    const authorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(taskId)) return res.status(400).json({ message: 'Invalid task id' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({ taskId, authorId, body });
    const populated = await comment.populate('authorId', 'email');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.listComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ taskId }).populate('authorId', 'email').sort({ createdAt: 1 });
    res.json(comments);
  } catch (err) {
    next(err);
  }
};
