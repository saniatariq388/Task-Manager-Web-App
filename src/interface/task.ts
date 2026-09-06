export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string | null;
  IsCompleted: boolean;
  tag?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  tag?: string;
}

export type UpdateTaskInput = Partial<{
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
  tag: string;
  IsCompleted: boolean;
}>;

// Strapi ka standard collection response shape — sab endpoints yehi return karte hain
export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: object;
}