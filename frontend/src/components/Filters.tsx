import React from 'react';
import { X } from 'lucide-react';
import type { User } from '../types';

interface FiltersProps {
  users: User[];
  selectedAssignee: string;
  selectedPriority: string;
  onAssigneeChange: (assignee: string) => void;
  onPriorityChange: (priority: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  users,
  selectedAssignee,
  selectedPriority,
  onAssigneeChange,
  onPriorityChange,
  onClear,
  onClose,
}) => {
  return (
    <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Filters</h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Assignee
          </label>
          <select
            value={selectedAssignee}
            onChange={(e) => onAssigneeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All assignees</option>
            {users.map(user => (
              <option key={user.id} value={user.id.toString()}>
                {user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Priority
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          onClick={onClear}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
};