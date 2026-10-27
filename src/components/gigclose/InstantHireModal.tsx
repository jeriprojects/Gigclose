import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Profile, formatDistance, etaMinutes, haversineKm, resolveArea } from "@/lib/gigs";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Loader2, Zap, MapPin, Clock, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { usePreferences, safeVibrate, safeNotify } from "@/lib/preferences";
import { startInstantHire } from "@/lib/instant-hire-tracker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: Pick<
    Profile,
    | "user_id"
    | "display_name"
    | "avatar_url"
    | "city"
    | "worker_average_rating"
    | "behavior_score"
    | "is_suspended"
    | "is_restricted"
    | "auto_earn_enabled"
  >;
};

export const InstantHireModal = ({ open, onOpenChange, worker }: Props) => {
  const { location } = useGeolocation();
  const { prefs } = usePreferences();
  const [stage, setStage] = useState<"confirm" | "sending" | "accepted">("confirm");
  const [secondsLeft, setSecondsLeft] = useState(15);

  const workerLoc = useMemo(() => resolveArea(worker.city), [worker.city]);
  const km = useMemo(() => haversineKm(location, workerLoc), [location, workerLoc]);
  const eta = etaMinutes(km);
  const isAvailable = !worker.is_suspended && !worker.is_restricted && (worker.auto_earn_enabled ?? true);

  useEffect(() => {
    if (!open) {
      setStage("confirm");
      setSecondsLeft(15);
      return;
    }
    safeVibrate(40, prefs.vibrationInstantHire);
  }, [open, prefs.vibrationInstantHire]);

  useEffect(() => {
    if (!open || stage !== "confirm") return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, stage]);

  const handleConfirm = async () => {
    setStage("sending");
    safeVibrate([20, 60, 20], prefs.vibrationInstantHire);
    await new Promise((res) => setTimeout(res, 900));
    setStage("accepted");
    safeVibrate([30, 50, 30, 50, 80], prefs.vibrationInstantHire);
    safeNotify(
      "Instant Hire sent",
      `${worker.display_name} was pinged. ETA ${eta} min.`,
      prefs.notificationsInstantHire,
    );
    toast.success("Instant Hire request sent", {
      description: `${worker.display_name} will respond shortly.`,
    });
    startInstantHire({
      workerId: worker.user_id,
      workerName: worker.display_name,
      workerAvatarUrl: worker.avatar_url,
      etaMinutes: eta,
      distanceKm: km,
    });
  };

  const handleCancel = () => {
    safeVibrate(15, prefs.vibrationInstantHire);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border">
        <div className="relative bg-gradient-money p-6 text-primary-foreground">
          <DialogTitle className="text-xs font-bold uppercase tracking-widest text-primary-foreground/80">
            Instant Hire
          </DialogTitle>
          <DialogDescription className="sr-only">
            Confirm an instant hire request for {worker.display_name}
          </DialogDescription>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-background/20 grid place-items-center text-xl font-bold">
              {worker.display_name?.[0]?.toUpperCase() ?? "W"}
            </div>
            <div>
              <div className="font-display text-2xl font-bold leading-tight">{worker.display_name}</div>
              <div className="text-xs text-primary-foreground/80">
                ⭐ {Number(worker.worker_average_rating ?? 0).toFixed(1)} · Score {Number(worker.behavior_score).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">Distance</div>
              <div className="mt-1 font-display text-lg font-bold flex items-center justify-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" /> {formatDistance(km)}
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">ETA</div>
              <div className="mt-1 font-display text-lg font-bold flex items-center justify-center gap-1">
                <Clock className="h-3.5 w-3.5 text-primary" /> {eta}m
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-3 text-center">
              <div className="text-[10px] uppercase font-semibold text-muted-foreground">Status</div>
              <div className={`mt-1 font-display text-sm font-bold ${isAvailable ? "text-success" : "text-warning"}`}>
                {isAvailable ? "● Available" : "● Busy"}
              </div>
            </div>
          </div>

          {stage === "confirm" && (
            <>
              <p className="mt-4 text-sm text-muted-foreground text-center">
                We'll vibrate their device and send a push. They have <strong>{secondsLeft}s</strong> to respond.
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground text-center">
                Manage vibration & notification opt-ins in <a href="/app/settings" className="text-primary font-semibold">Settings</a>.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={handleCancel} className="rounded-full">
                  <X className="h-4 w-4 mr-1.5" /> Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!isAvailable}
                  className="rounded-full font-bold shadow-glow-sm gap-1.5"
                >
                  <Zap className="h-4 w-4 fill-current" /> Confirm hire
                </Button>
              </div>
            </>
          )}

          {stage === "sending" && (
            <div className="mt-6 flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="text-sm font-semibold">Pinging {worker.display_name}…</div>
            </div>
          )}

          {stage === "accepted" && (
            <div className="mt-6 flex flex-col items-center gap-3 py-2">
              <div className="h-12 w-12 rounded-full bg-success/15 grid place-items-center">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div className="font-display text-lg font-bold">Request sent</div>
              <p className="text-sm text-muted-foreground text-center">
                Track the live status from the banner at the top of every screen.
              </p>
              <Button onClick={() => onOpenChange(false)} className="rounded-full mt-2">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
