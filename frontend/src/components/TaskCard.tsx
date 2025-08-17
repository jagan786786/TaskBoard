import React, { useRef } from "react";
import { useDrag } from "react-dnd";
import { format } from "date-fns";
import type { Task } from "../types";
import {
  Calendar,
  User,
  AlertTriangle,
  Clock,
  CheckCircle,
} from "lucide-react";

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  drag(ref); // attach drag to ref

  const priorityColors = {
    High: "bg-red-100 text-red-800 border-red-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Low: "bg-green-100 text-green-800 border-green-200",
  };

  const badgeColors = {
    "On Track": "bg-green-100 text-green-800",
    "At Risk": "bg-orange-100 text-orange-800",
    Overdue: "bg-red-100 text-red-800",
  };

  const badgeIcons = {
    "On Track": CheckCircle,
    "At Risk": Clock,
    Overdue: AlertTriangle,
  };

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`bg-white rounded-lg p-4 shadow-sm border border-gray-200 cursor-pointer transition-all hover:shadow-md hover:border-indigo-300 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {/* Title + Priority */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">
          {task.title}
        </h3>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${
            priorityColors[task.priority]
          }`}
        >
          {task.priority}
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer: User email + Due date + Status badge */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-3">
          {/* Assignee */}
          {task.assigneeEmail ? (
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              <span className="truncate max-w-24">
                {task.assigneeEmail.split("@")[0]}
              </span>
            </div>
          ) : (
            <div className="flex items-center text-gray-400">
              <User className="w-4 h-4 mr-1" />
              <span>Unassigned</span>
            </div>
          )}

          {/* Due date */}
          {task.dueDate && (
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{format(new Date(task.dueDate), "MMM dd")}</span>
            </div>
          )}
        </div>

        {/* Status badge */}
        {task.badge && task.status !== "Done" && (
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${
              badgeColors[task.badge]
            }`}
          >
            {React.createElement(badgeIcons[task.badge], {
              className: "w-3 h-3 mr-1",
            })}
            {task.badge}
          </div>
        )}
      </div>
    </div>
  );
};
