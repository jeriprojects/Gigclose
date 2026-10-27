import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Sparkles, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { PhoneMock } from "./PhoneMock";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Soft glow background */}
      <div className="absolute inset-0 -z-10 bg-radial-blue" />
      <div className="absolute top-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl -z-10" />
      <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-warning/10 blur-3xl -z-10" />

      <div className="container pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
          {/* Copy */}
          <div className="animate-float-up">
            <div className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 text-xs font-semibold shadow-soft mb-6">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-blink" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              Live in Lagos & Abuja
              <span className="text-muted-foreground">· 12,400+ gigs today</span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[0.95] tracking-tight">
              Make money <br className="hidden sm:block" />
              <span className="text-gradient-primary">around you.</span>
              <br />
              Right now.
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Gigsclose is the real-time work engine that tells you how to earn
              near you — instantly. Like Uber, but for gigs.
            </p>

            <div className="mt-9 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link to="/app">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow rounded-full group w-full sm:w-auto"
                >
                  <Zap className="mr-2 h-5 w-5 fill-current" />
                  EARN NOW
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/app/post">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-semibold rounded-full border-foreground/20 bg-card hover:bg-secondary w-full sm:w-auto"
                >
                  <MapPin className="mr-2 h-5 w-5" />
                  Post a job
                </Button>
              </Link>
            </div>

            {/* Smart earnings strip */}
            <div className="mt-10 inline-flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3 shadow-card">
              <div className="h-10 w-10 rounded-xl bg-gradient-money grid place-items-center text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-sm">
                <div className="text-muted-foreground text-xs">Smart earnings nearby</div>
                <div className="font-semibold">
                  You can make <span className="text-primary font-bold">₦15,000</span> in the next 3 hours
                </div>
              </div>
            </div>

            {/* Social proof row */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-background grid place-items-center font-bold text-xs text-primary-foreground"
                    style={{ background: `hsl(${(i * 60 + 200) % 360} 80% 60%)` }}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,300+ workers</span> earned this week
              </div>
            </div>
          </div>

          {/* Phone */}
          <div className="flex justify-center animate-float-up lg:justify-end [animation-delay:120ms]">
            <PhoneMock />
          </div>
        </div>
      </div>
    </section>
  );
};
