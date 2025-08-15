export interface User {
  id: number;
  email: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  assigneeId: number | null;
  assigneeEmail: string | null;
  status: 'Backlog' | 'In Progress' | 'Review' | 'Done';
  dueDate: string | null;
  badge: 'On Track' | 'At Risk' | 'Overdue' | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  taskId: number;
  authorId: number;
  authorEmail: string;
  body: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}