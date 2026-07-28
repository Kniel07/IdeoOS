"use client";

import { useState } from "react";
import { captureThought, applyClassification } from "@/lib/actions";
import { classifyCapture } from "@/lib/ai";

type Stage = "idle" | "understanding" | "extracting" | "updating" | "done" | "error";

const STAGE_LABEL: Record<Stage, string> = {
  idle: "",
  understanding: "Understanding…",
  extracting: "Extracting…",
  updating: "Updating workspace…",
  done: "Filed",
  error: "Couldn't process — kept in Inbox",
};

export function CaptureBar({ ideaId }: { ideaId: string }) {
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<Stage>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = value.trim();
    if (!content || stage !== "idle") return;

    setValue("");
    const event = await captureThought(ideaId, content);

    setStage("understanding");
    try {
      setStage("extracting");
      const classification = await classifyCapture(content);
      setStage("updating");
      await applyClassification(event, classification);
      setStage("done");
    } catch {
      // Capture already landed in the Inbox unprocessed — nothing is lost.
      // No retry loop here; the user can re-run classification from the Inbox.
      setStage("error");
    } finally {
      setTimeout(() => setStage("idle"), 1400);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card flex items-center gap-3 px-4 py-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What are you thinking?"
        className="flex-1 bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
      />
      {stage !== "idle" ? (
        <span
          className={`pill ${stage === "error" ? "bg-danger/15 text-danger" : "bg-signal/15 text-signal"}`}
        >
          {STAGE_LABEL[stage]}
        </span>
      ) : (
        <button type="submit" className="btn-primary">
          Add
        </button>
      )}
    </form>
  );
}
