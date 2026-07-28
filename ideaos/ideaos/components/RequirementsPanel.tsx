"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Requirement } from "@/lib/types";

const PRIORITY_COLOR: Record<Requirement["priority"], string> = {
  high: "bg-danger/15 text-danger",
  medium: "bg-warn/15 text-warn",
  low: "bg-faint/15 text-faint",
};

export function RequirementsPanel({ ideaId }: { ideaId: string }) {
  const requirements = useLiveQuery(
    () => db.requirements.where("ideaId").equals(ideaId).reverse().sortBy("createdAt"),
    [ideaId]
  );

  async function toggle(req: Requirement) {
    await db.requirements.update(req.id, {
      status: req.status === "open" ? "addressed" : "open",
    });
  }

  if (!requirements) return null;

  if (requirements.length === 0) {
    return <p className="text-sm text-muted">No requirements yet — capture a thought above.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {requirements.map((req) => (
        <div key={req.id} className="card flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm font-medium text-ink">{req.title}</span>
            <span className={`pill shrink-0 ${PRIORITY_COLOR[req.priority]}`}>{req.priority}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {req.tags.map((tag) => (
              <span key={tag} className="pill bg-raised text-faint">
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Confidence {Math.round(req.confidence * 100)}%</span>
            <button onClick={() => toggle(req)} className="btn-ghost text-xs">
              {req.status === "open" ? "Mark addressed" : "Reopen"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
