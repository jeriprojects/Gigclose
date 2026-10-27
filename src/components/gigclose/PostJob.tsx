import { MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const PostJob = () => {
  return (
    <section id="post" className="py-24 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Form card */}
          <div className="rounded-3xl bg-gradient-card border border-border p-8 shadow-elevated">
            <div className="flex items-center justify-between mb-6">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Post a job
              </div>
              <div className="text-xs text-success font-semibold">~ 30 seconds</div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Job title</label>
                <div className="mt-1.5 h-12 rounded-xl bg-background border border-border px-4 flex items-center text-sm">
                  Need a cleaner this afternoon
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Budget</label>
                  <div className="mt-1.5 h-12 rounded-xl bg-background border border-border px-4 flex items-center text-sm font-semibold text-primary">
                    ₦8,000
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Location</label>
                  <div className="mt-1.5 h-12 rounded-xl bg-background border border-border px-4 flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" /> Lekki Phase 1
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Urgency</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  <button className="h-12 rounded-xl bg-background border border-border text-sm font-semibold">
                    Normal
                  </button>
                  <button className="h-12 rounded-xl bg-warning/15 border border-warning/40 text-warning text-sm font-bold inline-flex items-center justify-center gap-1.5">
                    🔥 Urgent
                  </button>
                </div>
              </div>

              <Link
                to="/app/post?step=1&area=Lekki+Phase+1&urgent=true"
                className="mt-2 inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-glow hover:bg-primary/90"
              >
                <Zap className="h-5 w-5 fill-current" /> Post & match instantly
              </Link>
            </div>
          </div>

          {/* Copy */}
          <div className="lg:pl-8">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Post a job in <br />
              <span className="text-gradient-primary">30 seconds.</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-md">
              No long forms. No back-and-forth. Set what you need, where you are,
              and how urgent — we route it to the right people instantly.
            </p>

            <div className="mt-8 space-y-3">
              {[
                'Real-time matching to nearby workers',
                'Escrow-protected payments built in',
                'Live ETA and location sharing',
                'Quick-replies and instant chat',
              ].map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-primary/15 text-primary grid place-items-center text-xs mt-0.5">✓</div>
                  <Link to="/app/post" className="text-foreground/90 hover:text-primary transition-colors">{b}</Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
