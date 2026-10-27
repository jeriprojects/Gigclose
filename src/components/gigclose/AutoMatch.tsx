import { Bell, MapPin, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const AutoMatch = () => {
  return (
    <section id="automatch" className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/8 rounded-full blur-3xl -z-10" />

      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider mb-5">
              <Sparkles className="h-3.5 w-3.5" /> Signature feature
            </div>
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight leading-[0.95]">
              Gigsclose <br />
              <span className="text-gradient-primary">AutoMatch™</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-lg leading-relaxed">
              Flip the switch. Jobs come to <em>you</em> — matched by location,
              skills, availability and your performance score. No applications.
              No friction.
            </p>

            <ol className="mt-8 space-y-4">
              {[
                { n: '1', t: 'Toggle Auto-Earn Mode', d: 'One tap. You\'re live.' },
                { n: '2', t: 'We analyze your context', d: 'Location, skills, demand, score.' },
                { n: '3', t: 'Get instant job pings', d: 'Accept or decline in seconds.' },
              ].map((s) => (
                <li key={s.n} className="flex gap-4">
                  <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center font-bold text-sm shrink-0 shadow-glow-sm">
                    {s.n}
                  </div>
                  <div>
                    <div className="font-semibold">{s.t}</div>
                    <div className="text-sm text-muted-foreground">{s.d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Visual: Job ping */}
          <div className="relative">
            <div className="relative rounded-3xl bg-gradient-warm border border-border p-8 shadow-elevated">
              {/* Notification card */}
              <div className="relative rounded-2xl bg-card border border-primary/30 p-5 shadow-glow">
                <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary pulse-ring" />
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-money grid place-items-center text-primary-foreground">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">New AutoMatch</div>
                    <div className="font-bold">Delivery job assigned</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-secondary border border-border p-3">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Pay</div>
                    <div className="font-display text-lg font-bold text-primary">₦12k</div>
                  </div>
                  <div className="rounded-xl bg-secondary border border-border p-3">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Distance</div>
                    <div className="font-display text-lg font-bold">1.2km</div>
                  </div>
                  <div className="rounded-xl bg-secondary border border-border p-3">
                    <div className="text-[10px] text-muted-foreground uppercase font-semibold">Starts</div>
                    <div className="font-display text-lg font-bold">20m</div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Victoria Island → Lekki Phase 1
                </div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <Link to="/app/messages" className="inline-flex h-11 items-center justify-center rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80">
                    Decline
                  </Link>
                  <Link to="/auth?redirect=/app/profile" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-glow-sm hover:bg-primary/90">
                    <Zap className="h-4 w-4 fill-current" /> Accept
                  </Link>
                </div>
              </div>

              {/* Stat strip */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-card border border-border p-4">
                  <div className="text-xs text-muted-foreground">Avg. response</div>
                  <div className="font-display text-2xl font-bold mt-1">12s</div>
                </div>
                <div className="rounded-2xl bg-card border border-border p-4">
                  <div className="text-xs text-muted-foreground">Match rate</div>
                  <div className="font-display text-2xl font-bold mt-1 text-primary">94%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
