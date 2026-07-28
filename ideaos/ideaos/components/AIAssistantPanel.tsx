"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { computeReadiness } from "@/lib/readiness";

export function AIAssistantPanel({ ideaId }: { ideaId: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const requirements = useLiveQuery(
    () => db.requirements.where("ideaId").equals(ideaId).toArray(),
    [ideaId]
  );
  const tasks = useLiveQuery(() => db.tasks.where("ideaId").equals(ideaId).toArray(), [ideaId]);
  const questions = useLiveQuery(
    () => db.questions.where("ideaId").equals(ideaId).toArray(),
    [ideaId]
  );

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="btn-ghost h-fit shrink-0 self-start"
        aria-label="Expand AI assistant"
      >
        ◀
      </button>
    );
  }

  if (!requirements || !tasks || !questions) return <aside className="w-72 shrink-0" />;

  const readiness = computeReadiness({ requirements, tasks, questions });
  const openQuestions = questions.filter((q) => !q.answered);

  const nextAction =
    readiness.score === 0 && requirements.length + tasks.length + questions.length === 0
      ? "Capture your first thought above to get started."
      : openQuestions.length > 0
        ? `Answer "${openQuestions[0].question}"`
        : requirements.some((r) => r.status === "open")
          ? "Review open requirements and mark what's addressed."
          : "Looking healthy — keep capturing.";

  return (
    <aside className="w-72 shrink-0 space-y-4 border-l border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-ink">AI Assistant</h2>
        <button
          onClick={() => setCollapsed(true)}
          className="btn-ghost !px-1.5"
          aria-label="Collapse AI assistant"
        >
          ▶
        </button>
      </div>

      <div className="card p-3">
        <p className="text-xs uppercase tracking-wider text-faint">Readiness</p>
        <p className="mt-1 font-mono text-2xl text-signal">{readiness.score}%</p>
      </div>

      <div className="card space-y-1.5 p-3 text-sm">
        <div className="flex justify-between text-muted">
          <span>Open questions</span>
          <span className="text-ink">{readiness.openQuestions}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Pending items</span>
          <span className="text-ink">{readiness.pendingItems}</span>
        </div>
        <div className="flex justify-between text-muted">
          <span>Requirements</span>
          <span className="text-ink">{requirements.length}</span>
        </div>
      </div>

      <div className="card p-3">
        <p className="text-xs uppercase tracking-wider text-faint">Suggested next step</p>
        <p className="mt-1 text-sm text-ink">{nextAction}</p>
      </div>
    </aside>
  );
}
