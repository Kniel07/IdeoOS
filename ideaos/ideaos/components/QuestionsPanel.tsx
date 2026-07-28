"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { answerQuestion } from "@/lib/actions";

export function QuestionsPanel({ ideaId }: { ideaId: string }) {
  const questions = useLiveQuery(
    () => db.questions.where("ideaId").equals(ideaId).reverse().sortBy("createdAt"),
    [ideaId]
  );
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  if (!questions) return null;

  const open = questions.filter((q) => !q.answered);
  const answered = questions.filter((q) => q.answered);

  if (questions.length === 0) {
    return <p className="text-sm text-muted">No open questions.</p>;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-faint">
          Open ({open.length})
        </h2>
        {open.map((q) => (
          <div key={q.id} className="card space-y-2 p-3">
            <p className="text-sm text-ink">{q.question}</p>
            <div className="flex gap-2">
              <input
                value={drafts[q.id] ?? ""}
                onChange={(e) => setDrafts({ ...drafts, [q.id]: e.target.value })}
                placeholder="Answer…"
                className="flex-1 rounded-md border border-border bg-raised px-2 py-1 text-sm text-ink placeholder:text-faint focus:border-accent"
              />
              <button
                onClick={async () => {
                  await answerQuestion(q.id, drafts[q.id] ?? "");
                  setDrafts({ ...drafts, [q.id]: "" });
                }}
                className="btn-ghost text-xs"
              >
                Answer
              </button>
            </div>
          </div>
        ))}
      </section>

      {answered.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-faint">Answered</h2>
          {answered.map((q) => (
            <div key={q.id} className="px-3 py-1.5 text-sm">
              <span className="text-muted">{q.question}</span>
              <span className="text-faint"> — </span>
              <span className="text-ink">{q.answer}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
