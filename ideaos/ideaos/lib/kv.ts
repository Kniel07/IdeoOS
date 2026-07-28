const STORE_KEY = "ideaos:store";

function envOrThrow(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local (dev) or your host's env vars (prod).`
    );
  }
  return value;
}

async function kvRequest(path: string): Promise<unknown> {
  const url = envOrThrow("UPSTASH_REDIS_REST_URL");
  const token = envOrThrow("UPSTASH_REDIS_REST_TOKEN");

  const response = await fetch(`${url}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Upstash request failed (${response.status}): ${await response.text()}`);
  }
  return response.json();
}

export async function kvGet<T>(fallback: T): Promise<T> {
  const result = (await kvRequest(`/get/${STORE_KEY}`)) as { result: string | null };
  if (!result.result) return fallback;
  return JSON.parse(result.result) as T;
}

export async function kvSet(value: unknown): Promise<void> {
  const url = envOrThrow("UPSTASH_REDIS_REST_URL");
  const token = envOrThrow("UPSTASH_REDIS_REST_TOKEN");

  const response = await fetch(`${url}/set/${STORE_KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(JSON.stringify(value)),
  });

  if (!response.ok) {
    throw new Error(`Upstash write failed (${response.status}): ${await response.text()}`);
  }
}
