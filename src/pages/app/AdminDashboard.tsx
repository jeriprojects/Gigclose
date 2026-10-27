import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDownToLine,
  Banknote,
  BriefcaseBusiness,
  Shield,
  ShieldAlert,
  Users,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/gigclose/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { supabase } from "@/integrations/supabase/client";
import { formatNaira, Job, Profile, Transaction, WithdrawalRequest } from "@/lib/gigs";

const AdminDashboard = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const { data: profile, isLoading } = useCurrentProfile();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!profile?.is_admin,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Job[];
    },
    enabled: !!profile?.is_admin,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!profile?.is_admin,
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: async () => {
      const { data, error } = await supabase.from("withdrawal_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as WithdrawalRequest[];
    },
    enabled: !!profile?.is_admin,
  });

  const reviewWithdrawal = useMutation({
    mutationFn: async ({ requestId, approve }: { requestId: string; approve: boolean }) => {
      const { error } = await supabase.rpc("review_withdrawal_request", {
        p_request_id: requestId,
        p_approve: approve,
        p_notes: approve ? "Approved by admin dashboard" : "Rejected by admin dashboard",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      qc.invalidateQueries({ queryKey: ["admin-transactions"] });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "Withdrawal reviewed", description: "The request status has been updated." });
    },
    onError: (error: Error) => {
      toast({ title: "Review failed", description: error.message, variant: "destructive" });
    },
  });

  const updateUserFlags = useMutation({
    mutationFn: async ({ userId, patch }: { userId: string; patch: Partial<Profile> }) => {
      const { error } = await supabase.from("profiles").update(patch).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast({ title: "User updated", description: "Account controls were refreshed." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const cancelJob = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from("jobs")
        .update({ status: "cancelled", cancelled_reason: "Cancelled by admin" })
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job cancelled", description: "The listing was cancelled successfully." });
    },
    onError: (error: Error) => {
      toast({ title: "Cancel failed", description: error.message, variant: "destructive" });
    },
  });

  const toggleDispute = useMutation({
    mutationFn: async ({ jobId, disputed }: { jobId: string; disputed: boolean }) => {
      const { error } = await supabase.from("jobs").update({ disputed }).eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({ title: "Job updated", description: "Dispute status changed." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const analytics = useMemo(() => {
    const platformRevenue = transactions
      .filter((transaction) => ["job_post_fee", "platform_fee"].includes(transaction.type) && transaction.status === "completed")
      .reduce((sum, transaction) => sum + transaction.amount_ngn, 0);
    const payoutVolume = transactions
      .filter((transaction) => transaction.type === "worker_payout" && transaction.status === "completed")
      .reduce((sum, transaction) => sum + transaction.amount_ngn, 0);
    const completionRate = jobs.length ? Math.round((jobs.filter((job) => job.status === "completed").length / jobs.length) * 100) : 0;
    const pendingWithdrawals = withdrawals.filter((request) => request.status === "pending");
    const suspendedUsers = users.filter((user) => user.is_suspended);
    const flaggedUsers = users.filter((user) => user.is_restricted || user.is_suspended);
    const openDisputes = jobs.filter((job) => job.disputed);
    const cancelledJobs = jobs.filter((job) => job.status === "cancelled");

    return {
      platformRevenue,
      payoutVolume,
      completionRate,
      activeUsers: users.filter((user) => !user.is_suspended).length,
      totalUsers: users.length,
      jobsPosted: jobs.length,
      pendingWithdrawals,
      pendingWithdrawalValue: pendingWithdrawals.reduce((sum, request) => sum + request.amount_ngn, 0),
      suspendedUsers,
      flaggedUsers,
      openDisputes,
      cancelledJobs,
      completedJobs: jobs.filter((job) => job.status === "completed").length,
      transactionCount: transactions.length,
    };
  }, [jobs, transactions, users, withdrawals]);

  const recentUsers = users.slice(0, 8);
  const recentJobs = jobs.slice(0, 8);
  const recentTransactions = transactions.slice(0, 8);
  const recentWithdrawals = withdrawals.slice(0, 8);

  if (isLoading) {
    return <AppShell><div className="container py-8 text-muted-foreground">Loading admin dashboard…</div></AppShell>;
  }

  if (!profile?.is_admin) {
    return <Navigate to="/app" replace />;
  }

  return (
    <AppShell>
      <div className="container max-w-7xl py-4 sm:py-6 lg:py-8">
        <section className="gig-page-hero signed-in-hero--gray p-5 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.15fr,0.85fr] lg:items-end">
            <div>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Run platform health, trust, and payouts from one control room.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                Review risk signals, moderate jobs, approve withdrawals, and keep revenue visibility tight across the marketplace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <SignalPill icon={<AlertTriangle className="h-4 w-4" />} label="Open disputes" value={`${analytics.openDisputes.length}`} />
                <SignalPill icon={<ArrowDownToLine className="h-4 w-4" />} label="Pending withdrawals" value={`${analytics.pendingWithdrawals.length}`} />
                <SignalPill icon={<ShieldAlert className="h-4 w-4" />} label="Flagged accounts" value={`${analytics.flaggedUsers.length}`} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <HeroStatCard
                label="Platform revenue"
                value={formatNaira(analytics.platformRevenue)}
                meta={`${analytics.transactionCount} total transactions tracked`}
              />
              <HeroStatCard
                label="Payout volume"
                value={formatNaira(analytics.payoutVolume)}
                meta={`${analytics.pendingWithdrawals.length} withdrawals awaiting review`}
              />
              <HeroStatCard
                label="Completion rate"
                value={`${analytics.completionRate}%`}
                meta={`${analytics.completedJobs} completed jobs`}
              />
              <HeroStatCard
                label="Active users"
                value={`${analytics.activeUsers}`}
                meta={`${analytics.suspendedUsers.length} suspended accounts`}
              />
            </div>
          </div>
        </section>

        <section className="mt-5 grid gap-4 sm:mt-6 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={Wallet} label="Pending withdrawal value" value={formatNaira(analytics.pendingWithdrawalValue)} tone="blue" />
            <KpiCard icon={Users} label="Total users" value={`${analytics.totalUsers}`} tone="emerald" />
            <KpiCard icon={BriefcaseBusiness} label="Jobs posted" value={`${analytics.jobsPosted}`} tone="amber" />
            <KpiCard icon={Banknote} label="Cancelled jobs" value={`${analytics.cancelledJobs.length}`} tone="rose" />
          </div>

          <div className="gig-panel p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Priority queue</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-950">Admin attention now</h2>
              </div>
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                {analytics.pendingWithdrawals.length + analytics.openDisputes.length + analytics.flaggedUsers.length} items
              </Badge>
            </div>
            <div className="mt-5 grid gap-3">
              <PriorityCard
                icon={ArrowDownToLine}
                title="Withdrawals waiting for action"
                count={analytics.pendingWithdrawals.length}
                description={`Review ${formatNaira(analytics.pendingWithdrawalValue)} before payout delays stack up.`}
                accent="bg-blue-50 text-blue-700 border-blue-100"
              />
              <PriorityCard
                icon={ShieldAlert}
                title="Accounts with trust controls"
                count={analytics.flaggedUsers.length}
                description={`${analytics.suspendedUsers.length} suspended and ${users.filter((user) => user.is_restricted).length} restricted users need oversight.`}
                accent="bg-amber-50 text-amber-700 border-amber-100"
              />
              <PriorityCard
                icon={AlertTriangle}
                title="Jobs marked as disputed"
                count={analytics.openDisputes.length}
                description="Escalations should be resolved quickly to protect both clients and workers."
                accent="bg-rose-50 text-rose-700 border-rose-100"
              />
            </div>
          </div>
        </section>

        <section className="mt-5 sm:mt-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max rounded-full bg-slate-100 p-1">
                <TabsTrigger value="overview" className="rounded-full px-4 py-2">Overview</TabsTrigger>
                <TabsTrigger value="users" className="rounded-full px-4 py-2">Users</TabsTrigger>
                <TabsTrigger value="jobs" className="rounded-full px-4 py-2">Jobs</TabsTrigger>
                <TabsTrigger value="withdrawals" className="rounded-full px-4 py-2">Withdrawals</TabsTrigger>
                <TabsTrigger value="finance" className="rounded-full px-4 py-2">Finance</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="mt-0">
              <div className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
                <Panel title="Fresh activity" subtitle="The latest marketplace entities created across the platform.">
                  <div className="grid gap-3">
                    {recentJobs.map((job) => (
                      <div key={job.id} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-950">{job.title}</p>
                              <StatusBadge tone={job.status === "completed" ? "success" : job.status === "cancelled" ? "danger" : "muted"}>
                                {job.status}
                              </StatusBadge>
                            </div>
                            <p className="mt-2 text-sm text-slate-600">
                              {job.location_label} · Budget {formatNaira(job.budget_ngn)}
                            </p>
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            {formatDate(job.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel title="System snapshot" subtitle="A quick read on the most important trust and payment conditions.">
                  <div className="grid gap-3">
                    <SnapshotRow label="Completed jobs" value={`${analytics.completedJobs}`} helper={`${analytics.completionRate}% of total jobs`} />
                    <SnapshotRow label="Disputed jobs" value={`${analytics.openDisputes.length}`} helper="Marketplace trust queue" />
                    <SnapshotRow label="Pending withdrawals" value={`${analytics.pendingWithdrawals.length}`} helper={formatNaira(analytics.pendingWithdrawalValue)} />
                    <SnapshotRow label="Restricted or suspended users" value={`${analytics.flaggedUsers.length}`} helper="Moderation watchlist" />
                    <SnapshotRow label="Platform revenue" value={formatNaira(analytics.platformRevenue)} helper="Completed fees only" />
                  </div>
                </Panel>
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-0">
              <Panel title="User management" subtitle="Verification, restrictions, and suspension controls for the newest accounts.">
                <div className="grid gap-3">
                  {recentUsers.map((user) => (
                    <div key={user.user_id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{user.display_name || "Unnamed user"}</h3>
                            {user.is_verified ? <StatusBadge tone="success">verified</StatusBadge> : <StatusBadge tone="muted">unverified</StatusBadge>}
                            {user.is_restricted ? <StatusBadge tone="warning">restricted</StatusBadge> : null}
                            {user.is_suspended ? <StatusBadge tone="danger">suspended</StatusBadge> : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                            <span className="capitalize">{user.account_type}</span>
                            <span>{user.city || "Unknown city"}</span>
                            <span>Wallet {formatNaira(user.wallet_balance_ngn)}</span>
                            <span>Score {Number(user.behavior_score).toFixed(2)}</span>
                            <span>{user.jobs_completed} jobs completed</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={user.is_verified ? "secondary" : "outline"}
                            onClick={() => updateUserFlags.mutate({ userId: user.user_id, patch: { is_verified: !user.is_verified } })}
                          >
                            {user.is_verified ? "Verified" : "Verify"}
                          </Button>
                          <Button
                            size="sm"
                            variant={user.is_restricted ? "secondary" : "outline"}
                            onClick={() => updateUserFlags.mutate({ userId: user.user_id, patch: { is_restricted: !user.is_restricted } })}
                          >
                            {user.is_restricted ? "Restricted" : "Restrict"}
                          </Button>
                          <Button
                            size="sm"
                            variant={user.is_suspended ? "destructive" : "outline"}
                            onClick={() => updateUserFlags.mutate({ userId: user.user_id, patch: { is_suspended: !user.is_suspended } })}
                          >
                            {user.is_suspended ? "Unsuspend" : "Suspend"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="jobs" className="mt-0">
              <Panel title="Job moderation" subtitle="Cancel listings, inspect budgets, and manage dispute states from a cleaner queue.">
                <div className="grid gap-3">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{job.title}</h3>
                            <StatusBadge tone={job.status === "completed" ? "success" : job.status === "cancelled" ? "danger" : "muted"}>
                              {job.status}
                            </StatusBadge>
                            {job.disputed ? <StatusBadge tone="warning">disputed</StatusBadge> : null}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                            <span>{job.location_label}</span>
                            <span>Budget {formatNaira(job.budget_ngn)}</span>
                            <span>Escrow {formatNaira(job.escrow_amount_ngn || 0)}</span>
                            <span>Platform fee {formatNaira(job.platform_fee_ngn || 0)}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => cancelJob.mutate(job.id)}>
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            variant={job.disputed ? "secondary" : "outline"}
                            onClick={() => toggleDispute.mutate({ jobId: job.id, disputed: !job.disputed })}
                          >
                            {job.disputed ? "Dispute open" : "Mark dispute"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="withdrawals" className="mt-0">
              <Panel title="Withdrawal approvals" subtitle="Keep worker payouts moving while staying deliberate on manual review.">
                <div className="grid gap-3">
                  {recentWithdrawals.map((request) => (
                    <div key={request.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-slate-950">{formatNaira(request.amount_ngn)}</h3>
                            <StatusBadge tone={request.status === "approved" ? "success" : request.status === "rejected" ? "danger" : "warning"}>
                              {request.status}
                            </StatusBadge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">{formatDate(request.created_at)}</p>
                        </div>
                        {request.status === "pending" ? (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => reviewWithdrawal.mutate({ requestId: request.id, approve: true })}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => reviewWithdrawal.mutate({ requestId: request.id, approve: false })}>
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </TabsContent>

            <TabsContent value="finance" className="mt-0">
              <Panel title="Transaction stream" subtitle="Recent financial activity across fees, payouts, and status transitions.">
                <div className="grid gap-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-semibold capitalize text-slate-950">
                              {transaction.type.replace(/_/g, " ")}
                            </h3>
                            <StatusBadge tone={transaction.status === "completed" ? "success" : "warning"}>
                              {transaction.status}
                            </StatusBadge>
                          </div>
                          <p className="mt-2 text-sm text-slate-600">
                            {transaction.reference || "No reference"} · {transaction.direction}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-lg font-bold text-slate-950">{formatNaira(transaction.amount_ngn)}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </AppShell>
  );
};

const Panel = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section className="gig-panel p-5 sm:p-6">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>
      </div>
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const HeroStatCard = ({ label, value, meta }: { label: string; value: string; meta: string }) => (
  <div className="rounded-3xl gig-stat-tile p-4 backdrop-blur-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
    <p className="mt-3 font-display text-3xl font-bold text-foreground">{value}</p>
    <p className="mt-2 text-sm text-muted-foreground">{meta}</p>
  </div>
);

const SignalPill = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-slate-950/55 px-4 py-2 text-sm text-white">
    <span className="text-primary">{icon}</span>
    <span>{label}</span>
    <span className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white">{value}</span>
  </div>
);

const KpiCard = ({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone: "blue" | "emerald" | "amber" | "rose";
}) => {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  }[tone];

  return (
    <div className="gig-kpi-card p-5">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-slate-950">{value}</p>
    </div>
  );
};

const PriorityCard = ({
  icon: Icon,
  title,
  count,
  description,
  accent,
}: {
  icon: typeof AlertTriangle;
  title: string;
  count: number;
  description: string;
  accent: string;
}) => (
  <div className={`rounded-[22px] border p-4 ${accent}`}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/80">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 opacity-80">{description}</p>
        </div>
      </div>
      <div className="rounded-full bg-white/80 px-3 py-1 text-sm font-bold">{count}</div>
    </div>
  </div>
);

const SnapshotRow = ({ label, value, helper }: { label: string; value: string; helper: string }) => (
  <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-3">
    <div>
      <p className="font-semibold text-slate-950">{label}</p>
      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </div>
    <div className="text-right">
      <p className="font-display text-2xl font-bold text-slate-950">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "muted";
  children: React.ReactNode;
}) => {
  const className = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    muted: "border-slate-200 bg-slate-100 text-slate-600",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${className}`}>
      {children}
    </span>
  );
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default AdminDashboard;
