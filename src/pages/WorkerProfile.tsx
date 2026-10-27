import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, BriefcaseBusiness, CheckCircle2, MapPin, ShieldCheck, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PublicSiteShell } from "@/components/gigclose/PublicSiteShell";
import { InstantHireModal } from "@/components/gigclose/InstantHireModal";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/ui/page-loader";
import { useAuth } from "@/contexts/AuthContext";
import { WorkerRating } from "@/lib/gigs";

const WorkerProfile = () => {
  const { id } = useParams();
  const [hireOpen, setHireOpen] = useState(false);
  const { user } = useAuth();
  const { data: worker } = useQuery({
    queryKey: ["public-worker", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("worker_public_profiles").select("*").eq("user_id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
  const { data: ratings = [] } = useQuery({
    queryKey: ["worker-ratings", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("worker_ratings").select("*").eq("worker_id", id!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as WorkerRating[];
    },
    enabled: !!id,
  });
  const { data: professionalProfile, isError: professionalProfileError } = useQuery({
    queryKey: ["public-worker-professional-profile", id, user?.id],
    queryFn: async () => {
      if (!id) throw new Error("Worker profile is missing an ID.");
      const [cvResult, experienceResult, portfolioResult] = await Promise.all([
        supabase.from("worker_cvs").select("*").eq("user_id", id).maybeSingle(),
        supabase.from("worker_experience").select("*").eq("worker_id", id).order("start_date", { ascending: false }),
        supabase.from("worker_portfolio_items").select("*").eq("worker_id", id).order("created_at", { ascending: false }),
      ]);
      if (cvResult.error) throw cvResult.error;
      if (experienceResult.error) throw experienceResult.error;
      if (portfolioResult.error) throw portfolioResult.error;

      const portfolio = await Promise.all(portfolioResult.data.map(async (item) => {
        const { data, error } = await supabase.storage
          .from("worker-professional-media")
          .createSignedUrl(item.media_path, 15 * 60);
        if (error) throw error;
        return { ...item, mediaUrl: data.signedUrl };
      }));

      return { cv: cvResult.data, experience: experienceResult.data, portfolio };
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });

  if (!worker) return <PageLoader label="Loading worker profile..." />;

  return (
    <PublicSiteShell>
      <section className="gig-grid-surface -mt-24 pt-32 pb-14 md:pb-20">
        <div className="container">
        <div className="gig-page-hero p-8 sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary"><BadgeCheck className="h-4 w-4" /> Worker profile</div>
              <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{worker.display_name}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-primary" />{worker.city || "Unknown"}</span>
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-warning" />{Number(worker.worker_average_rating).toFixed(1)} ({worker.worker_rating_count})</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {user && user.id !== worker.user_id && (
                <Button onClick={() => setHireOpen(true)} className="gap-1.5 font-bold shadow-glow-sm"><Zap className="h-4 w-4 fill-current" />Instant Hire</Button>
              )}
              <Link to="/auth?role=client&redirect=/app/post"><Button variant="outline">Post a job</Button></Link>
            </div>
          </div>
          {worker.bio && <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground">{worker.bio}</p>}
          {(worker.skills ?? []).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(worker.skills ?? []).map((s) => <span key={s} className="rounded-full gig-stat-tile px-3 py-1 text-xs text-white">{s}</span>)}
            </div>
          )}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Metric label="Behavior score" value={Number(worker.behavior_score).toFixed(2)} />
          <Metric label="Completion rate" value={`${Number(worker.completion_rate).toFixed(0)}%`} />
          <Metric label="Jobs completed" value={`${worker.jobs_completed}`} />
        </div>
        {professionalProfileError && (
          <p role="alert" className="mt-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
            Professional profile details could not be loaded.
          </p>
        )}
        {professionalProfile && (
          <ProfessionalProfileSections profile={professionalProfile} />
        )}
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "Trust signals", body: "Behavior score, ratings, and completion history help clients hire with more confidence." },
            { icon: CheckCircle2, title: "Work history", body: "Completed jobs and reviews give a quick read on consistency and reliability." },
            { icon: BriefcaseBusiness, title: "Fast hiring", body: "Clients can start with Instant Hire or create a dedicated job for this worker." },
          ].map((item) => (
            <div key={item.title} className="gig-panel gig-panel-interactive p-5">
              <div className="gig-icon-tile h-11 w-11"><item.icon className="h-5 w-5" /></div>
              <h3 className="mt-3 font-display text-lg font-bold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
        {ratings.length > 0 && (
          <div className="mt-6">
            <h2 className="font-display text-2xl font-bold mb-4">Reviews</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {ratings.slice(0, 6).map((r) => (
                <div key={r.id} className="gig-panel p-4">
                  <div className="flex gap-0.5 text-warning">{Array.from({ length: r.stars }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{r.review || "Completed successfully."}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </section>
      {user && <InstantHireModal open={hireOpen} onOpenChange={setHireOpen} worker={worker} />}
    </PublicSiteShell>
  );
};

const ProfessionalProfileSections = ({
  profile,
}: {
  profile: {
    cv: {
      headline: string;
      summary: string;
      skills: string[];
      education: string;
      certifications: string;
    } | null;
    experience: Array<{
      id: string;
      job_title: string;
      organization: string;
      location: string;
      start_date: string;
      end_date: string | null;
      is_current: boolean;
      description: string;
    }>;
    portfolio: Array<{
      id: string;
      title: string;
      description: string;
      media_type: string;
      mediaUrl: string;
    }>;
  };
}) => {
  const cv = profile.cv;
  const hasCv = Boolean(cv && (
    cv.headline || cv.summary || cv.skills.length || cv.education || cv.certifications
  ));
  if (!hasCv && profile.experience.length === 0 && profile.portfolio.length === 0) return null;

  return (
    <section className="mt-6 space-y-5">
      <h2 className="font-display text-2xl font-bold">Professional profile</h2>
      {hasCv && cv && (
        <article className="gig-panel p-5 sm:p-6">
          <h3 className="font-display text-xl font-bold">{cv.headline || "CV"}</h3>
          {cv.summary && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">{cv.summary}</p>}
          {cv.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {cv.skills.map((skill) => <span key={skill} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{skill}</span>)}
            </div>
          )}
          {(cv.education || cv.certifications) && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {cv.education && <ProfileTextBlock title="Education and training" text={cv.education} />}
              {cv.certifications && <ProfileTextBlock title="Certifications" text={cv.certifications} />}
            </div>
          )}
        </article>
      )}

      {profile.experience.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-xl font-bold">Work history</h3>
          <div className="space-y-3">
            {profile.experience.map((item) => (
              <article key={item.id} className="gig-panel p-4">
                <h4 className="font-semibold">{item.job_title}</h4>
                <p className="text-sm text-primary">{item.organization}{item.location ? ` · ${item.location}` : ""}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatProfileMonth(item.start_date)} – {item.is_current ? "Present" : item.end_date ? formatProfileMonth(item.end_date) : "End date not set"}
                </p>
                {item.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.description}</p>}
              </article>
            ))}
          </div>
        </div>
      )}

      {profile.portfolio.length > 0 && (
        <div>
          <h3 className="mb-3 font-display text-xl font-bold">Portfolio</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profile.portfolio.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                {item.media_type === "video" ? (
                  <video src={item.mediaUrl} controls preload="metadata" className="aspect-video w-full bg-black" aria-label={item.title} />
                ) : (
                  <img src={item.mediaUrl} alt={item.title} className="aspect-video w-full object-cover" />
                )}
                <div className="p-4">
                  <h4 className="font-semibold">{item.title}</h4>
                  {item.description && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.description}</p>}
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

const ProfileTextBlock = ({ title, text }: { title: string; text: string }) => (
  <div>
    <h4 className="font-semibold">{title}</h4>
    <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{text}</p>
  </div>
);

const formatProfileMonth = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { year: "numeric", month: "short" });

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="gig-kpi-card">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 font-display text-2xl font-bold">{value}</div>
  </div>
);

export default WorkerProfile;
