import { useEffect, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";

export type AppPreferences = {
  vibrationInstantHire: boolean;
  vibrationAutoMatch: boolean;
  notificationsInstantHire: boolean;
  notificationsAutoMatch: boolean;
  liveFeedSound: boolean;
};

const KEY = "gigsclose:preferences";
const JOB_ALERT_CHANNEL_ID = "nearby-jobs";

export const DEFAULT_PREFERENCES: AppPreferences = {
  vibrationInstantHire: true,
  vibrationAutoMatch: true,
  notificationsInstantHire: true,
  notificationsAutoMatch: true,
  liveFeedSound: false,
};

function read(): AppPreferences {
  if (typeof window === "undefined") return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<AppPreferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function getPreferences(): AppPreferences {
  return read();
}

export function setPreferences(next: AppPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("gigsclose:preferences", { detail: next }));
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<AppPreferences>(read);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as AppPreferences | undefined;
      if (detail) setPrefsState(detail);
    };
    window.addEventListener("gigsclose:preferences", handler);
    return () => window.removeEventListener("gigsclose:preferences", handler);
  }, []);

  const update = useCallback((patch: Partial<AppPreferences>) => {
    const next = { ...read(), ...patch };
    setPreferences(next);
    setPrefsState(next);
  }, []);

  return { prefs, update };
}

export function safeVibrate(pattern: number | number[], enabled: boolean) {
  if (!enabled) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

export function safeNotify(title: string, body: string, enabled: boolean) {
  if (!enabled) return;
  if (Capacitor.isNativePlatform()) {
    void showNativeNotification(title, body);
    return;
  }
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    void showAppNotification(title, body);
  } else if (Notification.permission === "default") {
    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        void showAppNotification(title, body);
      }
    });
  }
}

async function showNativeNotification(title: string, body: string) {
  try {
    const permission = await ensureNativeNotificationPermission();
    if (permission !== "granted") return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: Math.floor(Date.now() % 2147483647),
          title,
          body,
          largeBody: body,
          summaryText: "GigsClose nearby job alert",
          channelId: JOB_ALERT_CHANNEL_ID,
          group: "nearby-jobs",
          autoCancel: true,
          extra: { url: "/app" },
        },
      ],
    });
  } catch {
    /* ignore */
  }
}

async function ensureNativeNotificationPermission(): Promise<NotificationPermission> {
  try {
    await ensureNotificationChannel();
    const current = await LocalNotifications.checkPermissions();
    if (current.display === "granted") return "granted";
    const requested = await LocalNotifications.requestPermissions();
    return requested.display === "granted" ? "granted" : "denied";
  } catch {
    return "denied";
  }
}

async function ensureNotificationChannel() {
  if (Capacitor.getPlatform() !== "android") return;
  try {
    await LocalNotifications.createChannel({
      id: JOB_ALERT_CHANNEL_ID,
      name: "Nearby jobs",
      description: "Alerts when a job appears near your selected area.",
      importance: 4,
      visibility: 1,
      vibration: true,
      lights: true,
      lightColor: "#0EA5E9",
    });
  } catch {
    /* ignore */
  }
}

async function showAppNotification(title: string, body: string) {
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "gigclose-nearby-job",
        data: { url: "/app" },
      });
      return;
    }
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    try {
      new Notification(title, { body, icon: "/favicon.ico" });
    } catch {
      /* ignore */
    }
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (Capacitor.isNativePlatform()) return ensureNativeNotificationPermission();
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function registerNotificationNavigationHandler() {
  if (!Capacitor.isNativePlatform()) return;
  LocalNotifications.addListener("localNotificationActionPerformed", (event) => {
    const url = event.notification.extra?.url;
    if (typeof url === "string" && url.startsWith("/")) {
      window.location.assign(url);
    }
  }).catch(() => {
    /* ignore */
  });
}
