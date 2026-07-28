import type { Classification } from "./types";

export async function classifyCapture(content: string): Promise<Classification> {
  const response = await fetch("/api/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Classification failed (${response.status}): ${detail}`);
  }

  return response.json();
}
