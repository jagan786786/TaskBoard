const mongoose = require('mongoose');

const STATUS = ['Backlog', 'In Progress', 'Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  priority: { type: String, enum: PRIORITIES, default: 'Medium' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  status: { type: String, enum: STATUS, default: 'Backlog' },
  dueDate: { type: Date, default: null }
}, { timestamps: true });

taskSchema.virtual('badge').get(function() {
  if (!this.dueDate) return 'On Track';
  if (this.status === 'Done') return 'On Track';
  const now = new Date();
  const diffMs = this.dueDate - now;
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 0) return 'Overdue';
  if (hours <= 24) return 'At Risk';
  return 'On Track';
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Task', taskSchema);
