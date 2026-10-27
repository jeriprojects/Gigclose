import { Link } from "react-router-dom";
import { CheckCircle2, Clock, X, Zap } from "lucide-react";
import { useActiveInstantHire, type InstantHireStage } from "@/lib/instant-hire-tracker";
import { Button } from "@/components/ui/button";

const STAGES: { key: InstantHireStage; label: string }[] = [
  { key: "sent", label: "Sent" },
  { key: "accepted", label: "Accepted" },
  { key: "started", label: "Started" },
];

const stageIndex = (stage: InstantHireStage) => {
  if (stage === "sent") return 0;
  if (stage === "accepted") return 1;
  return 2;
};

export const ActiveHireBanner = () => {
  const { request, dismiss } = useActiveInstantHire();
  if (!request || request.stage === "cancelled") return null;
  const current = stageIndex(request.stage);

  return (
    <div className="sticky top-14 z-30 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-background backdrop-blur">
      <div className="container py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-glow-sm">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Instant Hire {request.stage === "started" ? "in progress" : "in flight"}
              </div>
              <div className="font-semibold truncate text-sm">
                {request.workerName} · {request.distanceKm.toFixed(1)}km · ETA {request.etaMinutes}m
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ol className="flex items-center gap-1.5 sm:gap-2 text-xs">
              {STAGES.map((stage, idx) => {
                const reached = idx <= current;
                const active = idx === current;
                return (
                  <li key={stage.key} className="flex items-center gap-1.5">
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border text-[10px] font-bold transition ${
                        reached
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground"
                      } ${active ? "ring-2 ring-primary/30 animate-pulse" : ""}`}
                    >
                      {reached ? <CheckCircle2 className="h-3 w-3" /> : idx + 1}
                    </span>
                    <span className={`font-semibold ${reached ? "text-foreground" : "text-muted-foreground"} hidden sm:inline`}>
                      {stage.label}
                    </span>
                    {idx < STAGES.length - 1 && (
                      <span className={`h-px w-4 sm:w-6 ${idx < current ? "bg-primary" : "bg-border"}`} />
                    )}
                  </li>
                );
              })}
            </ol>

            <div className="flex items-center gap-1">
              <Link to="/app/messages">
                <Button size="sm" variant="ghost" className="rounded-full text-xs">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  Track
                </Button>
              </Link>
              <Button
                size="sm"
                variant="ghost"
                className="rounded-full text-muted-foreground hover:text-foreground"
                onClick={dismiss}
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
