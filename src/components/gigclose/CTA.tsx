import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export const CTA = () => {
  return (
    <section className="py-24 md:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-ink p-12 md:p-20 text-center shadow-elevated">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(224_100%_58%/0.4),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(255_90%_65%/0.3),transparent_55%)]" />

          <div className="relative">
            <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-background leading-[0.95]">
              Your next ₦15,000 <br /> is 300m away.
            </h2>
            <p className="mt-5 text-lg text-background/80 max-w-xl mx-auto">
              Now live in Lagos & Abuja. Join the real-time work engine.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-bold bg-background text-foreground hover:bg-background/90 rounded-full w-full sm:w-auto shadow-glow"
                >
                  <Zap className="mr-2 h-5 w-5 fill-current text-primary" />
                  Create account
                </Button>
              </Link>
              <Link to="/app">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base font-bold rounded-full border-background/30 bg-background/10 text-background hover:bg-background/20 w-full sm:w-auto"
                >
                  Open the app
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
