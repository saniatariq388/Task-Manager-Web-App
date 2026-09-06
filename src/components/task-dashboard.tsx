"use client";

import { useState } from "react";
import {
  createTask,
  toggleTaskCompleted,
  deleteTask,
  updateTask,
} from "@/services/tasks";
import TaskSidebar, { ViewFilter } from "@/components/task-sidebar";
import TopBar, { TaskFilters, EMPTY_FILTERS } from "@/components/topbar";
import type { Task } from "@/interface/task";
import TaskEditModal from "@/components/task-edit-modal";

function isToday(dateStr?: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isUpcoming(dateStr?: string | null) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return d >= startOfTomorrow;
}

function formatDueDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (isToday(dateStr)) return `Today, ${time}`;
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

const priorityStyles: Record<Task["priority"], string> = {
  high: "bg-red-100 text-red-600",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-gray-100 text-gray-600",
};

export default function TaskDashboard({
  initialTasks,
  userName = "User",
  userEmail,
}: {
  initialTasks: Task[];
  userName?: string;
  userEmail?: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<ViewFilter>("inbox");
  const [search, setSearch] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<Task["priority"]>("medium");
  const [newDueDate, setNewDueDate] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [filters, setFilters] = useState<TaskFilters>(EMPTY_FILTERS);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const task = await createTask({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        priority: newPriority,
        dueDate: newDueDate ? new Date(newDueDate).toISOString() : null,
        tag: newTag.trim() || undefined,
      });
      setTasks((prev) => [task, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("medium");
      setNewDueDate("");
      setNewTag("");
      setShowMore(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setAdding(false);
    }
  };

  const availableTags = Array.from(
    new Set(
      tasks.map((t) => t.tag).filter((tag): tag is string => Boolean(tag)),
    ),
  );

  const handleToggle = async (task: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.documentId === task.documentId
          ? { ...t, IsCompleted: !t.IsCompleted }
          : t,
      ),
    );
    try {
      await toggleTaskCompleted(task.documentId, task.IsCompleted);
    } catch (err) {
      console.error("Failed to toggle task:", err);
      setTasks((prev) =>
        prev.map((t) =>
          t.documentId === task.documentId
            ? { ...t, IsCompleted: task.IsCompleted }
            : t,
        ),
      );
    }
  };

  const handleDelete = async (documentId: string) => {
    const prevTasks = tasks;
    setTasks((prev) => prev.filter((t) => t.documentId !== documentId));
    try {
      await deleteTask(documentId);
    } catch (err) {
      console.error("Failed to delete task:", err);
      setTasks(prevTasks);
    }
  };

  const handleUpdate = async (
    documentId: string,
    updates: {
      title: string;
      description?: string;
      priority: "low" | "medium" | "high";
      dueDate: string | null;
      tag?: string;
    },
  ) => {
    const updated = await updateTask(documentId, updates);
    setTasks((prev) =>
      prev.map((t) => (t.documentId === documentId ? { ...t, ...updated } : t)),
    );
  };

  const filteredTasks = tasks
    .filter((t) => {
      if (view === "completed") return t.IsCompleted;
      if (t.IsCompleted) return false;
      if (view === "today") return isToday(t.dueDate);
      if (view === "upcoming") return isUpcoming(t.dueDate);
      return true;
    })
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .filter((t) => !filters.priority || t.priority === filters.priority)
    .filter(
      (t) => !filters.tags.length || (t.tag && filters.tags.includes(t.tag)),
    )
    .filter((t) => {
      if (!filters.dueDateFrom && !filters.dueDateTo) return true;
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate).getTime();
      if (filters.dueDateFrom && due < new Date(filters.dueDateFrom).getTime())
        return false;
      if (
        filters.dueDateTo &&
        due > new Date(filters.dueDateTo + "T23:59:59").getTime()
      )
        return false;
      return true;
    });

  const counts = {
    inbox: tasks.filter((t) => !t.IsCompleted).length,
    today: tasks.filter((t) => !t.IsCompleted && isToday(t.dueDate)).length,
    upcoming: tasks.filter((t) => !t.IsCompleted && isUpcoming(t.dueDate))
      .length,
    completed: tasks.filter((t) => t.IsCompleted).length,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <TaskSidebar view={view} onViewChange={setView} counts={counts} />

      <main className="flex-1">
       <TopBar
  view={view}
  search={search}
  onSearchChange={setSearch}
  userName={userName}
  userEmail={userEmail}
  filters={filters}
  onFiltersChange={setFilters}
  availableTags={availableTags}
/>

       {(filters.priority || filters.tags.length > 0) && (
  <div className="flex flex-wrap items-center gap-3 px-6 py-3 border-b border-gray-100 bg-white">
    {filters.priority && (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Priority:</span>
        <button
          onClick={() => setFilters({ ...filters, priority: "" })}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition"
        >
          <span className="capitalize">{filters.priority}</span>
          <span className="text-emerald-100">✕</span>
        </button>
      </div>
    )}

    {filters.tags.length > 0 && (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Tags:</span>
        <div className="flex flex-wrap gap-2">
          {filters.tags.map((tag) => (
            <button
              key={tag}
              onClick={() =>
                setFilters({
                  ...filters,
                  tags: filters.tags.filter((t) => t !== tag),
                })
              }
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              {tag}
              <span className="text-emerald-100">✕</span>
            </button>
          ))}
        </div>
      </div>
    )}

    <button
      onClick={() => setFilters({ ...filters, priority: "", tags: [] })}
      className="text-xs text-gray-400 hover:text-red-500 ml-1"
    >
      Clear
    </button>
  </div>
)}
        <div className="p-8 max-w-2xl">
          <form
            onSubmit={handleAdd}
            className="bg-white border border-gray-200 rounded-xl p-3 mb-6"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={adding}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add"}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowMore((prev) => !prev)}
              className="text-xs text-emerald-600 hover:underline mt-2"
            >
              {showMore ? "Hide details" : "+ Add priority, due date, tag"}
            </button>

            {showMore && (
              <div className="flex flex-col gap-3 mt-3 pt-3 border-t border-gray-100">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Description
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={2}
                    placeholder="Add more detail..."
                    className="w-full text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Priority
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) =>
                        setNewPriority(e.target.value as Task["priority"])
                      }
                      className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Due date
                    </label>
                    <input
                      type="datetime-local"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 block mb-1">
                      Tag
                    </label>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g. Design Team"
                      className="text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div
                key={task.documentId}
                className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(task)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      task.IsCompleted
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {task.IsCompleted && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </button>
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        task.IsCompleted
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {task.priority && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${priorityStyles[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">
                          {formatDueDate(task.dueDate)}
                        </span>
                      )}
                      {task.tag && (
                        <span className="text-xs text-gray-400">
                          {task.tag}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => setEditingTask(task)}
                    className="text-gray-800 hover:text-emerald-600 text-sm"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(task.documentId)}
                    className="text-gray-800 hover:text-red-500 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
                <p className="text-gray-400 text-sm">
                  {view === "completed"
                    ? "No completed tasks yet."
                    : "You're all caught up! 🎉"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {editingTask && (
        <TaskEditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}