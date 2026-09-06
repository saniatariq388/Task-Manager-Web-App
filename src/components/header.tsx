"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getSessionStatus } from "@/services/session";
import { logoutUser } from "@/services/logout";

export default function Header() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const isDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    if (isDashboard) return; // dashboard pe check karne ki zaroorat nahi, hum wahan render hi nahi karenge
    getSessionStatus().then((session) => {
      setIsAuthenticated(session.isAuthenticated);
    });
  }, [isDashboard, pathname]);

  // dashboard route pe Header bilkul render nahi hoga
  if (isDashboard) return null;

  // session status abhi load ho raha hai
  if (isAuthenticated === null) {
    return (
      <header className="flex items-center bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <span className="text-sm font-semibold text-gray-800">TaskManager</span>
        </div>
      </header>
    );
  }

  if (!isAuthenticated) {
    return (
      <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
            T
          </div>
          <span className="text-sm font-semibold text-gray-800">TaskManager</span>
        </div>

        <Link
          href="/login"
          className="text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
        >
          Login
        </Link>
      </header>
    );
  }

  return (
    <header className="flex items-center justify-between bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
          T
        </div>
        <div>
          <p className="text-xs text-gray-400 leading-none">My Workspace</p>
          <p className="text-sm font-semibold text-gray-800">Personal Tasks</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
          🔔
        </button>
        <form action={logoutUser}>
          <button
            type="submit"
            className="text-sm font-medium text-gray-600 hover:text-red-500 px-3 py-2 rounded-lg transition"
          >
            Logout
          </button>
        </form>
      </div>
    </header>
  );
}