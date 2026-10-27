import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AppShell } from "@/components/gigclose/AppShell";
import { CategoryIcon } from "@/components/gigclose/CategoryIcon";
import { LocationQualityIndicator } from "@/components/gigclose/LocationQualityIndicator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_META, formatDistance, formatNaira, Job, rankJobsForUser } from "@/lib/gigs";
import { requestNotificationPermission, safeNotify, safeVibrate, usePreferences } from "@/lib/preferences";
import { jobMatchesWorkerSkills, getMatchingWorkerSkills } from "@/lib/worker-skills";
import { Bell, Check, Clock, MapPin, Sparkles, X, Zap } from "lucide-react";
import { toast } from "sonner";

const NO_WORKER_SKILLS: string[] = [];

const AutoMatch = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: profile } = useCurrentProfile();
  const { location } = useGeolocation();
  const { prefs } = usePreferences();
  const [responding, setResponding] = useState<"idle" | "accepting" | "declining">("idle");
  const [secondsLeft, setSecondsLeft] = useState(20);

  const autoEarn = profile?.auto_earn_enabled ?? false;

  const { data: jobs = [] } = useQuery({
    queryKey: ["automatch-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "open")
        .order("urgent", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Job[];
    },
    refetchInterval: autoEarn ? 15_000 : false,
  });

  const skills = profile?.skills ?? NO_WORKER_SKILLS;
  const ranked = useMemo(() => {
    const distanceRankedJobs = rankJobsForUser(jobs, location);
    if (skills.length === 0) return distanceRankedJobs;
    return distanceRankedJobs.sort(
      (a, b) => Number(jobMatchesWorkerSkills(b, skills)) - Number(jobMatchesWorkerSkills(a, skills)),
    );
  }, [jobs, location, skills]);
  const nextMatch = ranked[0];
  const queue = ranked.slice(1, 4);

  // Countdown timer for current match
  useEffect(() => {
    if (!autoEarn || !nextMatch) return;
    setSecondsLeft(20);
    safeVibrate([30, 60, 30], prefs.vibrationAutoMatch);
    safeNotify(
      "New AutoMatch",
      `${nextMatch.title} · ${formatNaira(nextMatch.budget_ngn)} · ${nextMatch.etaMin}m away`,
      prefs.notificationsAutoMatch,
    );
    const id = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [autoEarn, nextMatch, prefs.notificationsAutoMatch, prefs.vibrationAutoMatch]);

  const toggleAutoEarn = useMutation({
    mutationFn: async (value: boolean) => {
      if (!user) return;
      const { error } = await supabase.from("profiles").update({ auto_earn_enabled: value }).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: async (_d, value) => {
      qc.invalidateQueries({ queryKey: ["profile", user?.id] });
      safeVibrate(value ? [40, 30, 40] : 20, prefs.vibrationAutoMatch);
      if (value && prefs.notificationsAutoMatch) {
        await requestNotificationPermission();
      }
      toast.success(value ? "Auto-Earn Mode is live" : "Auto-Earn paused", {
        description: value ? "Jobs will start coming to you." : "You won't receive new matches.",
      });
    },
  });

  const acceptMatch = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase.rpc("apply_to_job", { p_job_id: jobId, p_cover_note: "Auto-matched via Auto-Earn" });
      if (error) throw error;
    },
    onSuccess: (_d, jobId) => {
      safeVibrate([50, 30, 50, 30, 100], prefs.vibrationAutoMatch);
      toast.success("Match accepted", { description: "You're in the running for this job." });
      qc.invalidateQueries({ queryKey: ["automatch-jobs"] });
      navigate(`/app/jobs/${jobId}`);
    },
    onError: (e: Error) => {
      safeVibrate(120, prefs.vibrationAutoMatch);
      toast.error("Could not accept", { description: e.message });
      setResponding("idle");
    },
  });

  const handleAccept = () => {
    if (!nextMatch) return;
    setResponding("accepting");
    acceptMatch.mutate(nextMatch.id);
  };

  const handleDecline = () => {
    if (!nextMatch) return;
    setResponding("declining");
    safeVibrate(20, prefs.vibrationAutoMatch);
    toast("Match declined", { description: "Looking for the next one…" });
    // Optimistically drop this job from the cache so the next ranked surfaces
    qc.setQueryData<Job[]>(["automatch-jobs"], (prev) => (prev ?? []).filter((j) => j.id !== nextMatch.id));
    setTimeout(() => setResponding("idle"), 400);
  };

  return (
    <AppShell>
      <div className="container max-w-3xl py-6">
        <div className="gig-page-hero signed-in-hero--gray flex items-center justify-between gap-3 p-6 sm:p-8 flex-wrap">
          <div>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">AutoMatch</h1>
            <p className="mt-2 text-sm text-muted-foreground">Toggle on. Jobs come to you.</p>
          </div>
          <LocationQualityIndicator className="border-border bg-primary/10 text-primary" />
        </div>

        <div className="gig-panel mt-5 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-2xl grid place-items-center ${autoEarn ? "bg-gradient-money text-primary-foreground shadow-glow-sm" : "bg-secondary text-muted-foreground"}`}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-lg font-bold">Auto-Earn Mode</div>
                <div className="text-xs text-muted-foreground">
                  {autoEarn ? "Live — receiving matches near you" : "Off — flip the switch to start"}
                </div>
              </div>
            </div>
            <Switch
              checked={autoEarn}
              onCheckedChange={(v) => toggleAutoEarn.mutate(v)}
              disabled={!user || toggleAutoEarn.isPending}
            />
          </div>
        </div>

        {!autoEarn && (
          <div className="gig-panel mt-6 border-dashed p-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto" />
            <h3 className="mt-3 font-display text-xl font-bold">No matches yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Enable Auto-Earn Mode above to start receiving live job pings.</p>
          </div>
        )}

        {autoEarn && nextMatch && (
          <section className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" /> NEXT MATCH
              </div>
              <div className="text-xs font-semibold text-muted-foreground tabular-nums">
                {secondsLeft}s to respond
              </div>
            </div>

            <div className="gig-panel relative border-primary/30 p-6 shadow-glow">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-money grid place-items-center text-primary-foreground">
                  <CategoryIcon category={nextMatch.category} className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    New AutoMatch
                  </div>
                  <div className="font-display font-bold text-xl">{nextMatch.title}</div>
                </div>
                {nextMatch.urgent && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-warning/15 text-warning font-bold uppercase">
                    Urgent
                  </span>
                )}
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                <div className="gig-kpi-card text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Pay</div>
                  <div className="font-display text-lg font-bold text-primary">{formatNaira(nextMatch.budget_ngn)}</div>
                </div>
                <div className="gig-kpi-card text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">Distance</div>
                  <div className="font-display text-lg font-bold">{formatDistance(nextMatch.km)}</div>
                </div>
                <div className="gig-kpi-card text-center">
                  <div className="text-[10px] text-muted-foreground uppercase font-semibold">ETA</div>
                  <div className="font-display text-lg font-bold">{nextMatch.etaMin}m</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {nextMatch.location_label}
                <Clock className="h-3.5 w-3.5 text-primary ml-2" />
                Posted {new Date(nextMatch.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              {getMatchingWorkerSkills(nextMatch, skills).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {getMatchingWorkerSkills(nextMatch, skills).map((skill) => (
                    <span key={skill} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                      Matches: {skill}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={handleDecline}
                  disabled={responding !== "idle"}
                  className="h-12 rounded-2xl"
                >
                  <X className="h-4 w-4 mr-1.5" /> Decline
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={responding !== "idle"}
                  className="h-12 rounded-2xl font-bold shadow-glow-sm"
                >
                  <Check className="h-4 w-4 mr-1.5" /> Accept
                </Button>
              </div>
            </div>
          </section>
        )}

        {autoEarn && queue.length > 0 && (
          <section className="mt-6">
            <h2 className="font-display text-lg font-bold mb-3">In the queue</h2>
            <div className="space-y-2">
              {queue.map((job) => (
                <Link
                  key={job.id}
                  to={`/app/jobs/${job.id}`}
                  className="gig-panel gig-panel-interactive flex items-center gap-3 p-3"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                    <CategoryIcon category={job.category} className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">{job.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistance(job.km)} · {job.etaMin}m
                    </div>
                  </div>
                  <div className="font-bold text-primary text-sm">{formatNaira(job.budget_ngn)}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {autoEarn && !nextMatch && (
          <div className="gig-panel mt-6 border-dashed p-8 text-center">
            <Zap className="h-10 w-10 text-primary mx-auto" />
            <h3 className="mt-3 font-display text-xl font-bold">Scanning your area</h3>
            <p className="mt-1 text-sm text-muted-foreground">No live matches yet — we'll ping you the moment one appears.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default AutoMatch;
