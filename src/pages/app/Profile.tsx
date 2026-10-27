import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AppShell } from "@/components/gigclose/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { AREA_OPTIONS, formatNaira, WithdrawalRequest } from "@/lib/gigs";
import { Bell, Briefcase, CheckCircle2, Clock, LogOut, MapPin, ShieldCheck, Sparkles, Wallet, Zap } from "lucide-react";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const { status, request } = useGeolocation();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState(AREA_OPTIONS[0].label);
  const [skills, setSkills] = useState("");
  const [autoEarn, setAutoEarn] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("5000");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const { data: profile, isLoading } = useCurrentProfile();
  const { data: withdrawals = [] } = useQuery({
    queryKey: ["withdrawals", user?.id],
    queryFn: async () => { const { data, error } = await supabase.from("withdrawal_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(5); if (error) throw error; return data as WithdrawalRequest[]; },
    enabled: !!user,
  });

  useEffect(() => { if (!profile) return; setDisplayName(profile.display_name); setBio(profile.bio ?? ""); setCity(profile.city ?? AREA_OPTIONS[0].label); setSkills((profile.skills ?? []).join(", ")); setAutoEarn(profile.auto_earn_enabled); }, [profile]);

  const saveProfile = useMutation({
    mutationFn: async () => { if (!user) return; const { error } = await supabase.from("profiles").update({ display_name: displayName.trim(), bio: bio.trim() || null, city, skills: skills.split(",").map((v) => v.trim()).filter(Boolean), auto_earn_enabled: autoEarn }).eq("user_id", user.id); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["profile", user?.id] }); toast({ title: "Profile saved" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const requestPayout = useMutation({
    mutationFn: async () => { const v = Number(payoutAmount); if (!Number.isFinite(v) || v <= 0) throw new Error("Invalid amount"); const { error } = await supabase.rpc("submit_withdrawal_request", { p_amount_ngn: v, p_notes: payoutNotes || null }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["withdrawals"] }); qc.invalidateQueries({ queryKey: ["profile"] }); toast({ title: "Payout requested" }); setPayoutNotes(""); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const updatePassword = useMutation({
    mutationFn: async () => { if (newPassword.trim().length < 8) throw new Error("Min 8 chars"); const { error } = await supabase.auth.updateUser({ password: newPassword.trim() }); if (error) throw error; },
    onSuccess: () => { toast({ title: "Password updated" }); setNewPassword(""); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  if (isLoading || !profile) return <AppShell><div className="container py-8 text-muted-foreground">Loading...</div></AppShell>;
  const balance = profile.wallet_balance_ngn;
  const isClient = profile.account_type === "client";

  return (
    <AppShell>
      <div className="container max-w-6xl py-6">
        <div className="gig-page-hero signed-in-hero--gray flex flex-col gap-5 p-6 sm:p-8 md:flex-row md:items-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white text-slate-950 font-display text-2xl font-bold">{profile.display_name[0]?.toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground">{profile.display_name}</h1>
            <div className="mt-2 text-sm text-muted-foreground capitalize">{profile.account_type}{profile.is_verified && <span className="text-primary ml-2">· Verified</span>}</div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{profile.city || "Set area"}{status === "granted" && <span className="text-primary ml-1">· GPS</span>}</div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" size="sm" onClick={request} className="border-border"><MapPin className="h-4 w-4 mr-1" /> Location</Button>
            <Button variant="outline" size="sm" onClick={signOut} className="border-border"><LogOut className="h-4 w-4 mr-1" /> Sign out</Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          <S icon={Sparkles} label="Behavior" value={Number(profile.behavior_score).toFixed(2)} />
          <S icon={Clock} label="Response" value={`${profile.response_time_seconds || 0}s`} />
          <S icon={CheckCircle2} label="Completion" value={`${Number(profile.completion_rate).toFixed(0)}%`} />
          <S icon={Briefcase} label="Jobs" value={`${profile.jobs_completed}`} />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="gig-panel p-5">
            <div className="flex items-center gap-2 mb-1"><Wallet className="h-4 w-4 text-primary" /><span className="text-xs font-semibold text-muted-foreground">Wallet</span></div>
            <div className="font-display text-3xl font-bold text-primary">{formatNaira(balance)}</div>
            <div className="mt-3 space-y-3">
              <div><Label className="text-xs">Payout amount (₦)</Label><Input inputMode="numeric" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value.replace(/[^\d]/g, ""))} className="mt-1" /></div>
              <div><Label className="text-xs">Bank / note</Label><Input value={payoutNotes} onChange={(e) => setPayoutNotes(e.target.value)} placeholder="GT Bank — 0123456789" className="mt-1" /></div>
              <Button onClick={() => requestPayout.mutate()} disabled={requestPayout.isPending || Number(payoutAmount) <= 0 || Number(payoutAmount) > balance} className="w-full">Request {formatNaira(Number(payoutAmount) || 0)}</Button>
            </div>
            {withdrawals.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border space-y-1">
                {withdrawals.slice(0, 3).map((w) => (
                  <div key={w.id} className="gig-panel flex justify-between px-3 py-2 text-sm">
                    <span>{formatNaira(w.amount_ngn)}</span>
                    <span className={`text-xs font-medium capitalize ${w.status === "approved" ? "text-success" : w.status === "rejected" ? "text-destructive" : "text-warning"}`}>{w.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="gig-panel p-5">
            <h2 className="font-display text-lg font-bold mb-3">Edit profile</h2>
            <div className="space-y-3">
              <div><Label>Display name</Label><Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="mt-1" /></div>
              <div><Label>Bio</Label><Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={2} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Area</Label><select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 flex h-9 w-full rounded-2xl border border-input bg-white px-3 text-sm">{AREA_OPTIONS.map((a) => <option key={a.label} value={a.label}>{a.label}</option>)}</select></div>
                {!isClient && <div><Label>Skills</Label><Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="cleaning, delivery" className="mt-1" /></div>}
              </div>
              {!isClient && (
                <div className="gig-panel flex items-center justify-between p-3">
                  <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-medium">Auto-Earn</span></div>
                  <Switch checked={autoEarn} onCheckedChange={setAutoEarn} />
                </div>
              )}
              <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="w-full">Save profile</Button>
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <Label>Change password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="mt-1" />
              <Button onClick={() => updatePassword.mutate()} disabled={updatePassword.isPending || newPassword.length < 8} variant="outline" className="mt-2 w-full">Update password</Button>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { to: "/app/wallet", t: "Wallet", d: "Transaction history" },
            { to: "/app/jobs", t: "My Jobs", d: "Active & completed" },
            { to: "/app/messages", t: "Messages", d: "Chat with others" },
            { to: "/app/settings", t: "Settings", d: "Alerts and permissions" },
            { to: "/app/explore", t: "Explore", d: "Live jobs" },
            ...(!isClient ? [{ to: `/workers/${profile.user_id}`, t: "Public profile", d: "How clients see you" }] : []),
            ...(profile.is_admin ? [{ to: "/app/admin", t: "Admin", d: "Manage platform" }] : []),
          ].map((l) => (
            <Link key={l.to} to={l.to} className="gig-panel gig-panel-interactive p-3">
              <div className="font-medium text-sm">{l.t}</div>
              <div className="text-xs text-muted-foreground">{l.d}</div>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

const S = ({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) => (
  <div className="gig-kpi-card">
    <Icon className="h-4 w-4 text-primary" />
    <div className="font-display text-lg font-bold mt-1">{value}</div>
    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</div>
  </div>
);

export default ProfilePage;
