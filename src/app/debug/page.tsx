// src/app/dashboard/page.tsx (example)
import AuthDebugDashboard from "@/components/auth-debug-dashboard";
import { getCurrentUser } from "@/services/user";
import { redirect } from "next/navigation";
import { getSessionStatus } from "@/services/session";


export default async function DebugPage() {

  const session = await getSessionStatus();

  if (!session.isAuthenticated) {
    redirect("/login");
  }  
  const user = await getCurrentUser();

  return <AuthDebugDashboard />;
  
}