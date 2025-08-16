import React from "react";
import { useDrop } from "react-dnd";
import type { Task } from "../types";
import { TaskCard } from "./TaskCard";

interface TaskColumnProps {
  title: string;
  status: Task["status"];
  tasks: Task[];
  onTaskMove: (taskId: number, newStatus: Task["status"]) => void;
  onTaskClick: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  onTaskMove,
  onTaskClick,
}) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number; status: Task["status"] }) => {
      if (item.status !== status) {
        onTaskMove(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const statusColors = {
    Backlog: "border-gray-300 bg-gray-50",
    "In Progress": "border-blue-300 bg-blue-50",
    Review: "border-yellow-300 bg-yellow-50",
    Done: "border-green-300 bg-green-50",
  };

  return (
    <div className="flex-1 min-w-80">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
        <div className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      </div>

      <div
        ref={drop}
        className={`min-h-96 p-4 rounded-lg border-2 border-dashed transition-colors ${
          isOver ? "border-indigo-400 bg-indigo-50" : statusColors[status]
        }`}
      >
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">No tasks in {title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
};
