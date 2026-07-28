"use client";

import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";
import type { Idea } from "@/lib/types";

const STAGE_LABEL: Record<Idea["stage"], string> = {
  capturing: "Capturing",
  defining: "Defining",
  ready_for_prototype: "Ready for Prototype",
  in_progress: "In Progress",
  shipped: "Shipped",
};

function timeAgo(ts: number): string {
  const minutes = Math.floor((Date.now() - ts) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function IdeaCard({ idea }: { idea: Idea }) {
  const requirements = useLiveQuery(
    () => db.requirements.where("ideaId").equals(idea.id).toArray(),
    [idea.id]
  );
  const tasks = useLiveQuery(
    () => db.tasks.where("ideaId").equals(idea.id).toArray(),
    [idea.id]
  );
  const questions = useLiveQuery(
    () => db.questions.where("ideaId").equals(idea.id).toArray(),
    [idea.id]
  );

  if (!requirements || !tasks || !questions) {
    return <div className="card h-40 animate-pulse" />;
  }

  const readiness = computeReadiness({ requirements, tasks, questions });
  const avgConfidence = requirements.length
    ? Math.round(
        (requirements.reduce((sum, r) => sum + r.confidence, 0) / requirements.length) * 100
      )
    : null;

  return (
    <Link
      href={`/idea/${idea.id}`}
      className="card group flex flex-col gap-3 p-4 transition-colors hover:border-borderStrong"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium leading-snug text-ink group-hover:text-white">
          {idea.name}
        </h3>
        {idea.syncStatus === "local" && (
          <span className="pill shrink-0 bg-raised text-faint">local</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised">
          <div
            className="h-full rounded-full bg-signal transition-all"
            style={{ width: `${readiness.score}%` }}
          />
        </div>
        <span className="font-mono text-xs text-muted">{readiness.score}%</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span>{STAGE_LABEL[idea.stage]}</span>
        <span className="text-faint">·</span>
        <span>Pending {readiness.pendingItems}</span>
        <span className="text-faint">·</span>
        <span>Updated {timeAgo(idea.updatedAt)}</span>
        {avgConfidence !== null && (
          <>
            <span className="text-faint">·</span>
            <span>AI Confidence {avgConfidence}%</span>
          </>
        )}
      </div>
    </Link>
  );
}
