import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/gigclose/AppShell";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/gigclose/CategoryIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AREA_OPTIONS,
  CATEGORY_META,
  formatDistance,
  formatNaira,
  JOB_POST_FEE_NGN,
  Job,
  matchWorkers,
  Profile,
  resolveArea,
} from "@/lib/gigs";
import { ArrowLeft, ArrowRight, Briefcase, Check, Clock, Loader2, MapPin, Sparkles, Zap } from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const stepSchema = z.coerce.number().int().min(1).max(4).catch(1);
const jobSchema = z.object({
  title: z.string().trim().min(4, "Too short").max(120),
  description: z.string().trim().max(500).optional(),
  category: z.enum(["cleaning", "delivery", "electrical", "plumbing", "moving", "creative", "handyman", "other"]),
  budget_ngn: z.number().int().min(500, "Min ₦500").max(10_000_000),
  location_label: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  urgent: z.boolean(),
});

function getStep(params: URLSearchParams) {
  return stepSchema.parse(params.get("step")) as Step;
}

const fetchWorkers = async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("account_type", "worker")
    .order("behavior_score", { ascending: false })
    .limit(24);
  if (error) throw error;
  return data as Profile[];
};

const fetchJobById = async (id: string) => {
  const { data, error } = await supabase.from("jobs").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Job;
};

const PostJob = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const initialCategory = (params.get("category") as Job["category"]) || "cleaning";
  const [category, setCategory] = useState<Job["category"]>(initialCategory);
  const [budget, setBudget] = useState<number>(8000);
  const [areaLabel, setAreaLabel] = useState(params.get("area") || AREA_OPTIONS[0].label);
  const [urgent, setUrgent] = useState(params.get("urgent") === "true");
  const [createdJob, setCreatedJob] = useState<Job | null>(null);

  const area = resolveArea(areaLabel);
  const step = getStep(params);
  const jobId = params.get("job");

  const { data: workers = [] } = useQuery({ queryKey: ["workers"], queryFn: fetchWorkers });
  const { data: confirmedJob } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => fetchJobById(jobId!),
    enabled: !!jobId && !createdJob,
  });

  const currentJob = createdJob ?? confirmedJob ?? null;
  const matchedWorkers = useMemo(
    () => matchWorkers(workers, { lat: area.lat, lng: area.lng, label: area.label }, category, 4),
    [area.label, area.lat, area.lng, category, workers],
  );

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in required");
      const parsed = jobSchema.parse({
        title,
        description,
        category,
        budget_ngn: budget,
        location_label: area.label,
        latitude: area.lat,
        longitude: area.lng,
        urgent,
      });
      const { data, error } = await supabase
        .rpc("create_job_with_fee", {
          p_title: parsed.title,
          p_description: parsed.description || "",
          p_category: parsed.category,
          p_budget_ngn: parsed.budget_ngn,
          p_location_label: parsed.location_label,
          p_latitude: parsed.latitude,
          p_longitude: parsed.longitude,
          p_urgent: parsed.urgent,
        });
      if (error) throw error;
      return data as Job;
    },
    onSuccess: (job) => {
      setCreatedJob(job);
      qc.invalidateQueries({ queryKey: ["jobs"] });
      const next = new URLSearchParams(params);
      next.set("step", "4");
      next.set("job", job.id);
      setParams(next, { replace: true });
    },
    onError: (error: Error) => {
      toast({ title: "Couldn't post", description: error.message, variant: "destructive" });
    },
  });

  const setStep = (nextStep: Step) => {
    const next = new URLSearchParams(params);
    next.set("step", String(nextStep));
    next.set("area", area.label);
    next.set("urgent", String(urgent));
    setParams(next, { replace: true });
  };

  const next = () => setStep(Math.min(4, step + 1) as Step);
  const back = () => setStep(Math.max(1, step - 1) as Step);

  const canNext =
    (step === 1 && title.trim().length >= 4) ||
    (step === 2 && budget >= 500) ||
    (step === 3 && !!area.label);

  return (
    <AppShell>
      <div className="container max-w-3xl py-6 md:py-10">
        <div className="gig-page-hero signed-in-hero--gray mb-6 flex items-center justify-between p-5 sm:p-6">
          <button
            onClick={() => (step === 1 ? navigate(-1) : back())}
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Step {step} of 4
          </div>
        </div>
        <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div className="h-full bg-gradient-money transition-all" style={{ width: `${(step / 4) * 100}%` }} />
        </div>

        {step === 1 && (
          <div className="gig-panel animate-float-up p-6 sm:p-8">
            <h1 className="font-display text-3xl font-bold md:text-4xl">What do you need done?</h1>
            <p className="mt-2 text-muted-foreground">Clear job titles and categories get faster worker matches.</p>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="title">Job title</Label>
                <Input
                  id="title"
                  value={title}
                  maxLength={120}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Need a cleaner this afternoon"
                  className="mt-1.5 h-12"
                />
              </div>
              <div>
                <Label htmlFor="description">Details</Label>
                <Textarea
                  id="description"
                  value={description}
                  maxLength={500}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Scope, timing, and anything workers should know"
                  className="mt-1.5"
                  rows={4}
                />
              </div>
              <div>
                <Label>Category</Label>
                <div className="mt-1.5 grid grid-cols-2 gap-2 md:grid-cols-4">
                  {(Object.keys(CATEGORY_META) as Job["category"][]).map((value) => (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setCategory(value)}
                      className={`flex h-16 flex-col items-center justify-center gap-1 rounded-2xl border text-xs font-semibold transition ${
                        category === value ? "border-primary bg-primary/10 text-primary" : "border-border bg-white/85 hover:border-primary/40"
                      }`}
                    >
                      <CategoryIcon category={value} className="h-5 w-5" />
                      {CATEGORY_META[value].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-float-up">
            <h1 className="font-display text-3xl font-bold md:text-4xl">What&apos;s your budget?</h1>
            <p className="mt-2 text-muted-foreground">Budget helps us rank the strongest nearby matches.</p>

            <div className="gig-panel mt-8 p-8 text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Budget</div>
              <div className="mt-2 font-display text-5xl font-bold text-gradient-primary md:text-6xl">
                {formatNaira(budget)}
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={500}
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
                className="mt-6 w-full accent-primary"
              />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>₦1k</span>
                <span>₦100k</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
                {[5000, 10000, 25000, 50000].map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    onClick={() => setBudget(preset)}
                    className="h-10 rounded-2xl border border-slate-200 bg-white text-sm font-semibold transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {formatNaira(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="gig-panel animate-float-up p-6 sm:p-8">
            <h1 className="font-display text-3xl font-bold md:text-4xl">Where and how urgent?</h1>
            <p className="mt-2 text-muted-foreground">Workers closest to your selected area appear first. A fixed {formatNaira(JOB_POST_FEE_NGN)} is charged before the job goes live.</p>

            <div className="mt-6">
              <Label>Location</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                {AREA_OPTIONS.map((option) => (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => setAreaLabel(option.label)}
                    className={`inline-flex h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition ${
                      area.label === option.label ? "border-primary bg-primary/10 text-primary" : "border-border bg-white/85 hover:border-primary/40"
                    }`}
                  >
                    <MapPin className="h-4 w-4" /> {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <Label>Urgency</Label>
              <div className="mt-1.5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgent(false)}
                  className={`h-16 rounded-2xl border text-sm font-semibold transition ${
                    !urgent ? "border-primary bg-primary/10 text-primary" : "border-border bg-white/85"
                  }`}
                >
                  <Clock className="mx-auto h-5 w-5" />
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setUrgent(true)}
                  className={`h-16 rounded-2xl border text-sm font-bold transition ${
                    urgent ? "border-warning bg-warning/15 text-warning" : "border-border bg-white/85"
                  }`}
                >
                  Hot now
                  <div className="text-[10px] font-medium opacity-70">Boost to nearby workers</div>
                </button>
              </div>
            </div>

            <div className="gig-panel mt-6 p-5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                <Sparkles className="h-4 w-4" /> Preview matches
              </div>
              <div className="mt-4 space-y-3">
                {matchedWorkers.length === 0 && (
                  <div className="gig-panel border-dashed p-4 text-sm text-muted-foreground">
                    No workers are currently online for this category. You can still post and be the first in queue.
                  </div>
                )}
                {matchedWorkers.slice(0, 3).map((worker) => (
                  <div key={worker.id} className="gig-panel flex items-center gap-3 p-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-money font-bold text-primary-foreground">
                      {worker.display_name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{worker.display_name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        ⭐ {Number(worker.behavior_score).toFixed(1)} · {formatDistance(worker.km)} · {worker.etaMin} min ETA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && currentJob && (
          <Confirmation
            job={currentJob}
            workers={matchWorkers(
              workers,
              { lat: Number(currentJob.latitude), lng: Number(currentJob.longitude), label: currentJob.location_label },
              currentJob.category,
              4,
            )}
          />
        )}

        {step !== 4 && (
          <div className="mt-10 flex items-center justify-between gap-3">
            <button onClick={back} disabled={step === 1} className="text-sm font-semibold text-muted-foreground disabled:opacity-30">
              Previous
            </button>
            {step < 3 ? (
              <Button onClick={next} disabled={!canNext} className="h-12 rounded-full px-6 font-bold">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => create.mutate()} disabled={create.isPending || !user} className="h-12 rounded-full px-6 font-bold shadow-glow">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Zap className="mr-2 h-4 w-4 fill-current" /> Post & match</>}
              </Button>
            )}
          </div>
        )}

        {!user && step === 3 && (
          <p className="mt-4 text-center text-xs text-warning">Sign in to post your job and save the matched workers list.</p>
        )}
      </div>
    </AppShell>
  );
};

const Confirmation = ({ job, workers }: { job: Job; workers: ReturnType<typeof matchWorkers> }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const hire = useMutation({
    mutationFn: async (workerId: string) => {
      const { error } = await supabase.rpc("assign_worker_to_job", {
        p_job_id: job.id,
        p_worker_id: workerId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["job", job.id] });
      qc.invalidateQueries({ queryKey: ["jobs"] });
      qc.invalidateQueries({ queryKey: ["posted-jobs"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Worker hired", description: "Escrow has been funded and the worker is now assigned." });
      navigate(`/app/jobs/${job.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Could not hire worker", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="animate-float-up text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-money shadow-glow">
        <Check className="h-10 w-10 text-primary-foreground" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold md:text-4xl">Job posted</h1>
      <p className="mt-2 text-muted-foreground">
        {job.title} for {formatNaira(job.budget_ngn)} in {job.location_label}
      </p>

      <div className="gig-panel mt-8 p-6 text-left">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
          <Sparkles className="h-4 w-4" /> Nearby matched workers
        </div>
        <div className="mt-4 space-y-3">
          {workers.length === 0 && (
            <div className="gig-panel border-dashed p-4 text-sm text-muted-foreground">
              No worker profiles are live nearby yet. Your job is still posted and visible in the explore map.
            </div>
          )}
          {workers.map((worker) => (
            <div key={worker.id} className="gig-panel flex items-center gap-3 p-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-money font-bold text-primary-foreground">
                {worker.display_name[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{worker.display_name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  ⭐ {Number(worker.behavior_score).toFixed(1)} · {worker.locationLabel} · {formatDistance(worker.km)} · {worker.etaMin} min ETA
                </div>
                {worker.matchingSkills.length > 0 && (
                  <div className="mt-1 text-xs text-primary">Best for: {worker.matchingSkills.slice(0, 2).join(", ")}</div>
                )}
              </div>
              <Button size="sm" className="rounded-full font-bold" onClick={() => hire.mutate(worker.user_id)} disabled={hire.isPending || !!job.worker_id}>
                Hire
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="outline" onClick={() => navigate("/app")} className="h-12 rounded-full">
          <Briefcase className="mr-2 h-4 w-4" /> Home
        </Button>
        <Button onClick={() => navigate(`/app/jobs/${job.id}`)} className="h-12 rounded-full font-bold">
          View job <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PostJob;
