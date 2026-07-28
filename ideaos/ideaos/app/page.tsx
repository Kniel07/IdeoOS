"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { createIdea } from "@/lib/actions";
import { IdeaCard } from "@/components/IdeaCard";

export default function DashboardPage() {
  const ideas = useLiveQuery(() => db.ideas.orderBy("updatedAt").reverse().toArray());
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createIdea(name);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create idea");
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-ink">Ideas</h1>
          <p className="text-sm text-muted">Every idea is a living workspace.</p>
        </div>
        <form onSubmit={handleCreate} className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New idea name…"
            className="w-56 rounded-md border border-border bg-raised px-3 py-1.5 text-sm text-ink placeholder:text-faint focus:border-accent"
          />
          <button type="submit" className="btn-primary">
            New Idea
          </button>
        </form>
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {ideas && ideas.length === 0 && (
        <div className="card flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-ink">No ideas yet.</p>
          <p className="text-sm text-muted">
            Name your first one above — everything else builds itself from there.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ideas?.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} />
        ))}
      </div>
    </div>
  );
}
