import { redirect } from "next/navigation";
import { getSessionStatus } from "@/services/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionStatus();

  if (!session.isAuthenticated) {
    redirect("/login");
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}