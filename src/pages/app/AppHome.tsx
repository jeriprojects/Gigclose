import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AppShell } from "@/components/gigclose/AppShell";
import { LocationQualityIndicator } from "@/components/gigclose/LocationQualityIndicator";
import { InstantHireModal } from "@/components/gigclose/InstantHireModal";
import { LocationFilters } from "@/components/gigclose/LocationFilters";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CATEGORY_META, formatDistance, formatNaira, Job, Profile, matchWorkers, rankJobsForUser } from "@/lib/gigs";
import { DEFAULT_LOCATION_FILTER, locationFilterMatches, resolveFilterCenter, type LocationFilter } from "@/lib/locations";
import { requestNotificationPermission, safeNotify, safeVibrate, usePreferences } from "@/lib/preferences";
import { Bell, Bookmark, Briefcase, BriefcaseBusiness, Clock, Compass, LocateFixed, MapPin, Sparkles, Wallet, Zap } from "lucide-react";
import { toast } from "sonner";

const AppHome = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { location, status, request } = useGeolocation();
  const { data: profile } = useCurrentProfile();
  const { prefs, update } = usePreferences();
  const [hireWorker, setHireWorker] = useState<Profile | null>(null);
  const [newJobIds, setNewJobIds] = useState<Set<string>>(new Set());
  const alertedJobIds = useRef<Set<string>>(new Set());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(
    Capacitor.isNativePlatform()
      ? "default"
      : typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported",
  );
  const [radius, setRadius] = useState<number>(5);
  const [locationFilter, setLocationFilter] = useState<LocationFilter>(DEFAULT_LOCATION_FILTER);
  const [jobType, setJobType] = useState<Job["category"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const requestDashboardLocation = async () => {
    const error = await request();
    if (error) {
      toast.error("Could not get your location", { description: error });
    } else {
      toast.success("Location updated", { description: "Nearby results now use your current location." });
    }
  };

  const filterCenter = useMemo(
    () => resolveFilterCenter(locationFilter, location),
    [locationFilter, location],
  );

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const interval = window.setInterval(() => {
      setNotificationPermission(Notification.permission);
    }, 2_000);
    return () => window.clearInterval(interval);
  }, []);

  const enableJobAlerts = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") {
      update({ notificationsAutoMatch: true });
      toast.success("Nearby job alerts enabled");
    } else if (permission === "denied") {
      toast.error("Notifications are blocked", {
        description: "Allow notifications in your browser settings to receive nearby job alerts.",
      });
    }
  };

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("status", "open").order("urgent", { ascending: false }).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data as Job[];
    },
    refetchInterval: 30_000,
  });

  // Realtime: prepend new open jobs as they're inserted
  useEffect(() => {
    const channel = supabase
      .channel("realtime:jobs:home")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jobs", filter: "status=eq.open" }, (payload) => {
        const job = payload.new as Job;
        qc.setQueryData<Job[]>(["jobs"], (prev) => {
          if (!prev) return [job];
          if (prev.some((j) => j.id === job.id)) return prev;
          return [job, ...prev].slice(0, 30);
        });
        setNewJobIds((s) => {
          const next = new Set(s);
          next.add(job.id);
          return next;
        });
        const [rankedJob] = rankJobsForUser([job], filterCenter);
        const isNearbyMatch =
          rankedJob &&
          rankedJob.km <= radius &&
          locationFilterMatches(locationFilter, job.location_label) &&
          (jobType === "all" || job.category === jobType) &&
          job.client_id !== user?.id;

        toast(`New gig: ${job.title}`, { description: `${job.location_label} · ${formatNaira(job.budget_ngn)}` });
        if (isNearbyMatch && !alertedJobIds.current.has(job.id)) {
          alertedJobIds.current.add(job.id);
          safeVibrate(25, prefs.vibrationAutoMatch);
          safeNotify(
            "Nearby job available",
            `${job.title} · ${formatDistance(rankedJob.km)} away · ${formatNaira(job.budget_ngn)}`,
            prefs.notificationsAutoMatch,
          );
        }
        // Clear highlight after 6s
        window.setTimeout(() => {
          setNewJobIds((s) => { const n = new Set(s); n.delete(job.id); return n; });
        }, 6000);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "jobs" }, (payload) => {
        const job = payload.new as Job;
        qc.setQueryData<Job[]>(["jobs"], (prev) => {
          if (!prev) return prev;
          if (job.status !== "open") return prev.filter((j) => j.id !== job.id);
          return prev.map((j) => (j.id === job.id ? job : j));
        });
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [filterCenter, jobType, locationFilter, prefs.notificationsAutoMatch, prefs.vibrationAutoMatch, qc, radius, user?.id]);

  const { data: postedJobs = [] } = useQuery({
    queryKey: ["posted-jobs-home", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("client_id", user!.id).order("created_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!user,
  });

  const { data: workers = [] } = useQuery({
    queryKey: ["market-workers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("account_type", "worker").order("behavior_score", { ascending: false }).limit(16);
      if (error) throw error;
      return data as Profile[];
    },
    enabled: profile?.account_type === "client",
  });

  // Recompute distances/ETA whenever location updates (handled via useMemo dep on location)
  const allEnriched = useMemo(() => rankJobsForUser(jobs, filterCenter), [jobs, filterCenter]);
  const enriched = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allEnriched.filter((job) => {
      if (job.km > radius) return false;
      if (!locationFilterMatches(locationFilter, job.location_label)) return false;
      if (jobType !== "all" && job.category !== jobType) return false;
      if (!q) return true;
      return (
        job.title.toLowerCase().includes(q) ||
        job.location_label.toLowerCase().includes(q) ||
        job.categoryMeta.label.toLowerCase().includes(q) ||
        (job.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [allEnriched, jobType, locationFilter, radius, searchQuery]);
  const nearbyWorkers = useMemo(() => matchWorkers(workers, filterCenter, undefined, 4), [filterCenter, workers]);
  const total = enriched.slice(0, 4).reduce((s, j) => s + j.budget_ngn, 0);
  const bestJob = enriched[0];
  const nextJobs = enriched.slice(0, 5);
  const notificationReady = notificationPermission === "granted" && prefs.notificationsAutoMatch;
  const autoEarn = profile?.auto_earn_enabled ?? false;

  const toggleAutoEarn = useMutation({
    mutationFn: async (value: boolean) => {
      if (!user) return;
      const { error } = await supabase.from("profiles").update({ auto_earn_enabled: value }).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile", user?.id] }),
  });

  if (profile?.account_type === "client") {
    const activeHires = postedJobs.filter((j) => ["assigned", "in_progress"].includes(j.status)).length;
    const bestWorker = nearbyWorkers[0];
    const activeJobs = postedJobs.filter((j) => j.status !== "completed" && j.status !== "cancelled").slice(0, 3);
    return (
      <AppShell>
        <div className="container max-w-6xl py-5 sm:py-6">
          <section className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="gig-page-hero signed-in-hero--gray p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="gig-eyebrow text-primary">Client app</p>
                  <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
                    {bestWorker ? "A strong nearby worker is ready." : "Post once. Hire nearby. Keep moving."}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    {bestWorker
                      ? `${bestWorker.display_name} is ${formatDistance(bestWorker.km)} away with a ${bestWorker.etaMin} minute ETA.`
                      : "Create a job, review nearby workers, and manage active hires from one mobile dashboard."}
                  </p>
                </div>
                <LocationQualityIndicator className="border-border bg-white/80 text-primary" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="gig-stat-tile p-4">
                  <div className="text-xs text-muted-foreground">Active hires</div>
                  <div className="mt-1 font-display text-2xl font-bold text-foreground">{activeHires}</div>
                </div>
                <div className="gig-stat-tile p-4">
                  <div className="text-xs text-muted-foreground">Jobs posted</div>
                  <div className="mt-1 font-display text-2xl font-bold text-foreground">{postedJobs.length}</div>
                </div>
                <div className="gig-stat-tile p-4">
                  <div className="text-xs text-muted-foreground">Spend</div>
                  <div className="mt-1 font-display text-2xl font-bold text-foreground">{formatNaira(postedJobs.reduce((s, j) => s + j.budget_ngn, 0))}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/app/post">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 font-semibold">
                    <BriefcaseBusiness className="h-4 w-4" />
                    Post a job
                  </Button>
                </Link>
                {bestWorker && (
                  <Button onClick={() => setHireWorker(bestWorker)} variant="outline" className="border-border gap-2 font-semibold">
                    <Zap className="h-4 w-4" />
                    Instant hire
                  </Button>
                )}
                <Link to="/app/explore">
                  <Button variant="outline" className="border-border gap-2">
                    <Compass className="h-4 w-4" />
                    Marketplace
                  </Button>
                </Link>
              </div>
            </div>

            <section className="gig-panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="gig-eyebrow">Nearby workers</p>
                  <h2 className="mt-1 font-display text-xl font-bold">Hire now</h2>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {nearbyWorkers.map((w) => (
                  <div key={w.id} className="flex items-center gap-2 rounded-2xl border border-border bg-white/70 p-3 transition hover:border-primary/40">
                    <Link to={`/workers/${w.user_id}`} className="flex-1 min-w-0">
                      <div className="font-medium truncate">{w.display_name}</div>
                      <div className="text-xs text-muted-foreground">{w.locationLabel} · {formatDistance(w.km)} · {w.etaMin}m · Score {Number(w.behavior_score).toFixed(2)}</div>
                    </Link>
                    <Button size="sm" onClick={() => setHireWorker(w)} className="rounded-full font-bold gap-1 shrink-0"><Zap className="h-3.5 w-3.5 fill-current" />Hire</Button>
                  </div>
                ))}
                {nearbyWorkers.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No nearby workers yet.</p>}
              </div>
            </section>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-[0.95fr,1.05fr]">
            <section className="gig-panel p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="gig-eyebrow">Your jobs</p>
                  <h2 className="mt-1 font-display text-xl font-bold">Active pipeline</h2>
                </div>
                <Link to="/app/jobs" className="text-sm text-primary">See all</Link>
              </div>
              <div className="mt-3 space-y-2">
                {activeJobs.map((j) => (
                  <Link key={j.id} to={`/app/jobs/${j.id}`} className="block rounded-2xl border border-border bg-white/70 p-3 transition hover:border-primary/40">
                    <div className="flex justify-between"><span className="font-medium truncate">{j.title}</span><span className="font-bold text-primary">{formatNaira(j.budget_ngn)}</span></div>
                    <div className="text-xs text-muted-foreground mt-0.5">{j.location_label} · {j.status.replace(/_/g, " ")}</div>
                  </Link>
                ))}
                {activeJobs.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No active jobs yet.</p>}
              </div>
            </section>

            <section className="gig-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="gig-eyebrow">Marketplace</p>
                <h2 className="mt-1 font-display text-xl font-bold">Opportunities around you</h2>
                <p className="text-sm text-muted-foreground">Client accounts can still explore and apply for nearby jobs.</p>
              </div>
              <Link to="/app/explore" className="text-sm text-primary">Explore all</Link>
            </div>
            <div className="mt-3 space-y-2">
              {enriched.slice(0, 4).map((job) => {
                const cat = CATEGORY_META[job.category];
                return (
                  <Link key={job.id} to={`/app/jobs/${job.id}`} className="flex items-center gap-3 rounded-2xl border border-border bg-white/70 p-3 transition hover:border-primary/40">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><cat.icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{job.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{job.location_label} · {formatDistance(job.km)} · {job.etaMin}m</div>
                    </div>
                    <div className="font-bold text-primary text-sm">{formatNaira(job.budget_ngn)}</div>
                  </Link>
                );
              })}
              {enriched.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No live jobs around you right now.</p>}
            </div>
          </section>
          </section>
        </div>
        {hireWorker && <InstantHireModal open={!!hireWorker} onOpenChange={(o) => !o && setHireWorker(null)} worker={hireWorker} />}
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="container max-w-6xl py-6">
        <section className="grid gap-4 lg:grid-cols-[1.25fr,0.75fr]">
          <div className="gig-page-hero signed-in-hero--gray p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="gig-eyebrow text-primary">Welcome</p>
                <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
                  {bestJob ? "Your next best gig is ready." : profile?.display_name || "Your local job radar is live."}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                  {bestJob
                    ? `${bestJob.title} is ${formatDistance(bestJob.km)} from ${filterCenter.label} with an estimated ${bestJob.etaMin} minute ETA.`
                    : `We are watching ${filterCenter.label} for jobs that match your filters.`}
                </p>
              </div>
              <LocationQualityIndicator className="border-border bg-primary/10 text-primary" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="gig-stat-tile p-4">
                <div className="text-xs text-muted-foreground">Top 5 value</div>
                <div className="mt-1 font-display text-2xl font-bold text-foreground">{formatNaira(total || 0)}</div>
              </div>
              <div className="gig-stat-tile p-4">
                <div className="text-xs text-muted-foreground">Matches nearby</div>
                <div className="mt-1 font-display text-2xl font-bold text-foreground">{enriched.length}</div>
              </div>
              <div className="gig-stat-tile p-4">
                <div className="text-xs text-muted-foreground">Alerts</div>
                <div className="mt-1 font-display text-2xl font-bold text-foreground">{notificationReady ? "On" : "Off"}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {bestJob ? (
                <Link to={`/app/jobs/${bestJob.id}`}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2">
                    <Zap className="h-4 w-4" />
                    View best gig
                  </Button>
                </Link>
              ) : (
                <Link to="/app/explore">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2">
                    <Compass className="h-4 w-4" />
                    Browse jobs
                  </Button>
                </Link>
              )}
              <Link to="/app/automatch">
                <Button variant="outline" className="border-border font-semibold gap-2">
                  <Sparkles className="h-4 w-4" />
                  AutoMatch
                </Button>
              </Link>
              <Button
                onClick={() => void requestDashboardLocation()}
                disabled={status === "prompting"}
                variant="outline"
                className="border-border"
              >
                <LocateFixed className="mr-2 h-4 w-4" />
                {status === "prompting" ? "Finding location..." : status === "granted" ? "Refresh location" : "Use my location"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="gig-panel p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="gig-icon-tile h-11 w-11">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-bold">Nearby job alerts</h2>
                    <p className="text-xs text-muted-foreground">
                      {notificationReady ? "You will get notified when matching jobs appear." : "Enable notifications for jobs near your filter area."}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={enableJobAlerts}
                disabled={notificationReady || notificationPermission === "unsupported"}
                className="mt-4 w-full rounded-full"
                variant={notificationReady ? "outline" : "default"}
              >
                {notificationReady ? "Alerts enabled" : notificationPermission === "denied" ? "Notifications blocked" : "Enable job alerts"}
              </Button>
            </div>

            <div className="gig-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <h2 className="font-display text-lg font-bold">Auto-Earn Mode</h2>
                    <p className="text-xs text-muted-foreground">{autoEarn ? "Live. Jobs can come to you." : "Turn on automatic match offers."}</p>
                  </div>
                </div>
                <Switch checked={autoEarn} onCheckedChange={(v) => toggleAutoEarn.mutate(v)} disabled={!user || toggleAutoEarn.isPending} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[{ to: "/app/jobs", icon: Briefcase, l: "Jobs" }, { to: "/app/saved", icon: Bookmark, l: "Saved" }, { to: "/app/wallet", icon: Wallet, l: "Wallet" }, { to: "/app/explore", icon: Compass, l: "Explore" }].map((a) => (
                <Link key={a.to} to={a.to} className="gig-panel gig-panel-interactive p-3 text-center">
                  <a.icon className="h-5 w-5 mx-auto text-primary" />
                  <div className="mt-1 text-xs font-medium">{a.l}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[0.85fr,1.15fr]">
          <div className="gig-panel p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="gig-eyebrow">Filters</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Tune your job radar</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Alerts and rankings follow these filters: {radius}km around {filterCenter.label}.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <LocationFilters
                value={locationFilter}
                onChange={setLocationFilter}
                radius={radius}
                onRadiusChange={setRadius}
                category={jobType}
                onCategoryChange={setJobType}
                query={searchQuery}
                onQueryChange={setSearchQuery}
              />
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold">Gigs near you</h2>
                <p className="text-xs text-muted-foreground">
                  {enriched.length} match{enriched.length === 1 ? "" : "es"} within {radius}km
                  {jobType !== "all" ? ` · ${CATEGORY_META[jobType].label}` : ""}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> LIVE
              </span>
            </div>

            <div className="space-y-2">
              {nextJobs.map((job) => {
                const cat = CATEGORY_META[job.category];
                const isNew = newJobIds.has(job.id);
                return (
                  <Link
                    key={job.id}
                    to={`/app/jobs/${job.id}`}
                    className={`gig-panel gig-panel-interactive flex items-center gap-3 p-3 ${isNew ? "border-primary/60 shadow-glow-sm ring-1 ring-primary/40" : ""}`}
                  >
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><cat.icon className="h-5 w-5" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">{job.title}</h3>
                        {isNew && <span className="rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">New</span>}
                        {job.urgent && <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-bold text-warning">Urgent</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{formatDistance(job.km)}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{job.etaMin}m</span>
                        <span>{job.location_label}</span>
                      </div>
                    </div>
                    <div className="font-display text-sm font-bold text-primary">{formatNaira(job.budget_ngn)}</div>
                  </Link>
                );
              })}
              {enriched.length > nextJobs.length && (
                <Link to="/app/explore">
                  <Button variant="outline" className="mt-2 w-full rounded-full">See all {enriched.length} jobs</Button>
                </Link>
              )}
              {enriched.length === 0 && !isLoading && (
                <div className="gig-panel border-dashed p-8 text-center text-sm text-muted-foreground">
                  No gigs match these filters yet. Try widening the radius or clearing a filter.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
      {hireWorker && <InstantHireModal open={!!hireWorker} onOpenChange={(o) => !o && setHireWorker(null)} worker={hireWorker} />}
    </AppShell>
  );
};

const Metric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="gig-kpi-card">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 font-display text-xl font-bold">{value}</div>
  </div>
);

export default AppHome;
