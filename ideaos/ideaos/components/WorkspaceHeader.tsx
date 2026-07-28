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

export function WorkspaceHeader({ idea }: { idea: Idea }) {
  const requirements = useLiveQuery(
    () => db.requirements.where("ideaId").equals(idea.id).toArray(),
    [idea.id]
  );
  const tasks = useLiveQuery(() => db.tasks.where("ideaId").equals(idea.id).toArray(), [idea.id]);
  const questions = useLiveQuery(
    () => db.questions.where("ideaId").equals(idea.id).toArray(),
    [idea.id]
  );

  const readiness =
    requirements && tasks && questions
      ? computeReadiness({ requirements, tasks, questions })
      : null;

  return (
    <div className="flex items-center justify-between border-b border-border px-8 py-4">
      <div>
        <Link href="/" className="text-xs text-faint hover:text-muted">
          ← Ideas
        </Link>
        <h1 className="text-lg font-semibold text-ink">{idea.name}</h1>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
          <span>{STAGE_LABEL[idea.stage]}</span>
          {readiness && (
            <>
              <span className="text-faint">·</span>
              <span>{readiness.score}% ready</span>
            </>
          )}
        </div>
      </div>
      <button className="btn-ghost" disabled title="Export ships in a later pass">
        Export
      </button>
    </div>
  );
}
