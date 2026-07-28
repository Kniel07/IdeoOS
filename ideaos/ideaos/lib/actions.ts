import { nanoid } from "nanoid";
import { db } from "./db";
import type { Classification, Idea, CaptureEvent } from "./types";

export async function createIdea(name: string): Promise<Idea> {
  if (!name.trim()) throw new Error("Idea name cannot be empty");
  const now = Date.now();
  const idea: Idea = {
    id: nanoid(),
    name: name.trim(),
    createdAt: now,
    updatedAt: now,
    stage: "capturing",
    syncStatus: "local",
  };
  await db.ideas.add(idea);
  return idea;
}

/** Step 1 of capture: record the raw thought immediately, unprocessed. */
export async function captureThought(
  ideaId: string,
  content: string
): Promise<CaptureEvent> {
  if (!content.trim()) throw new Error("Capture content cannot be empty");
  const event: CaptureEvent = {
    id: nanoid(),
    ideaId,
    content: content.trim(),
    createdAt: Date.now(),
    processedAt: null,
    syncStatus: "local",
  };
  await db.events.add(event);
  await db.ideas.update(ideaId, { updatedAt: Date.now() });
  return event;
}

/**
 * Step 2 of capture: apply an AI classification result to a raw event,
 * materializing it into exactly one derived record. This is the only
 * function allowed to move an event out of the Inbox.
 */
export async function applyClassification(
  event: CaptureEvent,
  classification: Classification
): Promise<void> {
  const now = Date.now();
  const base = {
    id: nanoid(),
    ideaId: event.ideaId,
    sourceEventId: event.id,
    createdAt: now,
    syncStatus: "local" as const,
  };

  switch (classification.type) {
    case "requirement":
      await db.requirements.add({
        ...base,
        title: classification.title,
        priority: classification.priority ?? "medium",
        status: "open",
        confidence: classification.confidence,
        tags: classification.tags,
      });
      break;
    case "task":
      await db.tasks.add({
        ...base,
        title: classification.title,
        status: "todo",
      });
      break;
    case "question":
      await db.questions.add({
        ...base,
        question: classification.title,
        answered: false,
        answer: null,
      });
      break;
    case "research":
    case "decision":
      await db.research.add({
        ...base,
        title: classification.title,
        summary: classification.reasoning,
      });
      break;
    default:
      throw new Error(`Unknown classification type: ${classification.type}`);
  }

  await db.events.update(event.id, { processedAt: now });
  await db.ideas.update(event.ideaId, { updatedAt: now });
}

export async function moveTaskStatus(
  taskId: string,
  status: "todo" | "in_progress" | "completed"
): Promise<void> {
  await db.tasks.update(taskId, { status });
}

export async function answerQuestion(
  questionId: string,
  answer: string
): Promise<void> {
  if (!answer.trim()) throw new Error("Answer cannot be empty");
  await db.questions.update(questionId, { answered: true, answer: answer.trim() });
}
