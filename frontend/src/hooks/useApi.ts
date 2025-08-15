import { useAuth } from '../context/UseAuth';
import type { Task, Comment, User } from '../types';

// Toggle for mock mode
const USE_MOCK_API = true;

// Change when backend is ready
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

    // --------------------------
    // Mock API implementations
    // --------------------------
    const mockTasks: Task[] = [
        { id: 1, title: 'Mock Task 1', description: 'A local mock task', status: 'Review', priority: 'High', assigneeId: 'gdfgdfgdfgdfgdfg' },
        { id: 2, title: 'Mock Task 2', description: 'Another local mock task', status: 'In Progress', priority: 'Medium', assigneeId: 'gdfgdgdfgdgd' },
    ];

    const mockUsers: User[] = [
        { id: 1, email: 'mock1@example.com' },
        { id: 2, email: 'mock2@example.com' },
    ];

    const getTasksMock = async (): Promise<Task[]> => {
        await new Promise((res) => setTimeout(res, 300));
        return mockTasks;
    };

    const createTaskMock = async (task: Partial<Task>): Promise<Task> => {
        await new Promise((res) => setTimeout(res, 300));
        const newTask = { id: mockTasks.length + 1, ...task } as Task;
        mockTasks.push(newTask);
        return newTask;
    };

    const updateTaskMock = async (id: number, task: Partial<Task>): Promise<Task> => {
        await new Promise((res) => setTimeout(res, 300));
        const index = mockTasks.findIndex((t) => t.id === id);
        if (index === -1) throw new Error('Task not found');
        mockTasks[index] = { ...mockTasks[index], ...task };
        return mockTasks[index];
    };

    const deleteTaskMock = async (id: number): Promise<void> => {
        await new Promise((res) => setTimeout(res, 300));
        const index = mockTasks.findIndex((t) => t.id === id);
        if (index !== -1) mockTasks.splice(index, 1);
    };

    const updateTaskStatusMock = async (id: number, status: Task['status']): Promise<Task> => {
        return updateTaskMock(id, { status });
    };

    const getCommentsMock = async (): Promise<Comment[]> => {
        await new Promise((res) => setTimeout(res, 300));
        return [{ id: 1, taskId: 1, body: 'Mock comment', authorId: 1 }];
    };

    const createCommentMock = async (taskId: number, body: string): Promise<Comment> => {
        await new Promise((res) => setTimeout(res, 300));
        return { id: Date.now(), taskId, body, authorId: 1 };
    };

    const getUsersMock = async (): Promise<User[]> => {
        await new Promise((res) => setTimeout(res, 300));
        return mockUsers;
    };

    // --------------------------
    // Real API implementations
    // --------------------------
    const getTasksApi = async (filters: { assignee?: string; priority?: string } = {}): Promise<Task[]> => {
        const params = new URLSearchParams();
        if (filters.assignee) params.set('assignee', filters.assignee);
        if (filters.priority) params.set('priority', filters.priority);
        const query = params.toString() ? `?${params.toString()}` : '';
        return apiCall(`/tasks${query}`);
    };

    const createTaskApi = async (task: Partial<Task>): Promise<Task> => {
        return apiCall('/tasks', {
            method: 'POST',
            body: JSON.stringify(task),
        });
    };

    const updateTaskApi = async (id: number, task: Partial<Task>): Promise<Task> => {
        return apiCall(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(task),
        });
    };

    const deleteTaskApi = async (id: number): Promise<void> => {
        return apiCall(`/tasks/${id}`, {
            method: 'DELETE',
        });
    };

    const updateTaskStatusApi = async (id: number, status: Task['status']): Promise<Task> => {
        return apiCall(`/tasks/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
    };

    const getCommentsApi = async (taskId: number): Promise<Comment[]> => {
        return apiCall(`/tasks/${taskId}/comments`);
    };

    const createCommentApi = async (taskId: number, body: string): Promise<Comment> => {
        return apiCall(`/tasks/${taskId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ body }),
        });
    };

    const getUsersApi = async (): Promise<User[]> => {
        return apiCall('/users');
    };

    return {
        getTasks: USE_MOCK_API ? getTasksMock : getTasksApi,
        createTask: USE_MOCK_API ? createTaskMock : createTaskApi,
        updateTask: USE_MOCK_API ? updateTaskMock : updateTaskApi,
        deleteTask: USE_MOCK_API ? deleteTaskMock : deleteTaskApi,
        updateTaskStatus: USE_MOCK_API ? updateTaskStatusMock : updateTaskStatusApi,
        getComments: USE_MOCK_API ? getCommentsMock : getCommentsApi,
        createComment: USE_MOCK_API ? createCommentMock : createCommentApi,
        getUsers: USE_MOCK_API ? getUsersMock : getUsersApi,
    };
};
