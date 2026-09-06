"use client";

import { useEffect, useRef, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { ViewFilter } from "@/components/task-sidebar";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/services/authDebug";


interface TopBarProps {
  view: ViewFilter;
  search: string;
  onSearchChange: (value: string) => void;
  userName: string;
  userEmail?: string;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  availableTags: string[];
}

export interface TaskFilters {
  priority: "" | "low" | "medium" | "high";
  dueDateFrom: string; // "" or "YYYY-MM-DD"
  dueDateTo: string;   // "" or "YYYY-MM-DD"
  tags: string[];
}

export const EMPTY_FILTERS: TaskFilters = {
  priority: "",
  dueDateFrom: "",
  dueDateTo: "",
  tags: [],
};

function countActiveFilters(f: TaskFilters): number {
  let n = 0;
  if (f.priority) n++;
  if (f.dueDateFrom || f.dueDateTo) n++;
  if (f.tags.length > 0) n++;
  return n;
}

interface TopBarProps {
  view: ViewFilter;
  search: string;
  onSearchChange: (value: string) => void;
  userName: string;
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  availableTags: string[];
}

const VIEW_TITLES: Record<ViewFilter, string> = {
  inbox: "Inbox",
  today: "Today",
  upcoming: "Upcoming",
  completed: "Completed",
};

export default function TopBar({
  view,
  search,
  onSearchChange,
  userName,
  userEmail,
  filters,
  onFiltersChange,
  availableTags,
}: TopBarProps) {
  const router = useRouter();
  const [panelOpen, setPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutUser();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout failed:", err);
      setLoggingOut(false);
    }
  };

  // ... existing initials calculation, activeCount, toggleTag stay as-is
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeCount = countActiveFilters(filters);

  const toggleTag = (tag: string) => {
    const isActive = filters.tags.includes(tag);
    onFiltersChange({
      ...filters,
      tags: isActive ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag],
    });
  };

  return (
    <div className="relative bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">{VIEW_TITLES[view]}</h1>

        <div className="flex-1 max-w-md mx-6 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => setPanelOpen((p) => !p)}
            className={`relative w-9 h-9 shrink-0 rounded-lg border flex items-center justify-center transition ${
              panelOpen || activeCount > 0
                ? "bg-emerald-50 border-emerald-300 text-emerald-600"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {activeCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-medium flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        </div>

       <div className="relative" ref={profileRef}>
  <button
    onClick={() => setProfileOpen((p) => !p)}
    className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-medium hover:bg-emerald-700 transition"
  >
    {initials || "U"}
  </button>

  {profileOpen && (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg py-3 z-30">
      <div className="px-4 pb-3 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-800 truncate">{userName}</p>
        {userEmail && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{userEmail}</p>
        )}
        <span className="inline-block mt-1.5 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
          Authenticated
        </span>
      </div>
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="w-full text-left px-4 py-2 mt-1 text-sm text-red-500 hover:bg-red-50 transition disabled:opacity-50"
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  )}
</div>
      </div>

      {panelOpen && (
        <div className="absolute right-6 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-20">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">Filters</p>
            {activeCount > 0 && (
              <button
                onClick={() => onFiltersChange(EMPTY_FILTERS)}
                className="text-xs text-red-500 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  onFiltersChange({ ...filters, priority: e.target.value as TaskFilters["priority"] })
                }
                className="w-full text-sm rounded-lg border border-gray-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1">Due date range</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dueDateFrom}
                  onChange={(e) => onFiltersChange({ ...filters, dueDateFrom: e.target.value })}
                  className="flex-1 text-sm rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={filters.dueDateTo}
                  onChange={(e) => onFiltersChange({ ...filters, dueDateTo: e.target.value })}
                  className="flex-1 text-sm rounded-lg border border-gray-300 px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {availableTags.length > 0 && (
              <div>
                <label className="text-xs text-gray-500 block mb-1">Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const active = filters.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition ${
                          active
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}