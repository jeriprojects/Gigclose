import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { AppShell } from "@/components/gigclose/AppShell";
import { PublicSiteShell } from "@/components/gigclose/PublicSiteShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORY_META, Job, JobApplication, Profile, WorkerRating, etaMinutes, formatDistance, formatNaira, haversineKm } from "@/lib/gigs";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Bookmark,
  BriefcaseBusiness,
  CheckCircle2,
  Clock,
  Lock,
  MapPin,
  MessageSquare,
  Navigation,
  Send,
  Shield,
  Star,
  UserCheck,
  Wallet,
  Zap,
} from "lucide-react";
import { useState } from "react";

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { location: userLocation } = useGeolocation();
  const qc = useQueryClient();
  const { data: profile } = useCurrentProfile();
  const [coverNote, setCoverNote] = useState("");
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingReview, setRatingReview] = useState("");
  const Shell = user ? AppShell : PublicSiteShell;

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").eq("id", id!).single();
      if (error) throw error;
      return data as Job;
    },
    enabled: !!id,
  });
  const { data: saved } = useQuery({
    queryKey: ["saved", id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data } = await supabase.from("saved_gigs").select("id").eq("user_id", user.id).eq("job_id", id).maybeSingle();
      return data;
    },
    enabled: !!user && !!id,
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["job-applications", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_applications").select("*").eq("job_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as JobApplication[];
    },
    enabled: !!id && (!!profile?.is_admin || !!user),
  });

  const { data: existingRating } = useQuery({
    queryKey: ["job-rating", id, user?.id],
    queryFn: async () => {
      if (!id || !user || !job?.worker_id) return null;
      const { data, error } = await supabase
        .from("worker_ratings")
        .select("*")
        .eq("job_id", id)
        .eq("client_id", user.id)
        .eq("worker_id", job.worker_id)
        .maybeSingle();
      if (error) throw error;
      return data as WorkerRating | null;
    },
    enabled: !!id && !!user && !!job?.worker_id && profile?.account_type === "client",
  });

  const { data: clientProfile } = useQuery({
    queryKey: ["job-client", job?.client_id],
    queryFn: async () => {
      if (!job?.client_id) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", job.client_id)
        .maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user && !!job?.client_id,
  });

  const toggleSave = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to save");
      if (saved) {
        await supabase.from("saved_gigs").delete().eq("user_id", user.id).eq("job_id", id!);
      } else {
        await supabase.from("saved_gigs").insert({ user_id: user.id, job_id: id! });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saved", id] });
      qc.invalidateQueries({ queryKey: ["saved-list"] });
    },
    onError: (e: Error) => toast({ title: e.message, variant: "destructive" }),
  });

  const completeJob = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Missing job id");
      const { error } = await supabase.rpc("complete_job_and_release_payment", { p_job_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job", id] });
      qc.invalidateQueries({ queryKey: ["posted-jobs"] });
      qc.invalidateQueries({ queryKey: ["assigned-jobs"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Job completed", description: "Worker payout has been released." });
    },
    onError: (e: Error) => toast({ title: "Completion failed", description: e.message, variant: "destructive" }),
  });

  const applyToJob = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error("Missing job id");
      const { error } = await supabase.rpc("apply_to_job", {
        p_job_id: id,
        p_cover_note: coverNote || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-applications", id] });
      toast({ title: "Application sent", description: "The client can now review your application." });
      setCoverNote("");
    },
    onError: (error: Error) => toast({ title: "Application failed", description: error.message, variant: "destructive" }),
  });

  const rateWorker = useMutation({
    mutationFn: async () => {
      if (!id || !job?.worker_id) throw new Error("Missing worker");
      const { error } = await supabase.rpc("rate_worker_for_job", {
        p_job_id: id,
        p_worker_id: job.worker_id,
        p_stars: ratingStars,
        p_review: ratingReview || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job-rating", id, user?.id] });
      qc.invalidateQueries({ queryKey: ["public-worker", job?.worker_id] });
      toast({ title: "Worker rated", description: "Your rating is now visible on the worker profile." });
    },
    onError: (error: Error) => toast({ title: "Rating failed", description: error.message, variant: "destructive" }),
  });

  if (isLoading || !job) {
    return <Shell><div className="container py-10 text-muted-foreground">Loading…</div></Shell>;
  }

  const km = haversineKm(userLocation, { lat: Number(job.latitude), lng: Number(job.longitude) });
  const cat = CATEGORY_META[job.category];
  const currentApplication = applications.find((application) => application.worker_id === user?.id) ?? null;

  const canComplete = !!user && (user.id === job.client_id || user.id === job.worker_id || profile?.is_admin) && ["assigned", "in_progress"].includes(job.status);
  const canApply = !!profile && job.status === "open" && job.client_id !== user?.id;
  const canManageApplicants = profile?.account_type === "client" && job.client_id === user?.id && job.status === "open";
  const canRateWorker = profile?.account_type === "client" && job.client_id === user?.id && job.status === "completed" && !!job.worker_id;
  const messageRecipientId = user?.id === job.client_id ? job.worker_id : job.client_id;
  const canMessage = !!user && !!messageRecipientId && (
    user.id === job.client_id
      ? !!job.worker_id
      : job.worker_id === user.id || !!currentApplication
  );
  const messageHref = `/app/messages?job=${job.id}&with=${messageRecipientId}`;
  const signedOutWorkerHref = `/auth?role=worker&redirect=${encodeURIComponent(`/app/jobs/${job.id}`)}`;
  const signedOutLoginHref = `/auth?redirect=${encodeURIComponent(`/app/jobs/${job.id}`)}`;
  const statusLabel = job.status.replace(/_/g, " ");

  return (
    <Shell>
      <div className="container max-w-6xl py-6 md:py-10">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-2 text-sm font-semibold text-muted-foreground shadow-soft transition hover:border-primary/40 hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <section className={`gig-page-hero p-5 sm:p-7 md:p-8 ${user ? "signed-in-hero--gray" : ""}`}>
          <div className="grid gap-8 lg:grid-cols-[1fr,340px] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full gig-stat-tile px-3 py-1.5 text-xs font-bold text-primary">
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full gig-stat-tile px-3 py-1.5 text-xs font-bold capitalize text-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  {statusLabel}
                </span>
                {job.urgent && (
                  <span className="inline-flex items-center gap-2 rounded-full bg-warning px-3 py-1.5 text-xs font-bold text-warning-foreground">
                    <Zap className="h-3.5 w-3.5" />
                    Urgent
                  </span>
                )}
              </div>
              <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                {job.title}
              </h1>
              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  {job.location_label}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-primary" />
                  {formatDistance(km)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  {etaMinutes(km)} min ETA
                </span>
              </div>
            </div>

            <div className="gig-panel p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Budget</p>
              <div className="mt-2 font-display text-4xl font-bold text-foreground">{formatNaira(job.budget_ngn)}</div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <HeroMetric label="Distance" value={formatDistance(km)} />
                <HeroMetric label="ETA" value={`${etaMinutes(km)}m`} />
              </div>
            </div>
          </div>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr,360px] lg:items-start">
          <main className="space-y-5">
            <section className="gig-panel p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="gig-eyebrow">Job preview</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">What needs doing</h2>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                  <BriefcaseBusiness className="h-3.5 w-3.5" />
                  {cat.label}
                </span>
              </div>
              <p className="mt-5 text-base leading-8 text-foreground/90">
                {job.description || "The client has not added a description yet. Message the client after applying to confirm scope, timing, and materials."}
              </p>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              <FinanceCard icon={Send} label="Posting fee" value={formatNaira(job.posting_fee_ngn || 0)} />
              <FinanceCard icon={Shield} label="Platform fee" value={formatNaira(job.platform_fee_ngn || 0)} />
            </section>

            <section className="gig-panel p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="gig-eyebrow">Client</p>
                  <h2 className="mt-2 font-display text-2xl font-bold">Posting details</h2>
                </div>
                {user && clientProfile?.is_verified && (
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success">
                    <UserCheck className="h-3.5 w-3.5" />
                    Verified client
                  </span>
                )}
              </div>

              {user ? (
                clientProfile ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <InfoTile label="Posted by" value={clientProfile.display_name} />
                    <InfoTile label="Area" value={clientProfile.city || "Not shared"} />
                    <InfoTile label="Trust" value={clientProfile.is_verified ? "Verified client" : "Standard client"} />
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">Client profile details are unavailable for this listing right now.</p>
                )
              ) : (
                <div className="mt-5 rounded-[1.25rem] border border-dashed border-border bg-secondary/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="gig-icon-tile h-10 w-10 shrink-0">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Client details unlock after sign in</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Browse the preview freely. Create a worker account to apply, message, and view the client profile.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {canManageApplicants && (
              <section className="gig-panel p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="gig-eyebrow">Hiring</p>
                    <h2 className="mt-2 font-display text-2xl font-bold">Applications</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Review interested workers and hire directly from this job.</p>
                  </div>
                  <div className="rounded-full bg-secondary px-3 py-2 text-xs font-semibold text-muted-foreground">
                    {applications.length} applicants
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {applications.map((application) => (
                    <ApplicantRow key={application.id} application={application} jobId={job.id} />
                  ))}
                  {applications.length === 0 && (
                    <div className="rounded-[1.25rem] border border-dashed border-border p-5 text-sm text-muted-foreground">
                      No applications yet. Share the job or wait for nearby workers to respond.
                    </div>
                  )}
                </div>
              </section>
            )}

            {canRateWorker && (
              <section className="gig-panel p-5 sm:p-6">
                <p className="gig-eyebrow">Completed job</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Rate this worker</h2>
                <p className="mt-1 text-sm text-muted-foreground">Stars and reviews appear on the worker's public profile.</p>
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRatingStars(value)}
                      className={`grid h-10 w-10 place-items-center rounded-full border transition ${value <= ratingStars ? "border-warning bg-warning/15 text-warning" : "border-border bg-white text-muted-foreground hover:border-warning/50"}`}
                    >
                      <Star className={`h-4 w-4 ${value <= ratingStars ? "fill-current" : ""}`} />
                    </button>
                  ))}
                </div>
                <Input
                  value={ratingReview}
                  onChange={(event) => setRatingReview(event.target.value)}
                  className="mt-3"
                  placeholder="Add a short review"
                />
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button onClick={() => rateWorker.mutate()} disabled={rateWorker.isPending} className="rounded-full">
                    {existingRating ? "Update rating" : "Submit rating"}
                  </Button>
                  {job.worker_id && (
                    <Link to={`/workers/${job.worker_id}`} className="text-sm font-semibold text-primary">
                      View worker profile
                    </Link>
                  )}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <section className="gig-panel p-5">
              <p className="gig-eyebrow">Next step</p>
              <h2 className="mt-2 font-display text-2xl font-bold">
                {canApply ? "Apply for this job" : user ? "Manage this job" : "Sign in to apply"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {canApply
                  ? "Send a short note so the client understands your availability."
                  : user
                    ? "Save, message, or complete the job when the work is finished."
                    : "Create a free worker account to apply, save, and chat with the client."}
              </p>

              {canApply && (
                <div className="mt-4">
                  {currentApplication ? (
                    <div className="rounded-[1.25rem] border border-success/20 bg-success/10 p-4 text-sm">
                      <div className="font-semibold text-success">Application sent</div>
                      <div className="mt-1 capitalize text-muted-foreground">Status: {currentApplication.status}</div>
                    </div>
                  ) : (
                    <>
                      <Textarea
                        value={coverNote}
                        onChange={(event) => setCoverNote(event.target.value)}
                        rows={4}
                        placeholder="Add availability, nearby landmark, or relevant experience"
                      />
                      <Button onClick={() => applyToJob.mutate()} disabled={applyToJob.isPending} className="mt-3 h-11 w-full rounded-full font-bold">
                        <Send className="mr-2 h-4 w-4" />
                        {applyToJob.isPending ? "Submitting..." : "Apply now"}
                      </Button>
                    </>
                  )}
                </div>
              )}

              {!user && job.status === "open" && (
                <div className="mt-4 grid gap-2">
                  <Link to={signedOutWorkerHref}>
                    <Button className="h-11 w-full rounded-full font-bold">
                      <Send className="mr-2 h-4 w-4" />
                      Sign up to apply
                    </Button>
                  </Link>
                  <Link to={signedOutLoginHref}>
                    <Button variant="outline" className="h-11 w-full rounded-full">Sign in</Button>
                  </Link>
                </div>
              )}

              {user && (
                <div className="mt-4 grid gap-2">
                  <Button variant="outline" onClick={() => toggleSave.mutate()} className="h-11 rounded-full">
                    <Bookmark className={`mr-2 h-4 w-4 ${saved ? "fill-current text-primary" : ""}`} />
                    {saved ? "Saved" : "Save job"}
                  </Button>
                  {canMessage && (
                    <Link to={messageHref}>
                      <Button variant="outline" className="h-11 w-full rounded-full">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        {user.id === job.client_id ? "Message worker" : "Message client"}
                      </Button>
                    </Link>
                  )}
                  {canComplete && (
                    <Button onClick={() => completeJob.mutate()} className="h-11 rounded-full font-bold shadow-glow-sm" disabled={completeJob.isPending}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete and release pay
                    </Button>
                  )}
                </div>
              )}
            </section>

            <section className="gig-panel p-5">
              <p className="gig-eyebrow">At a glance</p>
              <div className="mt-4 space-y-3">
                <SideFact icon={Wallet} label="Budget" value={formatNaira(job.budget_ngn)} />
                <SideFact icon={MapPin} label="Location" value={job.location_label} />
                <SideFact icon={Navigation} label="Distance" value={formatDistance(km)} />
                <SideFact icon={Clock} label="Estimated arrival" value={`${etaMinutes(km)} minutes`} />
                <SideFact icon={Shield} label="Status" value={statusLabel} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </Shell>
  );
};

export default JobDetail;

const HeroMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="gig-stat-tile p-3">
    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="mt-1 font-display text-lg font-bold text-foreground">{value}</div>
  </div>
);

const FinanceCard = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="gig-kpi-card">
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="mt-1 font-display text-xl font-bold">{value}</div>
      </div>
      <div className="gig-icon-tile h-10 w-10 shrink-0">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </div>
);

const InfoTile = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-[1.25rem] border border-border bg-secondary/50 p-4">
    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="mt-1 font-semibold">{value}</div>
  </div>
);

const SideFact = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="flex gap-3 rounded-[1.25rem] border border-border bg-white/70 p-3">
    <div className="gig-icon-tile h-9 w-9 shrink-0">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold capitalize leading-5">{value}</div>
    </div>
  </div>
);

const ApplicantRow = ({ application, jobId }: { application: JobApplication; jobId: string }) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: worker } = useQuery({
    queryKey: ["application-worker", application.worker_id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", application.worker_id).single();
      if (error) throw error;
      return data;
    },
  });

  const hireWorker = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("assign_worker_to_job", {
        p_job_id: jobId,
        p_worker_id: application.worker_id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job", jobId] });
      qc.invalidateQueries({ queryKey: ["job-applications", jobId] });
      toast({ title: "Worker hired", description: "The worker is now assigned to this job." });
    },
    onError: (error: Error) => toast({ title: "Could not hire worker", description: error.message, variant: "destructive" }),
  });

  return (
    <div className="gig-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{worker?.display_name || "Worker"}</div>
          <div className="mt-1 text-xs text-muted-foreground capitalize">
            {application.status} · ⭐ {Number(worker?.worker_average_rating || 0).toFixed(1)} · score {Number(worker?.behavior_score || 0).toFixed(2)}
          </div>
          {application.cover_note && <p className="mt-2 text-sm text-muted-foreground">{application.cover_note}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={() => hireWorker.mutate()} disabled={hireWorker.isPending} className="rounded-full">
            Hire worker
          </Button>
          <Link to={`/workers/${application.worker_id}`} className="text-xs font-semibold text-primary">
            Open profile
          </Link>
        </div>
      </div>
    </div>
  );
};
