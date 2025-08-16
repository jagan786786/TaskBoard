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
} from "lucide-react";
import type { Task, Comment, User as UserType } from "../types";

const API_BASE_URL = "http://localhost:4000/api";

interface TaskModalProps {
  task: Task | null;
  users: UserType[];
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: number) => void;
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

  // Helper function to get assignee email from users array
  const getAssigneeEmail = (assigneeId: number | null): string | null => {
    if (!assigneeId) return null;
    const assignee = users.find(user => user.id === assigneeId);
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
      try {
        await fetch(`${API_BASE_URL}/task/${task.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getToken("token")}` },
          credentials: "include",
        });
        onDelete(task.id);
        onClose();
      } catch (error) {
        console.error("Failed to delete task:", error);
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

  const priorityColors = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-green-100 text-green-800 border-green-200",
  };

  // Get the current assignee email
  const currentAssigneeEmail = getAssigneeEmail(task.assigneeId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editTask.title || ""}
                onChange={(e) =>
                  setEditTask({ ...editTask, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <h3 className="text-lg font-semibold text-gray-800">
                {task.title}
              </h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            {isEditing ? (
              <textarea
                value={editTask.description || ""}
                onChange={(e) =>
                  setEditTask({ ...editTask, description: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter task description..."
              />
            ) : (
              <p className="text-gray-600">
                {task.description || "No description provided"}
              </p>
            )}
          </div>

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              ) : (
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              {isEditing ? (
                <select
                  value={editTask.assigneeId || ""}
                  onChange={(e) =>
                    setEditTask({
                      ...editTask,
                      assigneeId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">
                    {currentAssigneeEmail || "Unassigned"}
                  </span>
                </div>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editTask.dueDate ? editTask.dueDate.split("T")[0] : ""}
                  onChange={(e) =>
                    setEditTask({
                      ...editTask,
                      dueDate: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              ) : (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">
                    {task.dueDate
                      ? format(new Date(task.dueDate), "MMM dd, yyyy")
                      : "No due date"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTask(task);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Comments ({comments.length})
            </h4>

            {/* Comments List */}
            <div className="space-y-4 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800">
                      {comment.authorEmail}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(
                        new Date(comment.createdAt),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600">{comment.body}</p>
                </div>
              ))}

              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No comments yet
                </p>
              )}
            </div>

            {/* Add Comment */}
            <div className="flex space-x-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors flex items-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};