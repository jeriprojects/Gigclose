import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/gigclose/AppShell";
import { WorkerSkillsSelector } from "@/components/gigclose/WorkerSkillsSelector";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfessionalProfileSettings from "@/components/gigclose/ProfessionalProfileSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { supabase } from "@/integrations/supabase/client";
import { usePreferences, requestNotificationPermission } from "@/lib/preferences";
import { Bell, Smartphone, Sparkles, Volume2, Zap } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useCurrentProfile();
  const { prefs, update } = usePreferences();
  const [workerSkills, setWorkerSkills] = useState<string[]>([]);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    Capacitor.isNativePlatform()
      ? "default"
      : typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported",
  );

  useEffect(() => {
    if (profile) setWorkerSkills(profile.skills ?? []);
  }, [profile]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const interval = window.setInterval(() => {
      setNotifPermission(Notification.permission);
    }, 2_000);
    return () => window.clearInterval(interval);
  }, []);

  const enableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifPermission(result);
    if (result === "granted") {
      toast.success("Notifications enabled");
    } else if (result === "denied") {
      toast.error("Notifications blocked", {
        description: "Update permissions in your browser to receive Instant Hire alerts.",
      });
    }
  };

  const testVibration = () => {
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) {
      toast.error("Vibration not supported on this device");
      return;
    }
    navigator.vibrate([30, 60, 30]);
    toast("Vibration test sent");
  };

  const saveWorkerSkills = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to update your skills.");
      const { error } = await supabase
        .from("profiles")
        .update({ skills: workerSkills })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
      toast.success("Skills saved", { description: "AutoMatch will use your updated skills." });
    },
    onError: (error: Error) => toast.error("Could not save skills", { description: error.message }),
  });

  return (
    <AppShell>
      <div className="container max-w-2xl py-6">
        <header className="gig-hero-panel signed-in-hero--gray mb-5 p-6 sm:p-8">
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Manage your account preferences and professional profile.
          </p>
        </header>

        <Tabs defaultValue="preferences">
          <TabsList className="mb-4 grid h-auto w-full grid-cols-2 rounded-xl bg-muted p-1 sm:w-fit">
            <TabsTrigger value="preferences" className="rounded-lg px-4 py-2">Preferences</TabsTrigger>
            {profile?.account_type === "worker" && (
              <TabsTrigger value="professional-profile" className="rounded-lg px-4 py-2">Professional profile</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="preferences" className="mt-0">
        {profile?.account_type === "worker" && (
          <section className="gig-panel mb-4 p-5">
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Skills for AutoMatch
            </h2>
            <p className="mb-4 mt-1 text-sm text-muted-foreground">
              Select the work you can do. AutoMatch prioritizes open jobs in these skill areas.
            </p>
            <WorkerSkillsSelector
              value={workerSkills}
              onChange={setWorkerSkills}
              disabled={saveWorkerSkills.isPending}
            />
            <Button
              onClick={() => saveWorkerSkills.mutate()}
              disabled={saveWorkerSkills.isPending || !profile || workerSkills.length === 0}
              className="mt-5"
            >
              {saveWorkerSkills.isPending ? "Saving skills..." : "Save skills"}
            </Button>
          </section>
        )}

        <section className="gig-panel p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> System notifications
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {Capacitor.isNativePlatform() ? "Device" : "Browser"} permission status:{" "}
                <span className="font-semibold text-foreground capitalize">{notifPermission}</span>
              </p>
            </div>
            {notifPermission !== "granted" && notifPermission !== "unsupported" && (
              <Button size="sm" onClick={enableNotifications} className="rounded-full">
                Enable
              </Button>
            )}
          </div>
          {notifPermission === "denied" && (
            <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
              Notifications are blocked in your browser. Re-enable from your browser's site permissions, then come back here.
            </p>
          )}
        </section>

        <section className="gig-panel mt-4 p-5">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary fill-current" /> Instant Hire alerts
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Used when someone confirms an Instant Hire request involving you.
          </p>
          <div className="mt-4 space-y-3">
            <Toggle
              icon={<Smartphone className="h-4 w-4 text-primary" />}
              label="Vibration"
              description="Buzz your device on send and on response."
              checked={prefs.vibrationInstantHire}
              onChange={(v) => update({ vibrationInstantHire: v })}
            />
            <Toggle
              icon={<Bell className="h-4 w-4 text-primary" />}
              label="Push notifications"
              description="Show a system notification when the worker accepts."
              checked={prefs.notificationsInstantHire}
              onChange={(v) => update({ notificationsInstantHire: v })}
            />
          </div>
        </section>

        <section className="gig-panel mt-4 p-5">
          <h2 className="font-display text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" /> AutoMatch alerts
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Used when Auto-Earn Mode finds a job ready for you.
          </p>
          <div className="mt-4 space-y-3">
            <Toggle
              icon={<Smartphone className="h-4 w-4 text-primary" />}
              label="Vibration"
              description="Buzz when a new auto-match is offered."
              checked={prefs.vibrationAutoMatch}
              onChange={(v) => update({ vibrationAutoMatch: v })}
            />
            <Toggle
              icon={<Bell className="h-4 w-4 text-primary" />}
              label="Push notifications"
              description="System notification with the gig title and ETA."
              checked={prefs.notificationsAutoMatch}
              onChange={(v) => update({ notificationsAutoMatch: v })}
            />
            <Toggle
              icon={<Volume2 className="h-4 w-4 text-primary" />}
              label="Live feed sound"
              description="Quiet chime when new gigs appear in the live feed."
              checked={prefs.liveFeedSound}
              onChange={(v) => update({ liveFeedSound: v })}
            />
          </div>
          <Button onClick={testVibration} variant="outline" className="rounded-full mt-4">
            Test vibration
          </Button>
        </section>
          </TabsContent>

          {profile?.account_type === "worker" && (
            <TabsContent value="professional-profile" className="mt-0">
              <ProfessionalProfileSettings />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
};

const Toggle = ({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/70 p-3">
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

export default Settings;
