"use client";

import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import { CaptureBar } from "@/components/CaptureBar";
import { AIAssistantPanel } from "@/components/AIAssistantPanel";
import { InboxPanel } from "@/components/InboxPanel";
import { RequirementsPanel } from "@/components/RequirementsPanel";
import { TaskBoard } from "@/components/TaskBoard";
import { QuestionsPanel } from "@/components/QuestionsPanel";

const TABS = ["Overview", "Inbox", "Requirements", "Tasks", "Questions"] as const;
type Tab = (typeof TABS)[number];

export default function WorkspacePage({ params }: { params: { id: string } }) {
  const idea = useLiveQuery(() => db.ideas.get(params.id), [params.id]);
  const [tab, setTab] = useState<Tab>("Overview");

  if (idea === undefined) return null;
  if (idea === null) {
    return (
      <div className="p-8 text-sm text-muted">
        This idea doesn't exist locally. It may live only on another device that hasn't synced.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <WorkspaceHeader idea={idea} />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-y-auto px-8 py-6">
          <div className="mb-6">
            <CaptureBar ideaId={idea.id} />
          </div>

          <div className="mb-6 flex gap-1 border-b border-border">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`border-b-2 px-3 py-2 text-sm transition-colors ${
                  tab === t
                    ? "border-accent text-ink"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && <OverviewTab ideaId={idea.id} />}
          {tab === "Inbox" && <InboxPanel ideaId={idea.id} />}
          {tab === "Requirements" && <RequirementsPanel ideaId={idea.id} />}
          {tab === "Tasks" && <TaskBoard ideaId={idea.id} />}
          {tab === "Questions" && <QuestionsPanel ideaId={idea.id} />}
        </div>

        <AIAssistantPanel ideaId={idea.id} />
      </div>
    </div>
  );
}

function OverviewTab({ ideaId }: { ideaId: string }) {
  const events = useLiveQuery(
    () => db.events.where("ideaId").equals(ideaId).reverse().sortBy("createdAt"),
    [ideaId]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xs font-medium uppercase tracking-wider text-faint">Recent activity</h2>
      {events && events.length === 0 && (
        <p className="text-sm text-muted">
          Nothing captured yet. Type a thought into the bar above — it becomes the workspace.
        </p>
      )}
      <div className="space-y-2">
        {events?.slice(0, 10).map((event) => (
          <div key={event.id} className="card px-3 py-2 text-sm text-ink">
            {event.content}
          </div>
        ))}
      </div>
    </div>
  );
}
