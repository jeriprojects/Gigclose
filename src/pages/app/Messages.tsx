import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/gigclose/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CATEGORY_META, formatNaira, Job, JobApplication, Profile } from "@/lib/gigs";
import { ArrowLeft, Loader2, MessageSquare, Send } from "lucide-react";

type ChatMessage = { id: string; job_id: string; sender_id: string; recipient_id: string | null; body: string; created_at: string; read_at: string | null };
type ChatThread = { job: Job; otherUserId: string };
const QUICK = ["I'm on my way", "Running 5 min late", "Just arrived", "Thanks!"];

const Messages = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const activeJob = params.get("job");
  const requestedOtherUser = params.get("with");
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["chat-threads", user?.id],
    queryFn: async () => {
      const userId = user!.id;
      const { data: participantJobs, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .or(`client_id.eq.${userId},worker_id.eq.${userId}`)
        .order("created_at", { ascending: false });
      if (jobsError) throw jobsError;

      const ownedJobs = (participantJobs ?? []).filter((job) => job.client_id === userId);
      const [workerApplicationsResult, clientApplicationsResult] = await Promise.all([
        supabase.from("job_applications").select("job_id, worker_id").eq("worker_id", userId),
        ownedJobs.length
          ? supabase.from("job_applications").select("job_id, worker_id").in("job_id", ownedJobs.map((job) => job.id))
          : Promise.resolve({ data: [], error: null }),
      ]);
      if (workerApplicationsResult.error) throw workerApplicationsResult.error;
      if (clientApplicationsResult.error) throw clientApplicationsResult.error;

      const applicationRows = [
        ...(workerApplicationsResult.data ?? []),
        ...(clientApplicationsResult.data ?? []),
      ] as Pick<JobApplication, "job_id" | "worker_id">[];
      const knownJobs = new Map((participantJobs ?? []).map((job) => [job.id, job as Job]));
      const missingJobIds = [...new Set(applicationRows.map((application) => application.job_id))]
        .filter((jobId) => !knownJobs.has(jobId));
      if (missingJobIds.length) {
        const { data, error } = await supabase.from("jobs").select("*").in("id", missingJobIds);
        if (error) throw error;
        for (const job of data ?? []) knownJobs.set(job.id, job as Job);
      }

      const threadMap = new Map<string, ChatThread>();
      const addThread = (job: Job, otherUserId: string | null) => {
        if (!otherUserId || otherUserId === userId) return;
        threadMap.set(`${job.id}:${otherUserId}`, { job, otherUserId });
      };

      for (const job of participantJobs ?? []) {
        if (job.worker_id) {
          addThread(job as Job, job.client_id === userId ? job.worker_id : job.client_id);
        }
      }

      for (const application of applicationRows) {
        const job = knownJobs.get(application.job_id);
        if (!job) continue;
        if (application.worker_id === userId) {
          addThread(job, job.client_id);
        } else if (job.client_id === userId) {
          addThread(job, application.worker_id);
        }
      }

      return [...threadMap.values()].sort(
        (a, b) => b.job.created_at.localeCompare(a.job.created_at),
      );
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (threadsLoading) return;
    if (!activeJob && threads[0]) {
      const next = new URLSearchParams(params);
      next.set("job", threads[0].job.id);
      next.set("with", threads[0].otherUserId);
      setParams(next, { replace: true });
      return;
    }
    if (activeJob && !requestedOtherUser) {
      const matchingThread = threads.find((thread) => thread.job.id === activeJob);
      if (!matchingThread) return;
      const next = new URLSearchParams(params);
      next.set("with", matchingThread.otherUserId);
      setParams(next, { replace: true });
    }
  }, [activeJob, params, requestedOtherUser, setParams, threads, threadsLoading]);

  const currentThread = useMemo(
    () => threads.find((thread) => thread.job.id === activeJob && thread.otherUserId === requestedOtherUser) ?? null,
    [activeJob, requestedOtherUser, threads],
  );
  const currentJob = currentThread?.job ?? null;
  const otherUserId = currentThread?.otherUserId ?? null;

  const { data: otherProfile } = useQuery({
    queryKey: ["profile", otherUserId],
    queryFn: async () => { const { data, error } = await supabase.from("profiles").select("*").eq("user_id", otherUserId!).single(); if (error) throw error; return data as Profile; },
    enabled: !!otherUserId,
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", activeJob, otherUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("job_id", activeJob!)
        .or(`and(sender_id.eq.${user!.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user!.id}),recipient_id.is.null`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!currentJob && !!otherUserId && !!user,
  });

  useEffect(() => {
    if (!activeJob || !currentJob || !otherUserId || !user) return;
    const ch = supabase.channel(`messages:${activeJob}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `job_id=eq.${activeJob}` }, (p) => {
      const m = p.new as ChatMessage;
      const belongsToConversation =
        (m.sender_id === user.id && m.recipient_id === otherUserId) ||
        (m.sender_id === otherUserId && m.recipient_id === user.id);
      if (!belongsToConversation) return;
      qc.setQueryData<ChatMessage[]>(["messages", activeJob, otherUserId], (c = []) => c.some((x) => x.id === m.id) ? c : [...c, m]);
    }).subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [activeJob, currentJob, otherUserId, qc, user]);

  useEffect(() => {
    const messageViewport = scrollRef.current?.closest<HTMLElement>("[data-radix-scroll-area-viewport]");
    if (messageViewport) {
      messageViewport.scrollTo({ top: messageViewport.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  const send = async (body: string) => {
    const t = body.trim(); if (!t || !user || !activeJob || !otherUserId || !currentJob) return; setDraft("");
    const { error } = await supabase.from("messages").insert({ job_id: activeJob, sender_id: user.id, recipient_id: otherUserId, body: t });
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
      setDraft(t);
      return;
    }
    await qc.invalidateQueries({ queryKey: ["messages", activeJob, otherUserId] });
  };

  return (
    <AppShell>
      <div className="container max-w-5xl py-6">
        <div className="gig-page-hero signed-in-hero--gray mb-5 p-6 sm:p-8">
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">Messages</h1>
        </div>
        <div className="grid min-h-0 min-w-0 grid-cols-1 gap-3 h-[calc(100dvh-19rem)] min-h-[240px] md:grid-cols-[280px_minmax(0,1fr)] md:h-[calc(100dvh-260px)] md:min-h-0">
          <div className={`gig-panel overflow-hidden flex flex-col ${activeJob ? "hidden md:flex" : "flex"}`}>
            <div className="p-3 border-b border-border text-xs font-semibold text-muted-foreground">{threads.length} conversations</div>
            <ScrollArea className="flex-1">
              {threads.map((thread) => (
                <button key={`${thread.job.id}:${thread.otherUserId}`} onClick={() => { const n = new URLSearchParams(params); n.set("job", thread.job.id); n.set("with", thread.otherUserId); setParams(n, { replace: true }); }}
                  className={`w-full border-b border-border py-3 pl-3 pr-6 text-left text-sm transition last:border-0 ${activeJob === thread.job.id && requestedOtherUser === thread.otherUserId ? "bg-primary/5" : "hover:bg-slate-50"}`}>
                  <ConversationTitle title={thread.job.title} />
                  <div className="text-xs text-muted-foreground mt-0.5">{formatNaira(thread.job.budget_ngn)} · {thread.job.status.replace(/_/g, " ")}</div>
                </button>
              ))}
              {threadsLoading ? (
                <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
              ) : threads.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No conversations yet. Apply for a job to message its client.</div>
              ) : null}
            </ScrollArea>
          </div>

          <div className={`gig-panel flex min-h-0 min-w-0 flex-col overflow-hidden ${activeJob ? "flex" : "hidden md:flex"}`}>
            {!currentJob ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-sm text-muted-foreground">
                {threadsLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="h-10 w-10 opacity-30" />
                    <p>{activeJob ? "Apply for this job before messaging its client." : "Select a conversation to start messaging."}</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="p-3 border-b border-border flex items-center gap-3">
                  <button onClick={() => { const n = new URLSearchParams(params); n.delete("job"); n.delete("with"); setParams(n, { replace: true }); }} className="md:hidden"><ArrowLeft className="h-5 w-5" /></button>
                  <div className="grid h-9 w-9 place-items-center rounded-2xl bg-primary text-xs font-bold text-primary-foreground">{(otherProfile?.display_name || "?")[0].toUpperCase()}</div>
                  <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{otherProfile?.display_name || "..."}</div><div className="text-xs text-muted-foreground truncate">{currentJob.title}</div></div>
                  <Link to={`/app/jobs/${currentJob.id}`} className="text-xs text-primary font-medium">View job</Link>
                </div>
                <ScrollArea className="min-h-0 flex-1 p-3">
                  <div className="space-y-2">
                    {messages.length === 0 && <div className="text-center text-sm text-muted-foreground py-8">No messages yet. Say hi 👋</div>}
                    {messages.map((m) => {
                      const mine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-primary text-primary-foreground" : "border border-slate-200 bg-white"}`}>
                            <div className="break-words whitespace-pre-wrap">{m.body}</div>
                            <div className={`text-[10px] mt-0.5 ${mine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                <div className="shrink-0 border-t border-border bg-card/95 p-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur">
                  <div className="flex gap-1.5 mb-2 overflow-x-auto">
                    {QUICK.map((q) => <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium transition hover:bg-primary hover:text-primary-foreground">{q}</button>)}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); void send(draft); }} className="flex min-w-0 gap-2">
                    <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Type a message..." className="min-w-0 flex-1" />
                    <Button type="submit" size="icon" disabled={!draft.trim()} className="shrink-0"><Send className="h-4 w-4" /></Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Messages;

const ConversationTitle = ({ title }: { title: string }) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const titleElement = titleRef.current;
    if (!viewport || !titleElement) return;

    const measureOverflow = () => {
      setOverflow(Math.max(0, titleElement.scrollWidth - viewport.clientWidth));
    };

    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(viewport);
    observer.observe(titleElement);
    return () => observer.disconnect();
  }, [title]);

  return (
    <div ref={viewportRef} className="overflow-hidden pr-1" aria-label={title} title={title}>
      <span
        ref={titleRef}
        className={`inline-block whitespace-nowrap font-medium ${overflow > 0 ? "conversation-title-marquee" : "max-w-full truncate"}`}
        style={overflow > 0 ? { "--conversation-title-overflow": `-${overflow}px` } as CSSProperties : undefined}
      >
        {title}
      </span>
    </div>
  );
};
