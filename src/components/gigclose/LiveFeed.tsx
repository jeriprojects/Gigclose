import { Briefcase, Clock, MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const liveGigs = [
  { title: "House cleaner needed", cat: "Cleaning", dist: "300m", eta: "8 min", price: 8000, urgent: true },
  { title: "Same-day bike delivery", cat: "Logistics", dist: "1.2km", eta: "15 min", price: 4500 },
  { title: "Fix bedroom socket", cat: "Electrical", dist: "2.1km", eta: "22 min", price: 12000 },
  { title: "Help moving 3 boxes", cat: "Moving", dist: "850m", eta: "11 min", price: 6500 },
  { title: "Photographer for event", cat: "Creative", dist: "3.4km", eta: "30 min", price: 35000, urgent: true },
  { title: "Plumber — leaking tap", cat: "Plumbing", dist: "1.8km", eta: "20 min", price: 9000 },
];

export const LiveFeed = () => {
  return (
    <section id="how" className="py-24 md:py-32">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-blink" />
              LIVE NEAR YOU
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
              Gigs around you.<br />
              <span className="text-muted-foreground">Updated every second.</span>
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['1km', '5km', '10km'].map((r, i) => (
            <Link
              key={r}
              to={`/app/explore?radius=${parseInt(r, 10)}`}
              className={`inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold ${i === 1 ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-secondary'} transition-colors`}
            >
              {r}
            </Link>
            ))}
            <Link to="/app/explore" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> Available now
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {liveGigs.map((g, i) => (
            <Link
              key={i}
              to={`/app/explore?radius=${g.dist.includes("km") ? 5 : 1}`}
              className="group relative block rounded-3xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="h-11 w-11 rounded-2xl bg-primary/10 grid place-items-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Briefcase className="h-5 w-5" />
                </div>
                {g.urgent && (
                  <span className="text-[10px] px-2 py-1 rounded-full bg-warning/15 text-warning font-bold uppercase tracking-wider">
                    🔥 Urgent
                  </span>
                )}
              </div>

              <div className="mt-4">
                <div className="text-xs text-muted-foreground">{g.cat}</div>
                <h3 className="mt-1 font-semibold text-lg leading-tight">{g.title}</h3>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {g.dist}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {g.eta}</span>
              </div>

              <div className="mt-5 pt-5 border-t border-border flex items-center justify-between">
                <div className="font-display text-2xl font-bold text-gradient-primary">
                  ₦{g.price.toLocaleString()}
                </div>
                <span className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-glow-sm">
                  <Zap className="h-3.5 w-3.5 fill-current" /> Hire
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
