import { useAuth } from '../context/UseAuth';
import type { Task, Comment, User } from '../types';

const API_BASE_URL = 'http://localhost:3001';

export const useApi = () => {
  const { token } = useAuth();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  };

  const getTasks = async (filters: { assignee?: string; priority?: string } = {}): Promise<Task[]> => {
    const params = new URLSearchParams();
    if (filters.assignee) params.set('assignee', filters.assignee);
    if (filters.priority) params.set('priority', filters.priority);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/tasks${query}`);
  };

  const createTask = async (task: Partial<Task>): Promise<Task> => {
    return apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  };

  const updateTask = async (id: number, task: Partial<Task>): Promise<Task> => {
    return apiCall(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    });
  };

  const deleteTask = async (id: number): Promise<void> => {
    return apiCall(`/tasks/${id}`, {
      method: 'DELETE',
    });
  };

  const updateTaskStatus = async (id: number, status: Task['status']): Promise<Task> => {
    return apiCall(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  };

  const getComments = async (taskId: number): Promise<Comment[]> => {
    return apiCall(`/tasks/${taskId}/comments`);
  };

  const createComment = async (taskId: number, body: string): Promise<Comment> => {
    return apiCall(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    });
  };

  const getUsers = async (): Promise<User[]> => {
    return apiCall('/users');
  };

  return {
    getTasks,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    getComments,
    createComment,
    getUsers,
  };
};