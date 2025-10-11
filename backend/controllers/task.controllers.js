// controllers/task.controller.js
const Task = require("../models/task.model");
const Comment = require("../models/comment.model");
const { computeBadge } = require("../utils/badge");
const mongoose = require("mongoose");

function normalizeTask(task) {
  const obj = task.toObject();
  obj.badge = computeBadge(task);

  if (obj.assigneeId && typeof obj.assigneeId === "object") {
    obj.assigneeEmail = obj.assigneeId.email;
    obj.assigneeId = obj.assigneeId._id.toString();
  } else {
    obj.assigneeEmail = null;
  }

  return obj;
}

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, priority, assigneeId, dueDate } = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
    });


    const populated = await Task.findById(task._id).populate(
      "assigneeId",
      "email"
    );


    res.status(201).json(normalizeTask(populated));
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid task id" });

    const task = await Task.findById(id).populate("assigneeId", "email");
    if (!task) return res.status(404).json({ message: "Not found" });

    const comments = await Comment.find({ taskId: id })
      .populate("authorId", "email")
      .sort({ createdAt: 1 });

    const obj = normalizeTask(task);
    res.json({ ...obj, comments });
  } catch (err) {
    next(err);
  }
};

exports.listTasks = async (req, res, next) => {
  try {
    const { assigneeId, priority, status, search } = req.query;
    const filter = {};
    if (assigneeId) filter.assigneeId = assigneeId;
    if (priority) filter.priority = priority;
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: "i" };

    const tasks = await Task.find(filter)
      .populate("assigneeId", "email")
      .sort({ createdAt: -1 });

    res.json(tasks.map(normalizeTask));
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(id, updates, {
      new: true,
    }).populate("assigneeId", "email");
    if (!task) return res.status(404).json({ message: "Not found" });

    res.json(normalizeTask(task));
  } catch (err) {
    next(err);
  }
};

exports.moveTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "status required" });

    const task = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("assigneeId", "email");
    if (!task) return res.status(404).json({ message: "Not found" });

    res.json(normalizeTask(task));
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const id = req.params.id;
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: "Not found" });

    // optional: delete related comments
    await Comment.deleteMany({ taskId: id });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
