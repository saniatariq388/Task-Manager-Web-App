"use server";

import { authFetch } from "./authFetch";
import { serverFetch } from "./serverFetch";
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  StrapiCollectionResponse,
  StrapiSingleResponse,
} from "@/interface/task";

export async function getTasks(): Promise<Task[]> {
  const res: StrapiCollectionResponse<Task> = await serverFetch(
    `/api/tasks?sort=dueDate:asc&populate=owner`
  );
  return res.data;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res: StrapiSingleResponse<Task> = await authFetch("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      data: {
        title: input.title,
        description: input.description ?? "",
        priority: input.priority ?? "medium",
        dueDate: input.dueDate ?? null,
        tag: input.tag ?? "",
        IsCompleted: false,
      },
    }),
  });
  return res.data;
}

export async function updateTask(
  documentId: string,
  updates: UpdateTaskInput
): Promise<Task> {
  const res: StrapiSingleResponse<Task> = await authFetch(`/api/tasks/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: updates }),
  });
  return res.data;
}

export async function toggleTaskCompleted(
  documentId: string,
  current: boolean
): Promise<Task> {
  const res: StrapiSingleResponse<Task> = await authFetch(`/api/tasks/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ data: { IsCompleted: !current } }),
  });
  return res.data;
}

export async function deleteTask(documentId: string): Promise<void> {
  await authFetch(`/api/tasks/${documentId}`, { method: "DELETE" });
}