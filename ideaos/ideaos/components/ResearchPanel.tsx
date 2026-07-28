"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";

export function ResearchPanel({ ideaId }: { ideaId: string }) {
  const notes = useLiveQuery(
    () => db.research.where("ideaId").equals(ideaId).reverse().sortBy("createdAt"),
    [ideaId]
  );

  if (!notes) return null;

  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted">
        Nothing here yet — links, references, and decisions land in this tab.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {notes.map((note) => (
        <div key={note.id} className="card space-y-1.5 p-3">
          <p className="text-sm font-medium text-ink">{note.title}</p>
          <p className="text-sm text-muted">{note.summary}</p>
        </div>
      ))}
    </div>
  );
}
