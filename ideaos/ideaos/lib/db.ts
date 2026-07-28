import Dexie, { type Table } from "dexie";
import type {
  Idea,
  CaptureEvent,
  Requirement,
  Task,
  Question,
  ResearchNote,
} from "./types";

class IdeaOSDatabase extends Dexie {
  ideas!: Table<Idea, string>;
  events!: Table<CaptureEvent, string>;
  requirements!: Table<Requirement, string>;
  tasks!: Table<Task, string>;
  questions!: Table<Question, string>;
  research!: Table<ResearchNote, string>;

  constructor() {
    super("ideaos");
    this.version(1).stores({
      ideas: "id, updatedAt, syncStatus",
      events: "id, ideaId, createdAt, processedAt, syncStatus",
      requirements: "id, ideaId, status, syncStatus",
      tasks: "id, ideaId, status, syncStatus",
      questions: "id, ideaId, answered, syncStatus",
      research: "id, ideaId, syncStatus",
    });
  }
}

// A single instance for the whole app. This only runs in the browser —
// any server-side import is a mistake and should fail loudly, not
// silently fall back to something else.
export const db =
  typeof window !== "undefined"
    ? new IdeaOSDatabase()
    : (new Proxy(
        {},
        {
          get() {
            throw new Error(
              "db accessed on the server — IndexedDB only exists in the browser"
            );
          },
        }
      ) as IdeaOSDatabase);
