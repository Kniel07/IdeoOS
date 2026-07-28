"use client";

import Link from "next/link";
import { SyncStatus } from "./SyncStatus";

const LIVE_ITEMS = [{ label: "Dashboard", href: "/" }];

const PLANNED_ITEMS = [
  "Knowledge",
  "Templates",
  "Archive",
  "Settings",
];

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-accent" />
          <span className="font-mono text-sm font-semibold tracking-tight">
            IdeaOS
          </span>
        </div>
      </div>

      <nav className="flex-1 px-2">
        {LIVE_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-md px-3 py-2 text-sm text-ink hover:bg-raised"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-4 px-3 text-[11px] uppercase tracking-wider text-faint">
          Planned
        </div>
        {PLANNED_ITEMS.map((label) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-faint"
          >
            <span>{label}</span>
            <span className="pill bg-raised text-faint">soon</span>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <SyncStatus />
      </div>
    </aside>
  );
}
