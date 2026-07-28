"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { applyClassification } from "@/lib/actions";
import { classifyCapture } from "@/lib/ai";
import { useState } from "react";

export function InboxPanel({ ideaId }: { ideaId: string }) {
  const events = useLiveQuery(
    () => db.events.where("ideaId").equals(ideaId).reverse().sortBy("createdAt"),
    [ideaId]
  );
  const [retrying, setRetrying] = useState<string | null>(null);

  if (!events) return null;

  const unprocessed = events.filter((e) => !e.processedAt);
  const recent = events.filter((e) => e.processedAt).slice(0, 8);

  async function retry(eventId: string) {
    const event = events!.find((e) => e.id === eventId)!;
    setRetrying(eventId);
    try {
      const classification = await classifyCapture(event.content);
      await applyClassification(event, classification);
    } finally {
      setRetrying(null);
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
          Unprocessed ({unprocessed.length})
        </h2>
        {unprocessed.length === 0 ? (
          <p className="text-sm text-muted">Inbox is empty — everything's been filed.</p>
        ) : (
          <div className="space-y-2">
            {unprocessed.map((event) => (
              <div key={event.id} className="card flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-sm text-ink">{event.content}</span>
                <button
                  onClick={() => retry(event.id)}
                  disabled={retrying === event.id}
                  className="btn-ghost shrink-0 text-xs disabled:opacity-40"
                >
                  {retrying === event.id ? "Filing…" : "File now"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-faint">
          Recently filed
        </h2>
        <div className="space-y-2">
          {recent.map((event) => (
            <div key={event.id} className="px-3 py-1.5 text-sm text-muted">
              {event.content}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
