import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { DEFAULT_LOCATION, nearestArea } from "@/lib/gigs";

export type LocationQuality = "excellent" | "good" | "fair" | "poor" | "unknown";

export type LiveLocation = {
  lat: number;
  lng: number;
  label: string;
  accuracy?: number;
  source: "gps" | "profile" | "default";
  updatedAt?: number;
  quality?: LocationQuality;
};

const STORAGE_KEY = "gigsclose:last-location";
const REFRESH_INTERVAL_MS = 60_000; // background refresh every 60s

function qualityFromAccuracy(accuracy?: number): LocationQuality {
  if (accuracy == null || !Number.isFinite(accuracy)) return "unknown";
  if (accuracy <= 25) return "excellent";
  if (accuracy <= 75) return "good";
  if (accuracy <= 250) return "fair";
  return "poor";
}

function readCached(): LiveLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LiveLocation;
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCached(loc: LiveLocation) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    /* ignore */
  }
}

/**
 * Aggressive geolocation: prompts on first app load, caches result, persists
 * to the user profile, and periodically refreshes in the background so distance
 * and ETA remain accurate. Returns a quality indicator based on GPS accuracy.
 */
export function useGeolocation() {
  const { user } = useAuth();
  const [location, setLocation] = useState<LiveLocation>(() => {
    const cached = readCached();
    if (cached) return { ...cached, quality: cached.quality ?? qualityFromAccuracy(cached.accuracy) };
    return { ...DEFAULT_LOCATION, source: "default", quality: "unknown" };
  });
  const [status, setStatus] = useState<"idle" | "prompting" | "granted" | "denied" | "unsupported">(
    typeof navigator !== "undefined" && "geolocation" in navigator ? "idle" : "unsupported",
  );
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const persist = useCallback(
    async (loc: LiveLocation) => {
      writeCached(loc);
      if (!user) return;
      await supabase
        .from("profiles")
        .update({
          latitude: Number(loc.lat.toFixed(6)),
          longitude: Number(loc.lng.toFixed(6)),
          city: loc.label,
          location_updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    },
    [user],
  );

  const handlePosition = useCallback(
    (pos: GeolocationPosition, source: "gps" = "gps") => {
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const area = nearestArea(point);
      const next: LiveLocation = {
        ...point,
        label: area.label,
        accuracy: pos.coords.accuracy,
        source,
        updatedAt: Date.now(),
        quality: qualityFromAccuracy(pos.coords.accuracy),
      };
      setLocation(next);
      setStatus("granted");
      void persist(next);
    },
    [persist],
  );

  const request = useCallback((): Promise<string | null> => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      const message = typeof window !== "undefined" && !window.isSecureContext
        ? "Location requires a secure connection. Open this app over HTTPS or localhost."
        : "Location is not supported by this browser.";
      setError(message);
      return Promise.resolve(message);
    }

    setStatus("prompting");
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handlePosition(pos);
          resolve(null);
        },
        (geoError) => {
          setStatus(geoError.code === geoError.PERMISSION_DENIED ? "denied" : "idle");
          const message = geoError.code === geoError.PERMISSION_DENIED
            ? "Location access is blocked. Allow location access in your browser settings, then try again."
            : geoError.code === geoError.POSITION_UNAVAILABLE
              ? "Your location could not be determined. Check your device location settings and try again."
              : "Getting your location timed out. Try again when you have a stronger GPS or network signal.";
          setError(message);
          resolve(message);
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
      );
    });
  }, [handlePosition]);

  // Auto-prompt once
  useEffect(() => {
    if (status !== "idle") return;
    request();
  }, [request, status]);

  // Continuous + periodic refresh once granted
  useEffect(() => {
    if (status !== "granted" || typeof navigator === "undefined" || !navigator.geolocation) return;

    // Watch for movement
    if (watchIdRef.current == null) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => handlePosition(pos),
        () => {
          /* ignore transient errors */
        },
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 30_000 },
      );
    }

    // Periodic re-fetch in case watch goes silent (background tab)
    if (intervalRef.current == null) {
      intervalRef.current = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => handlePosition(pos),
          () => {
            /* ignore */
          },
          { enableHighAccuracy: false, timeout: 8_000, maximumAge: 30_000 },
        );
      }, REFRESH_INTERVAL_MS);
    }

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status, handlePosition]);

  return { location, status, error, request, setLocation };
}
