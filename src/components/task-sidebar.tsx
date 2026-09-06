"use client";

export type ViewFilter = "inbox" | "today" | "upcoming" | "completed";

interface TaskSidebarProps {
  view: ViewFilter;
  onViewChange: (view: ViewFilter) => void;
  counts?: Partial<Record<ViewFilter, number>>;
}

const navItems: { key: ViewFilter; label: string; icon: string }[] = [
  { key: "inbox", label: "Inbox", icon: "🗂️" },
  { key: "today", label: "Today", icon: "📅" },
  { key: "upcoming", label: "Upcoming", icon: "🗓️" },
  { key: "completed", label: "Completed", icon: "✅" },
];

export default function TaskSidebar({ view, onViewChange, counts }: TaskSidebarProps) {
  return (
    <aside className="w-56 border-r border-gray-200 bg-white p-4 flex flex-col">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onViewChange(item.key)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-left transition ${
              view === item.key
                ? "bg-emerald-100 text-emerald-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{item.icon}</span>
              {item.label}
            </span>
            {counts?.[item.key] !== undefined && (
              <span className="text-xs text-gray-400">{counts[item.key]}</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}