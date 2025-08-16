export interface User {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  assigneeId: number | null;
  assigneeEmail?: string; 
  status: "Todo" | "In Progress" | "Review" | "Done";
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  body: string;
  taskId: number;
  authorId: number;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}