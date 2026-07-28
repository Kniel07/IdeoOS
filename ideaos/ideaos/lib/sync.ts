import { db } from "./db";

export interface SyncResult {
  pushedIdeas: number;
  pushedEvents: number;
  pushedRequirements: number;
  pushedTasks: number;
  pushedQuestions: number;
  pushedResearch: number;
}

/**
 * Push every locally-created record to the server, then mark it synced.
 * One direction only: local -> server. The server never talks back
 * with changes to apply. If the request fails, this throws and nothing
 * is marked synced — the caller decides whether to retry.
 */
export async function pushToCloud(): Promise<SyncResult> {
  const [ideas, events, requirements, tasks, questions, research] =
    await Promise.all([
      db.ideas.where("syncStatus").equals("local").toArray(),
      db.events.where("syncStatus").equals("local").toArray(),
      db.requirements.where("syncStatus").equals("local").toArray(),
      db.tasks.where("syncStatus").equals("local").toArray(),
      db.questions.where("syncStatus").equals("local").toArray(),
      db.research.where("syncStatus").equals("local").toArray(),
    ]);

  const nothingToPush =
    ideas.length +
      events.length +
      requirements.length +
      tasks.length +
      questions.length +
      research.length ===
    0;

  if (nothingToPush) {
    return {
      pushedIdeas: 0,
      pushedEvents: 0,
      pushedRequirements: 0,
      pushedTasks: 0,
      pushedQuestions: 0,
      pushedResearch: 0,
    };
  }

  const response = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ideas, events, requirements, tasks, questions, research }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Sync failed (${response.status}): ${detail}`);
  }

  await Promise.all([
    db.ideas.bulkUpdate(ideas.map((r) => ({ key: r.id, changes: { syncStatus: "synced" } }))),
    db.events.bulkUpdate(events.map((r) => ({ key: r.id, changes: { syncStatus: "synced" } }))),
    db.requirements.bulkUpdate(
      requirements.map((r) => ({ key: r.id, changes: { syncStatus: "synced" } }))
    ),
    db.tasks.bulkUpdate(tasks.map((r) => ({ key: r.id, changes: { syncStatus: "synced" } }))),
    db.questions.bulkUpdate(
      questions.map((r) => ({ key: r.id, changes: { syncStatus: "synced" } }))
    ),
    db.research.bulkUpdate(
      research.map((r) => ({ key: r.id, changes: { syncStatus: "synced" } }))
    ),
  ]);

  return {
    pushedIdeas: ideas.length,
    pushedEvents: events.length,
    pushedRequirements: requirements.length,
    pushedTasks: tasks.length,
    pushedQuestions: questions.length,
    pushedResearch: research.length,
  };
}

export async function countPendingSync(): Promise<number> {
  const [i, e, r, t, q, res] = await Promise.all([
    db.ideas.where("syncStatus").equals("local").count(),
    db.events.where("syncStatus").equals("local").count(),
    db.requirements.where("syncStatus").equals("local").count(),
    db.tasks.where("syncStatus").equals("local").count(),
    db.questions.where("syncStatus").equals("local").count(),
    db.research.where("syncStatus").equals("local").count(),
  ]);
  return i + e + r + t + q + res;
}
