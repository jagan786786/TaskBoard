import React, { useState, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { Task, User } from "../types";

import { TaskColumn } from "./TaskColumn";
import { TaskModal } from "./TaskModal";
import { CreateTaskModal } from "./CreateTaskModal";
import { Filters } from "./Filters";
import { Header } from "./Header";

const API_BASE_URL = "https://taskboard-0qzt.onrender.com/api";

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    assignee: "",
    priority: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const columns = [
    { title: "Backlog", status: "Backlog" as const },
    { title: "In Progress", status: "In Progress" as const },
    { title: "Review", status: "Review" as const },
    { title: "Done", status: "Done" as const },
  ];

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      const [tasksRes, usersRes] = await Promise.all([
        fetch(
          `${API_BASE_URL}/task?assigneeId=${filters.assignee}&priority=${filters.priority}`,
          {
            credentials: "include",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        ),
        fetch(`${API_BASE_URL}/auth/users`, {
          credentials: "include",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      const [tasksData, usersData] = await Promise.all([
        tasksRes.json(),
        usersRes.json(),
      ]);

      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskMove = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const res = await fetch(`${API_BASE_URL}/task/${taskId}/move`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to move task");

      const updatedTask = await res.json();

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...updatedTask } : t))
      );
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    const newTask = { ...updatedTask };
    if (newTask.assigneeId) {
      const user = users.find((u) => u.id === newTask.assigneeId);
      if (user) {
        newTask.assigneeEmail = user.email;
      }
    }
    setTasks((prev) => prev.map((t) => (t.id === newTask.id ? newTask : t)));
    setSelectedTask(newTask);
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/task/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete task");

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      setSelectedTask(null);
    } catch (err) {
      console.error("Task delete failed:", err);
    }
  };
  const handleTaskCreate = (newTask: Task) => {
    const taskCopy = { ...newTask };
    if (taskCopy.assigneeId) {
      const user = users.find((u) => u.id === taskCopy.assigneeId);
      if (user) {
        taskCopy.assigneeEmail = user.email;
      }
    }
    setTasks((prev) => [...prev, taskCopy]);
  };

  const handleFilterChange = (type: "assignee" | "priority", value: string) => {
    setFilters((prev) => ({ ...prev, [type]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ assignee: "", priority: "" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your Task board...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        <Header
          onCreateTask={() => setShowCreateModal(true)}
          onToggleFilters={() => setShowFilters(!showFilters)}
          showFilters={showFilters}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showFilters && (
            <Filters
              users={users}
              selectedAssignee={filters.assignee}
              selectedPriority={filters.priority}
              onAssigneeChange={(value) =>
                handleFilterChange("assignee", value)
              }
              onPriorityChange={(value) =>
                handleFilterChange("priority", value)
              }
              onClear={handleClearFilters}
              onClose={() => setShowFilters(false)}
            />
          )}

          <div className="flex space-x-6 overflow-x-auto pb-6">
            {columns.map((column) => (
              <TaskColumn
                key={column.status}
                title={column.title}
                status={column.status}
                tasks={tasks.filter((task) => task.status === column.status)}
                onTaskMove={handleTaskMove}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
        </main>

        {selectedTask && (
          <TaskModal
            task={selectedTask}
            users={users}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
          />
        )}

        {showCreateModal && (
          <CreateTaskModal
            users={users}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleTaskCreate}
          />
        )}
      </div>
    </DndProvider>
  );
};
