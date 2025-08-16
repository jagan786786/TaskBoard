function computeBadge(task) {
  if (!task.dueDate) return 'On Track';
  if (task.status === 'Done') return 'On Track';
  const due = new Date(task.dueDate);
  const now = new Date();
  const diffMs = due - now;
  const hours = diffMs / (1000 * 60 * 60);
  if (hours < 0) return 'Overdue';
  if (hours <= 24) return 'At Risk';
  return 'On Track';
}

module.exports = { computeBadge };
