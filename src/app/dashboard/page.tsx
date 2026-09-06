import TaskDashboard from "@/components/task-dashboard";
import { getCurrentUser } from "@/services/user";
import { getTasks } from "@/services/tasks";
import { redirect } from "next/navigation";
import { getSessionStatus } from "@/services/session";
import type { Task } from "@/interface/task";

export default async function DashboardPage() {
  const session = await getSessionStatus();

  if (!session.isAuthenticated) {
    redirect("/login");
  }

  let user;
  let tasks: Task[] = [];

  try {
    user = await getCurrentUser();
    tasks = await getTasks();
  } catch (err) {
    // Any auth failure during render (expired/invalid token, refresh
    // token dead, etc.) should send the user back to login cleanly —
    // never show a crash screen.
    redirect("/login");
  }

 return <TaskDashboard initialTasks={tasks} userName={user.username} userEmail={user.email} />;
}