import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  X,
  Calendar,
  User,
  MessageSquare,
  Send,
  Edit2,
  Save,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { Task, Comment, User as UserType } from "../types";

const API_BASE_URL = "https://taskboard-onzv.onrender.com/api";

interface TaskModalProps {
  task: Task | null;
  users: UserType[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  task,
  users,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTask, setEditTask] = useState<Partial<Task>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getAssigneeEmail = (assigneeId: string | null): string | null => {
    if (!assigneeId) return null;
    const assignee = users.find((user) => user.id === assigneeId);
    return assignee?.email || null;
  };

  useEffect(() => {
    if (task) {
      setEditTask({
        ...task,
        assigneeId: task.assigneeId ?? null,
      });
      loadComments();
    }
  }, [task]);

  const loadComments = async () => {
    if (!task) return;
    try {
      const res = await fetch(`${API_BASE_URL}/comment/${task.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        credentials: "include",
      });
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const handleSave = async () => {
    if (!task || !editTask.title) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/task/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(editTask),
        credentials: "include",
      });

      const updatedTask = await res.json();
      onUpdate(updatedTask);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (confirm("Are you sure you want to delete this task?")) {
      onDelete(task.id);
      onClose();

      try {
        const res = await fetch(`${API_BASE_URL}/task/${task.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to delete task");
        }
      } catch (error) {
        console.error("Failed to delete task:", error);
        alert("Delete failed. Please refresh.");
      }
    }
  };

  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;

    try {
      const res = await fetch(`${API_BASE_URL}/comment/${task.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ body: newComment.trim() }),
        credentials: "include",
      });
      const comment = await res.json();
      setComments([...comments, comment]);
      setNewComment("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  if (!task) return null;

  const priorityConfig = {
    High: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: AlertCircle,
      dot: "bg-red-400",
    },
    Medium: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
      dot: "bg-amber-400",
    },
    Low: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2,
      dot: "bg-emerald-400",
    },
  };

  const statusConfig = {
    Backlog: { bg: "bg-gray-100", text: "text-gray-700" },
    "In Progress": { bg: "bg-blue-100", text: "text-blue-700" },
    Review: { bg: "bg-amber-100", text: "text-amber-700" },
    Done: { bg: "bg-emerald-100", text: "text-emerald-700" },
  };

  const currentAssigneeEmail = getAssigneeEmail(task.assigneeId);
  const priorityIconComponent = priorityConfig[task.priority].icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200/50">
        {/* Header */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium border ${
                  statusConfig[task.status].bg
                } ${statusConfig[task.status].text}`}
              >
                {task.status}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Task Details</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isEditing
                    ? "bg-indigo-100 text-indigo-600 ring-2 ring-indigo-500/20"
                    : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <div className="w-px h-8 bg-gray-200"></div>
              <button
                onClick={onClose}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="px-8 py-6 space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editTask.title || ""}
                  onChange={(e) =>
                    setEditTask({ ...editTask, title: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50"
                  placeholder="Enter task title"
                />
              ) : (
                <h3 className="text-2xl font-bold text-gray-900">
                  {task.title}
                </h3>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              {isEditing ? (
                <textarea
                  value={editTask.description || ""}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50 resize-none"
                  placeholder="Enter task description..."
                />
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {task.description || "No description provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Priority
                </label>
                {isEditing ? (
                  <select
                    value={editTask.priority || "Medium"}
                    onChange={(e) =>
                      setEditTask({
                        ...editTask,
                        priority: e.target.value as Task["priority"],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                ) : (
                  <div
                    className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium border ${
                      priorityConfig[task.priority].bg
                    } ${priorityConfig[task.priority].text} ${
                      priorityConfig[task.priority].border
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        priorityConfig[task.priority].dot
                      } mr-2`}
                    ></div>
                    {React.createElement(priorityIconComponent, {
                      className: "w-4 h-4 mr-2",
                    })}
                    {task.priority}
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Assignee
                </label>
                {isEditing ? (
                  <select
                    value={editTask.assigneeId || ""}
                    onChange={(e) =>
                      setEditTask({
                        ...editTask,
                        assigneeId: e.target.value || null, // ✅ keep string
                      })
                    }
                  >
                    <option value="">Unassigned</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.email}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center px-4 py-2.5 bg-gray-50 rounded-xl">
                    {currentAssigneeEmail ? (
                      <>
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {currentAssigneeEmail
                              ? currentAssigneeEmail.charAt(0).toUpperCase()
                              : "?"}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {currentAssigneeEmail.split("@")[0]}
                          </p>
                          <p className="text-xs text-gray-500">
                            {currentAssigneeEmail}
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5 mr-3 text-gray-400" />
                        <span className="text-gray-500">Unassigned</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Due Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={
                      editTask.dueDate ? editTask.dueDate.split("T")[0] : ""
                    }
                    onChange={(e) =>
                      setEditTask({
                        ...editTask,
                        dueDate: e.target.value || null,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50"
                  />
                ) : (
                  <div className="flex items-center px-4 py-2.5 bg-gray-50 rounded-xl">
                    <Calendar className="w-5 h-5 mr-3 text-gray-400" />
                    <span className="text-gray-700 font-medium">
                      {task.dueDate
                        ? format(new Date(task.dueDate), "EEEE, MMM dd, yyyy")
                        : "No due date"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Actions */}
            {isEditing && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditTask(task);
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all flex items-center shadow-lg"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {/* Comments Section */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-3 text-indigo-600" />
                Comments ({comments.length})
              </h4>

              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-gray-50/50 rounded-2xl p-6 border border-gray-200/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {comment.authorEmail
                              ? comment.authorEmail.charAt(0).toUpperCase()
                              : "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {comment.authorEmail
                              ? comment.authorEmail.split("@")[0]
                              : "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {comment.authorEmail || "No email"}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-lg">
                        {format(
                          new Date(comment.createdAt),
                          "MMM dd, yyyy 'at' HH:mm"
                        )}
                      </span>
                    </div>
                    <p className="text-gray-700 pl-11">{comment.body}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No comments yet</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Start the conversation
                    </p>
                  </div>
                )}
              </div>

              {/* Add Comment */}
              <div className="bg-white rounded-2xl border border-gray-200/50 p-4">
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-medium">Y</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleAddComment()
                      }
                    />
                  </div>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all flex items-center shadow-lg flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
