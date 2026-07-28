import { NextRequest, NextResponse } from "next/server";
import type { Classification } from "@/lib/types";

const SYSTEM_PROMPT = `You are the classification engine inside a personal knowledge OS.
Given a single raw thought captured by the user, classify it into exactly one of:
requirement, task, question, research, decision.

- requirement: something the project must have or do
- task: a concrete action, especially one phrased as already done or to be done
- question: something unresolved the user needs to decide or find out
- research: a link, reference, library, article, or idea worth remembering
- decision: a choice the user has explicitly made

Respond with ONLY a JSON object, no prose, no markdown fences:
{
  "type": "requirement" | "task" | "question" | "research" | "decision",
  "title": string,        // short, imperative, <= 12 words
  "priority": "low" | "medium" | "high",   // only meaningful for requirement/task
  "tags": string[],       // 0-4 short lowercase tags
  "confidence": number,   // 0-1
  "reasoning": string     // one sentence, <= 20 words
}`;

export async function POST(request: NextRequest) {
  const { content } = (await request.json()) as { content?: string };

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  if (!process.env.GROQ_API_KEY) {
    return NextResponse.json(
      { error: "GROQ_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: content.trim() },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: `Groq request failed (${response.status}): ${detail}` },
      { status: 502 }
    );
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    return NextResponse.json({ error: "Model returned no text" }, { status: 502 });
  }

  let classification: Classification;
  try {
    classification = JSON.parse(text.trim());
  } catch {
    return NextResponse.json(
      { error: "Model response was not valid JSON", raw: text },
      { status: 502 }
    );
  }

  return NextResponse.json(classification);
}
