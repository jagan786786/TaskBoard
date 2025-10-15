const Comment = require("../models/comment.model");
const Task = require("../models/task.model");
const mongoose = require("mongoose");

exports.addComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { body } = req.body;
    const authorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(taskId))
      return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    let comment = await Comment.create({ taskId, authorId, body });

    //hfshgskghskghfsk
    console.log(comment);

    //Log to the comment to know better
    comment = await comment.populate("authorId", "email");

    // flatten author
    res.status(201).json({
      id: comment._id,
      body: comment.body,
      createdAt: comment.createdAt,
      authorEmail: comment.authorId?.email || null,
    });
  } catch (err) {
    next(err);
  }
};

exports.listComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const comments = await Comment.find({ taskId })
      .populate("authorId", "email")
      .sort({ createdAt: 1 });

    // fhsjkfhsfkhsdfksd
    console.log(comments);

    res.json(
      comments.map((c) => ({
        id: c._id,
        body: c.body,
        createdAt: c.createdAt,
        authorEmail: c.authorId?.email || null,
      }))
    );
  } catch (err) {
    next(err);
  }
};
