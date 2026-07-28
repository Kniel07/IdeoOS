"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { moveTaskStatus } from "@/lib/actions";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "Todo" },
  { status: "in_progress", label: "In Progress" },
  { status: "completed", label: "Completed" },
];

const NEXT: Record<TaskStatus, TaskStatus | null> = {
  todo: "in_progress",
  in_progress: "completed",
  completed: null,
};

export function TaskBoard({ ideaId }: { ideaId: string }) {
  const tasks = useLiveQuery(
    () => db.tasks.where("ideaId").equals(ideaId).toArray(),
    [ideaId]
  );

  if (!tasks) return null;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {COLUMNS.map((col) => {
        const items = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-faint">
              {col.label} ({items.length})
            </h3>
            {items.map((task) => {
              const next = NEXT[task.status];
              return (
                <div key={task.id} className="card p-3">
                  <p className="text-sm text-ink">{task.title}</p>
                  {next && (
                    <button
                      onClick={() => moveTaskStatus(task.id, next)}
                      className="btn-ghost mt-2 text-xs"
                    >
                      Move to {COLUMNS.find((c) => c.status === next)?.label} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
