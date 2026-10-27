import { useEffect, useState, useCallback } from "react";

export type InstantHireStage = "sent" | "accepted" | "started" | "completed" | "cancelled";

export type InstantHireRequest = {
  id: string;
  workerId: string;
  workerName: string;
  workerAvatarUrl?: string | null;
  etaMinutes: number;
  distanceKm: number;
  createdAt: number;
  acceptedAt?: number;
  startedAt?: number;
  completedAt?: number;
  cancelledAt?: number;
  stage: InstantHireStage;
  jobTitle?: string;
};

const KEY = "gigsclose:active-hire";
const EVENT = "gigsclose:active-hire";

function read(): InstantHireRequest | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InstantHireRequest;
  } catch {
    return null;
  }
}

function write(value: InstantHireRequest | null) {
  if (typeof window === "undefined") return;
  if (value) {
    window.localStorage.setItem(KEY, JSON.stringify(value));
  } else {
    window.localStorage.removeItem(KEY);
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
}

export function startInstantHire(request: Omit<InstantHireRequest, "id" | "createdAt" | "stage">) {
  const next: InstantHireRequest = {
    ...request,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
    stage: "sent",
  };
  write(next);

  // Demo flow: simulate accepted then started transitions for visible feedback.
  const acceptDelay = 4_500;
  const startDelay = 11_000;
  window.setTimeout(() => {
    const current = read();
    if (!current || current.id !== next.id || current.stage !== "sent") return;
    write({ ...current, stage: "accepted", acceptedAt: Date.now() });
  }, acceptDelay);
  window.setTimeout(() => {
    const current = read();
    if (!current || current.id !== next.id || current.stage !== "accepted") return;
    write({ ...current, stage: "started", startedAt: Date.now() });
  }, startDelay);

  return next;
}

export function clearInstantHire() {
  write(null);
}

export function useActiveInstantHire() {
  const [request, setRequest] = useState<InstantHireRequest | null>(read);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as InstantHireRequest | null;
      setRequest(detail ?? null);
    };
    const storageHandler = (event: StorageEvent) => {
      if (event.key === KEY) setRequest(read());
    };
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const dismiss = useCallback(() => clearInstantHire(), []);

  return { request, dismiss };
}
