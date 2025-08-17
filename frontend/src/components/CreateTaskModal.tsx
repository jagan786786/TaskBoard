import React, { useState } from "react";
import { X, Plus, Calendar, User, Flag, FileText } from "lucide-react";
import type { Task, User as UserType } from "../types";

const API_BASE_URL = "http://localhost:4000/api";

interface CreateTaskModalProps {
  users: UserType[];
  onClose: () => void;
  onCreate: (task: Task) => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  users,
  onClose,
  onCreate,
}) => {
  const [task, setTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    priority: "Medium",
    assigneeId: null,
    dueDate: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.title?.trim()) return;

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE_URL}/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
        body: JSON.stringify(task),
      });

      if (!res.ok) {
        throw new Error("Failed to create task");
      }

      const createdTask: Task = await res.json();
      onCreate(createdTask);
      onClose();
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityConfig = {
    High: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-400",
    },
    Medium: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-400",
    },
    Low: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-400",
    },
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gray-200/50 max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Task
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <FileText className="w-4 h-4 mr-2" />
                Task Title *
              </label>
              <input
                type="text"
                value={task.title || ""}
                onChange={(e) => setTask({ ...task, title: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50"
                placeholder="Enter a descriptive task title"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                value={task.description || ""}
                onChange={(e) =>
                  setTask({ ...task, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50 resize-none"
                placeholder="Provide detailed information about this task..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Flag className="w-4 h-4 mr-2" />
                  Priority
                </label>
                <div className="space-y-2">
                  {(
                    Object.keys(priorityConfig) as Array<
                      keyof typeof priorityConfig
                    >
                  ).map((priority) => {
                    const config = priorityConfig[priority];
                    return (
                      <label
                        key={priority}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={task.priority === priority}
                          onChange={(e) =>
                            setTask({
                              ...task,
                              priority: e.target.value as Task["priority"],
                            })
                          }
                          className="sr-only"
                        />
                        <div
                          className={`flex items-center px-4 py-2.5 rounded-xl border-2 transition-all w-full ${
                            task.priority === priority
                              ? `${config.bg} ${config.text} ${
                                  config.border
                                } ring-2 ring-offset-1 ${config.border.replace(
                                  "border-",
                                  "ring-"
                                )}`
                              : "border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full mr-3 ${
                              task.priority === priority
                                ? config.dot
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <span className="font-medium">{priority}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <User className="w-4 h-4 mr-2" />
                  Assignee
                </label>
                <select
                  value={task.assigneeId || ""}
                  onChange={(e) =>
                    setTask({
                      ...task,
                      assigneeId: e.target.value || null, 
                    })
                  }
                >
                  <option value="">Select assignee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {" "}
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                <Calendar className="w-4 h-4 mr-2" />
                Due Date
              </label>
              <input
                type="date"
                value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                onChange={(e) =>
                  setTask({ ...task, dueDate: e.target.value || null })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all bg-gray-50/50"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-xl hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !task.title?.trim()}
                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all flex items-center disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isLoading ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
