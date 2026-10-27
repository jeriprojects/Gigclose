import { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { AppShell } from "@/components/gigclose/AppShell";
import { Button } from "@/components/ui/button";
import { formatNaira, Job } from "@/lib/gigs";
import { Briefcase, CheckCircle2, Clock3, MapPin, Plus, Radar } from "lucide-react";

const JobsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: profile } = useCurrentProfile();

  const { data: postedJobs = [] } = useQuery({
    queryKey: ["posted-jobs", user?.id],
    queryFn: async () => { const { data, error } = await supabase.from("jobs").select("*").eq("client_id", user!.id).order("created_at", { ascending: false }); if (error) throw error; return data as Job[]; },
    enabled: !!user,
  });

  const { data: assignedJobs = [] } = useQuery({
    queryKey: ["assigned-jobs", user?.id],
    queryFn: async () => { const { data, error } = await supabase.from("jobs").select("*").eq("worker_id", user!.id).order("created_at", { ascending: false }); if (error) throw error; return data as Job[]; },
    enabled: !!user,
  });

  const markCompleted = useMutation({
    mutationFn: async (jobId: string) => { const { error } = await supabase.rpc("complete_job_and_release_payment", { p_job_id: jobId }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["posted-jobs"] }); qc.invalidateQueries({ queryKey: ["assigned-jobs"] }); toast({ title: "Job completed" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <AppShell>
      <div className="container max-w-6xl py-6">
        <div className="gig-page-hero signed-in-hero--gray mb-5 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-end sm:p-8">
          <div>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">My Jobs</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Track posted work, accepted jobs, payouts, and completion actions from one dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.account_type === "client" && <Link to="/app/post"><Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"><Plus className="h-4 w-4" /> Post job</Button></Link>}
            <Link to="/app/explore"><Button size="sm" variant="outline" className="gap-2 border-border"><Radar className="h-4 w-4" /> Find gigs</Button></Link>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-3 gap-3">
          <M label="Posted" value={postedJobs.length} />
          <M label="Accepted" value={assignedJobs.length} />
          <M label="Completed" value={[...postedJobs, ...assignedJobs].filter((j) => j.status === "completed").length} />
        </div>
        {(profile?.account_type !== "worker" || postedJobs.length > 0) && (
          <Section title="As a client">
            {postedJobs.length === 0 && <Empty label="No jobs posted." cta="Post a job" to="/app/post" />}
            {postedJobs.map((j) => <JobRow key={j.id} job={j} action={["assigned", "in_progress"].includes(j.status) ? <Button size="sm" onClick={() => markCompleted.mutate(j.id)}>Release pay</Button> : <Link to={`/app/jobs/${j.id}`}><Button size="sm" variant="outline">View</Button></Link>} />)}
          </Section>
        )}
        {(profile?.account_type !== "client" || assignedJobs.length > 0) && (
          <Section title={profile?.account_type === "client" ? "Jobs you accepted" : "As a worker"}>
            {assignedJobs.length === 0 && <Empty label="No assigned jobs." cta="Find gigs" to="/app/explore" />}
            {assignedJobs.map((j) => <JobRow key={j.id} job={j} action={j.status === "assigned" ? <Button size="sm" onClick={() => markCompleted.mutate(j.id)}>Complete</Button> : <Link to={`/app/jobs/${j.id}`}><Button size="sm" variant="outline">View</Button></Link>} />)}
          </Section>
        )}
      </div>
    </AppShell>
  );
};

const M = ({ label, value }: { label: string; value: number }) => (<div className="gig-kpi-card"><div className="text-xs text-muted-foreground">{label}</div><div className="font-display text-xl font-bold mt-1">{value}</div></div>);
const Section = ({ title, children }: { title: string; children: ReactNode }) => (<section className="gig-panel mb-4 p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl font-bold">{title}</h2><span className="h-1.5 w-10 rounded-full bg-primary/40" /></div><div className="space-y-2">{children}</div></section>);
const Empty = ({ label, cta, to }: { label: string; cta: string; to: string }) => (<div className="gig-panel border-dashed py-8 text-center text-sm text-muted-foreground">{label} <Link to={to} className="ml-1 font-medium text-primary">{cta}</Link></div>);
const JobRow = ({ job, action }: { job: Job; action: ReactNode }) => (
  <div className="gig-panel gig-panel-interactive flex items-center justify-between gap-3 p-3">
    <div className="min-w-0">
      <div className="font-medium truncate">{job.title}</div>
      <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
        <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{job.status.replace(/_/g, " ")}</span>
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location_label}</span>
      </div>
    </div>
    <div className="flex items-center gap-3 shrink-0">
      <span className="font-bold text-primary">{formatNaira(job.budget_ngn)}</span>
      {action}
    </div>
  </div>
);

export default JobsPage;
