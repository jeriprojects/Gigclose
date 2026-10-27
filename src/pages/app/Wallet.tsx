import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { AppShell } from "@/components/gigclose/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatNaira, Profile, Transaction, WithdrawalRequest } from "@/lib/gigs";
import { ArrowDownLeft, ArrowUpRight, Banknote, Wallet as WalletIcon } from "lucide-react";

const WalletPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [amount, setAmount] = useState("10000");
  const [notes, setNotes] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => { const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single(); if (error) throw error; return data as Profile; },
    enabled: !!user,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["wallet-transactions", user?.id],
    queryFn: async () => { const { data, error } = await supabase.from("transactions").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }); if (error) throw error; return data as Transaction[]; },
    enabled: !!user,
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ["withdrawals", user?.id],
    queryFn: async () => { const { data, error } = await supabase.from("withdrawal_requests").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }); if (error) throw error; return data as WithdrawalRequest[]; },
    enabled: !!user,
  });

  const withdraw = useMutation({
    mutationFn: async () => { const { error } = await supabase.rpc("submit_withdrawal_request", { p_amount_ngn: Number(amount), p_notes: notes || null }); if (error) throw error; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["withdrawals"] }); qc.invalidateQueries({ queryKey: ["profile"] }); toast({ title: "Withdrawal submitted" }); setNotes(""); },
    onError: (e: Error) => toast({ title: "Failed", description: e.message, variant: "destructive" }),
  });

  const balance = profile?.wallet_balance_ngn ?? 0;
  const totalIn = transactions.filter((t) => t.direction === "credit" && t.status === "completed").reduce((s, t) => s + t.amount_ngn, 0);
  const totalOut = transactions.filter((t) => t.direction === "debit" && t.status === "completed").reduce((s, t) => s + t.amount_ngn, 0);

  return (
    <AppShell>
      <div className="container max-w-6xl py-6">
        <div className="gig-page-hero signed-in-hero--gray mb-5 grid gap-5 p-6 sm:p-8 lg:grid-cols-[1fr,0.8fr] lg:items-end">
          <div>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Wallet</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Review earnings, withdrawals, and every platform transaction in one clean ledger.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="gig-stat-tile p-4">
              <div className="text-xs text-muted-foreground">Balance</div>
              <div className="mt-1 font-display text-3xl font-bold text-foreground">{formatNaira(balance)}</div>
            </div>
            <div className="gig-stat-tile p-4">
              <div className="text-xs text-muted-foreground">Transactions</div>
              <div className="mt-1 font-display text-3xl font-bold text-foreground">{transactions.length}</div>
            </div>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-3">
            <div className="gig-panel p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary"><WalletIcon className="h-4 w-4" /> Balance</div>
              <div className="mt-1 font-display text-4xl font-bold text-primary">{formatNaira(balance)}</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="gig-kpi-card"><div className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDownLeft className="h-3 w-3 text-success" />Total in</div><div className="font-bold text-success mt-1">{formatNaira(totalIn)}</div></div>
                <div className="gig-kpi-card"><div className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpRight className="h-3 w-3 text-warning" />Total out</div><div className="font-bold mt-1">{formatNaira(totalOut)}</div></div>
              </div>
            </div>
            <div className="gig-panel p-5">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Banknote className="h-5 w-5 text-primary" /> Request withdrawal</h2>
              <div className="space-y-3">
                <div><Label>Amount</Label><Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} className="mt-1" /></div>
                <div><Label>Bank / note</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="GT Bank — 0123456789" className="mt-1" /></div>
                <Button onClick={() => withdraw.mutate()} disabled={withdraw.isPending || Number(amount) <= 0 || Number(amount) > balance} className="w-full">Submit request</Button>
              </div>
            </div>
            {withdrawals.length > 0 && (
              <div className="gig-panel p-5">
                <h2 className="font-display text-lg font-bold mb-3">Withdrawals</h2>
                <div className="space-y-2">{withdrawals.map((r) => (
                  <div key={r.id} className="gig-panel flex items-center justify-between p-3">
                    <div><div className="font-medium">{formatNaira(r.amount_ngn)}</div><div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</div></div>
                    <span className={`text-xs font-medium capitalize ${r.status === "approved" ? "text-success" : r.status === "rejected" ? "text-destructive" : "text-warning"}`}>{r.status}</span>
                  </div>
                ))}</div>
              </div>
            )}
          </div>
          <div className="gig-panel p-5">
            <h2 className="font-display text-lg font-bold mb-3">Transactions</h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {transactions.length === 0 && <p className="text-sm text-muted-foreground">No transactions yet.</p>}
              {transactions.map((t) => (
                <div key={t.id} className="gig-panel gig-panel-interactive flex items-center gap-3 p-3">
                  <div className={`grid h-9 w-9 place-items-center rounded-2xl ${t.direction === "credit" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                    {t.direction === "credit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm capitalize">{t.type.replace(/_/g, " ")}</div>
                    <div className="text-xs text-muted-foreground truncate">{t.description || "Platform transaction"}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold text-sm ${t.direction === "credit" ? "text-success" : ""}`}>{t.direction === "credit" ? "+" : "-"}{formatNaira(t.amount_ngn)}</div>
                    <div className="text-xs text-muted-foreground">{t.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default WalletPage;
