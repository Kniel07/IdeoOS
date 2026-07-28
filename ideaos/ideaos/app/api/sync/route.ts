import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// v1 storage: one JSON file, keyed by record id, per collection.
// This is a receiver, not a database — it never merges, diffs, or
// resolves conflicts. Records are the client's IndexedDB truth,
// pushed once. Swap this file for a real database later without
// touching the client: the contract (POST full collections, get 200)
// stays the same.

const STORE_PATH = path.join(process.cwd(), "data", "store.json");

const COLLECTIONS = [
  "ideas",
  "events",
  "requirements",
  "tasks",
  "questions",
  "research",
] as const;

type Store = Record<(typeof COLLECTIONS)[number], Record<string, unknown>>;

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {
      ideas: {},
      events: {},
      requirements: {},
      tasks: {},
      questions: {},
      research: {},
    };
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<
    Record<(typeof COLLECTIONS)[number], Array<{ id: string }>>
  >;

  const store = await readStore();
  let written = 0;

  for (const collection of COLLECTIONS) {
    const records = body[collection];
    if (!records) continue;
    for (const record of records) {
      if (!record.id) {
        return NextResponse.json(
          { error: `record in ${collection} is missing an id` },
          { status: 400 }
        );
      }
      store[collection][record.id] = record;
      written += 1;
    }
  }

  await writeStore(store);
  return NextResponse.json({ written });
}

export async function GET() {
  const store = await readStore();
  return NextResponse.json(store);
}
