import { CheckCircle2, Clock, MapPin, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const metrics = [
  { icon: Clock, label: 'Response time', value: '8s', sub: 'avg per ping' },
  { icon: CheckCircle2, label: 'Completion', value: '98%', sub: 'jobs finished' },
  { icon: MapPin, label: 'Show-up rate', value: '96%', sub: 'arrived on time' },
  { icon: ShieldCheck, label: 'Behavior score', value: '4.9', sub: 'out of 5' },
];

export const Trust = () => {
  return (
    <section id="trust" className="py-24 md:py-32 bg-gradient-warm">
      <div className="container">
        <div className="max-w-3xl">
          <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
            Real Behavior Score
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight leading-tight">
            Trust isn't a star rating. <br />
            <span className="text-muted-foreground">It's whether they show up.</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
            We track what actually matters: response time, completion, cancellations
            and location reliability. So you only work with people who deliver.
          </p>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <Link key={m.label} to="/app/profile" className="block rounded-3xl bg-card border border-border p-6 hover:border-primary/40 hover:shadow-card transition-all hover:-translate-y-1">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                <m.icon className="h-5 w-5" />
              </div>
              <div className="mt-5 font-display text-4xl font-bold tracking-tight">{m.value}</div>
              <div className="mt-1 text-sm font-semibold">{m.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{m.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
