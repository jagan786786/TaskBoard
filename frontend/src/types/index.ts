export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "Backlog" | "In Progress" | "Review" | "Done";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  assigneeId: string | null;
  assigneeEmail?: string | null;
  status: TaskStatus;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  body: string;
  taskId: string;
  authorId: string;
  authorEmail: string;
  createdAt: string;
  updatedAt: string;
}
