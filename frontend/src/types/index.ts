export interface User {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "Backlog" | "In Progress" | "Review" | "Done" ;

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  assigneeId: number | null;
  assigneeEmail?: string | null;
  status: TaskStatus;
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
