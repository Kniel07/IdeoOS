import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/kv";

const COLLECTIONS = [
  "ideas",
  "events",
  "requirements",
  "tasks",
  "questions",
  "research",
] as const;

type Store = Record<(typeof COLLECTIONS)[number], Record<string, unknown>>;

const EMPTY_STORE: Store = {
  ideas: {},
  events: {},
  requirements: {},
  tasks: {},
  questions: {},
  research: {},
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial
    Record<(typeof COLLECTIONS)[number], Array<{ id: string }>>
  >;

  const store = await kvGet<Store>(EMPTY_STORE);
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

  await kvSet(store);
  return NextResponse.json({ written });
}

export async function GET() {
  const store = await kvGet<Store>(EMPTY_STORE);
  return NextResponse.json(store);
}
