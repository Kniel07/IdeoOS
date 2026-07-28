# IdeaOS (v1)

A personal knowledge OS: capture raw thoughts, let AI classify them into
requirements/tasks/questions/research, watch the workspace fill itself in.

## Architecture, in one paragraph

The browser's IndexedDB (via Dexie) is the **only** source of truth. Every
capture is an immutable event; AI classification turns an event into exactly
one derived record. The app works fully offline. When you're back online,
nothing syncs automatically — you press **Push to cloud** in the sidebar,
which sends every locally-created record to the server once and marks it
synced. The server (`/api/sync`) never sends changes back; it's a receiver,
not a second source of truth. This keeps the sync model to one direction and
one trigger, on purpose.

## Setup

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open http://localhost:3000. Create an idea, type into the capture bar, watch
it get classified and filed.

No API key? The app still works — captures land in the Inbox and stay
unprocessed until you hit "File now" (which retries classification).

## What's built (v1)

- Dashboard with live idea cards (readiness score, stage, pending items)
- Idea workspace: Overview, Inbox, Requirements, Tasks (kanban), Questions
- Universal capture bar wired to real Claude classification
- AI Assistant panel: readiness score, open questions, suggested next step
- Offline-first storage (IndexedDB), manual one-way push-to-cloud with
  online/offline detection

## Deliberately deferred

Per the original spec's own "Future Scalability" section, these are additive
and don't require touching what's built:

- Knowledge Graph (visual node/edge view over the same data)
- Timeline (a read view over the existing event log — the data's already
  event-sourced, so this is a pure UI addition)
- Markdown/JSON/PDF export
- Cross-workspace intelligence (duplicate detection, smart recall, linking)
- Templates, Archive, global semantic search, notifications

## Swapping the storage backend later

`/api/sync` currently writes to a JSON file at `data/store.json`. The
contract (`POST` full collections, `200` on success) is the only thing the
client depends on — replace the file I/O with a real database without
touching `lib/sync.ts` or any component.
