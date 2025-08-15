import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { Task, User } from '../types';

import { useApi } from '../hooks/useApi';
import { TaskColumn } from './TaskColumn';
import { TaskModal } from './TaskModal';
import { CreateTaskModal } from './CreateTaskModal';
import { Filters } from './Filters';
import { Header } from './Header';

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    assignee: '',
    priority: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  
  const api = useApi();

  const columns = [
    { title: 'Backlog', status: 'Backlog' as const },
    { title: 'In Progress', status: 'In Progress' as const },
    { title: 'Review', status: 'Review' as const },
    { title: 'Done', status: 'Done' as const },
  ];

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tasksData, usersData] = await Promise.all([
        api.getTasks(filters),
        api.getUsers(),
      ]);
      setTasks(tasksData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTaskMove = async (taskId: number, newStatus: Task['status']) => {
    try {
      const updatedTask = await api.updateTaskStatus(taskId, newStatus);
      setTasks(tasks.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setSelectedTask(updatedTask);
  };

  const handleTaskDelete = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleFilterChange = (type: 'assignee' | 'priority', value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ assignee: '', priority: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your kanban board...</p>
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
              onAssigneeChange={(value) => handleFilterChange('assignee', value)}
              onPriorityChange={(value) => handleFilterChange('priority', value)}
              onClear={handleClearFilters}
              onClose={() => setShowFilters(false)}
            />
          )}

          <div className="flex space-x-6 overflow-x-auto pb-6">
            {columns.map(column => (
              <TaskColumn
                key={column.status}
                title={column.title}
                status={column.status}
                tasks={tasks.filter(task => task.status === column.status)}
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