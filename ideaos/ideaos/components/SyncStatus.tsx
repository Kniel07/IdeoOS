"use client";

import { useEffect, useState } from "react";
import { countPendingSync, pushToCloud } from "@/lib/sync";

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const count = await countPendingSync();
      if (!cancelled) setPending(count);
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [pushing]);

  async function handlePush() {
    setError(null);
    setPushing(true);
    try {
      await pushToCloud();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Push failed");
    } finally {
      setPushing(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted">
        <span
          className={`h-1.5 w-1.5 rounded-full ${isOnline ? "bg-ok" : "bg-faint"}`}
        />
        {isOnline ? "Online" : "Offline — working locally"}
      </div>

      <button
        onClick={handlePush}
        disabled={!isOnline || pushing || pending === 0}
        className="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pushing
          ? "Pushing…"
          : pending === 0
            ? "All synced"
            : `Push ${pending} to cloud`}
      </button>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
