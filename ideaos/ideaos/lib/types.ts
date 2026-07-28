// IdeaOS data model.
//
// One rule governs all of this: the local IndexedDB record is the truth.
// `syncStatus` only ever moves "local" -> "synced", set by a successful
// server response. Nothing else is allowed to flip it. There is no merge,
// no conflict state, no partial-sync — push succeeds or it throws.

export type SyncStatus = "local" | "synced";

export type Stage =
  | "capturing"
  | "defining"
  | "ready_for_prototype"
  | "in_progress"
  | "shipped";

export interface Idea {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  stage: Stage;
  syncStatus: SyncStatus;
}

/** Every thought the user captures, verbatim, before AI touches it. */
export interface CaptureEvent {
  id: string;
  ideaId: string;
  content: string;
  createdAt: number;
  /** Set once /api/classify has returned a result for this capture. */
  processedAt: number | null;
  syncStatus: SyncStatus;
}

export type ClassificationType =
  | "requirement"
  | "task"
  | "question"
  | "research"
  | "decision";

export interface Classification {
  type: ClassificationType;
  title: string;
  priority?: "low" | "medium" | "high";
  tags: string[];
  confidence: number; // 0-1
  reasoning: string;
}

export interface Requirement {
  id: string;
  ideaId: string;
  sourceEventId: string;
  title: string;
  priority: "low" | "medium" | "high";
  status: "open" | "addressed";
  confidence: number;
  tags: string[];
  createdAt: number;
  syncStatus: SyncStatus;
}

export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  ideaId: string;
  sourceEventId: string;
  title: string;
  status: TaskStatus;
  createdAt: number;
  syncStatus: SyncStatus;
}

export interface Question {
  id: string;
  ideaId: string;
  sourceEventId: string;
  question: string;
  answered: boolean;
  answer: string | null;
  createdAt: number;
  syncStatus: SyncStatus;
}

export interface ResearchNote {
  id: string;
  ideaId: string;
  sourceEventId: string;
  title: string;
  summary: string;
  createdAt: number;
  syncStatus: SyncStatus;
}
