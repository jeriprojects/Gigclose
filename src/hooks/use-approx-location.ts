import { useEffect, useState } from "react";
import { DEFAULT_LOCATION, nearestArea } from "@/lib/gigs";

export type ApproxLocation = {
  lat: number;
  lng: number;
  label: string;
  city?: string;
  country?: string;
  source: "ip" | "fallback";
};

const STORAGE_KEY = "gigclose:approx-location";

function readCached(): ApproxLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ApproxLocation;
  } catch {
    return null;
  }
}

function writeCached(location: ApproxLocation) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch {
    /* ignore */
  }
}

export function useApproxLocation() {
  const [location, setLocation] = useState<ApproxLocation>(() => readCached() ?? { ...DEFAULT_LOCATION, source: "fallback" });
  const [loading, setLoading] = useState(!readCached());

  useEffect(() => {
    let active = true;

    const detect = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("ip lookup failed");
        const data = await response.json();
        if (!active) return;
        const point = {
          lat: Number(data.latitude),
          lng: Number(data.longitude),
        };
        if (!Number.isFinite(point.lat) || !Number.isFinite(point.lng)) throw new Error("invalid coordinates");
        const nearest = nearestArea(point);
        const next: ApproxLocation = {
          lat: point.lat,
          lng: point.lng,
          label: nearest.label,
          city: data.city,
          country: data.country_name,
          source: "ip",
        };
        setLocation(next);
        writeCached(next);
      } catch {
        if (!active) return;
        setLocation({ ...DEFAULT_LOCATION, source: "fallback" });
      } finally {
        if (active) setLoading(false);
      }
    };

    void detect();

    return () => {
      active = false;
    };
  }, []);

  return { location, loading };
}
