import { Briefcase, MapPin, Sparkles, Zap } from "lucide-react";

const gigs = [
  { title: "Cleaner needed", dist: "300m", eta: "8 min", price: "₦8,000", urgent: true },
  { title: "Bike delivery", dist: "1.2km", eta: "15 min", price: "₦4,500" },
  { title: "Electrician", dist: "2.1km", eta: "22 min", price: "₦12,000" },
];

export const PhoneMock = () => {
  return (
    <div className="relative">
      {/* Glow */}
      <div className="absolute -inset-10 bg-primary/15 blur-3xl rounded-full -z-10" />

      <div className="relative aspect-[9/19] w-[292px] rounded-[3rem] bg-gradient-ink p-3 shadow-elevated sm:w-[328px]">
        <div className="relative h-full w-full rounded-[2.4rem] bg-background overflow-hidden">
          {/* notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-28 bg-foreground rounded-full z-20" />

          {/* Screen content */}
          <div className="h-full w-full flex flex-col p-4 pt-10">
            {/* Top bar */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">9:41</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-primary" /> Lagos · Lekki
              </span>
            </div>

            {/* Earn now hero */}
            <div className="mt-4 rounded-2xl bg-gradient-money p-4 text-primary-foreground relative overflow-hidden">
              <div className="absolute inset-0 animate-shimmer opacity-50" />
              <div className="relative">
                <div className="text-[10px] uppercase tracking-widest opacity-90 font-semibold">Available now</div>
                <div className="mt-1 font-display text-2xl font-bold leading-tight">
                  ₦15,000<span className="text-sm font-medium opacity-80"> / 3 hrs</span>
                </div>
                <button className="mt-3 w-full h-10 rounded-xl bg-white/25 backdrop-blur text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 fill-current" /> Earn now
                </button>
              </div>
            </div>

            {/* AutoMatch toggle */}
            <div className="mt-3 rounded-xl bg-secondary border border-border p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <div className="text-[11px] font-semibold">Auto-Earn Mode</div>
                  <div className="text-[9px] text-muted-foreground">Jobs come to you</div>
                </div>
              </div>
              <div className="relative h-5 w-9 rounded-full bg-primary">
                <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow" />
              </div>
            </div>

            {/* Feed label */}
            <div className="mt-4 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold">Gigs near you</span>
              <span className="text-[9px] text-muted-foreground">5km radius</span>
            </div>

            {/* Gig cards */}
            <div className="space-y-2 flex-1">
              {gigs.map((g, i) => (
                <div key={i} className="rounded-xl bg-card border border-border p-2.5 flex items-center gap-2.5 shadow-soft">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 grid place-items-center text-primary">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold flex items-center gap-1.5">
                      {g.title}
                      {g.urgent && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-warning/20 text-warning font-bold uppercase">
                          Urgent
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      {g.dist} · {g.eta} away
                    </div>
                  </div>
                  <div className="text-[11px] font-bold text-primary">{g.price}</div>
                </div>
              ))}
            </div>

            {/* Bottom nav */}
            <div className="mt-3 -mx-2 rounded-2xl bg-card border border-border px-2 py-2 flex items-center justify-around shadow-soft">
              {['🏠', '🔍', '➕', '💬', '👤'].map((e, i) => (
                <div key={i} className={`h-8 w-8 grid place-items-center text-xs rounded-lg ${i === 0 ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}`}>
                  {e}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
