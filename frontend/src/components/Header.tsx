import React from 'react';
import { LogOut, Plus, Filter, User } from 'lucide-react';
import { useAuth } from '../context/UseAuth';

interface HeaderProps {
  onCreateTask: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onCreateTask, onToggleFilters, showFilters }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Task Board</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleFilters}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                showFilters 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            
            <button
              onClick={onCreateTask}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </button>

            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-gray-600">
                <User className="w-4 h-4 mr-2" />
                {user?.email}
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};