import { Link } from "react-router-dom";
import { ArrowRight, BellRing, BriefcaseBusiness, CheckCircle2, MapPin, ShieldCheck, Wallet, Zap } from "lucide-react";
import { PublicSiteShell } from "@/components/gigclose/PublicSiteShell";
import { PageHero } from "@/components/gigclose/PageHero";
import { Button } from "@/components/ui/button";
import signupBackground from "@/assets/gigclosesignup.jpg";

const HowItWorks = () => (
  <PublicSiteShell>
    <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 pb-20 pt-10 md:pt-14">
      <div className="container space-y-12">
        <PageHero
          className="signed-in-hero--gray"
          eyebrow="How it works"
          title={<>From nearby need to <span className="text-sky-700">paid work</span> in four steps.</>}
          description="Workers earn. Clients hire. Admins oversee trust and payments — all in one flow."
          side={
            <div
              className="gig-panel overflow-hidden border-white/20 bg-cover bg-center p-5 text-white"
              style={{
                backgroundImage: `linear-gradient(110deg, rgba(7, 22, 48, 0.88), rgba(7, 22, 48, 0.62)), url(${signupBackground})`,
              }}
            >
              {[
                { icon: MapPin, label: "Location-first discovery" },
                { icon: BellRing, label: "Nearby job alerts" },
                { icon: Wallet, label: "Tracked wallet payouts" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 border-b border-white/20 py-4 last:border-0 first:pt-0 last:pb-0">
                  <div className="gig-icon-tile h-10 w-10 bg-white/15 text-white"><item.icon className="h-4 w-4" /></div>
                  <span className="text-sm font-semibold text-white">{item.label}</span>
                </div>
              ))}
            </div>
          }
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <FlowCard icon={Zap} title="Job seeker flow" steps={[
            "Explore nearby gigs on the public marketplace.",
            "Sign up as a worker and complete your profile.",
            "Apply for jobs that match your location and skills.",
            "Complete work, collect wallet earnings, request withdrawals.",
          ]} />
          <FlowCard icon={BriefcaseBusiness} title="Job poster flow" steps={[
            "Create a client account dedicated to hiring.",
            "Post a job with title, budget, location, and urgency.",
            "Fund escrow, then review applicants or hire fast.",
            "Complete the job and rate the worker.",
          ]} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Protected actions", d: "Applying, posting, hiring, and messaging require authentication." },
            { icon: Wallet, t: "Internal payments", d: "Posting fees, escrow, worker payouts, and withdrawals stay inside Gigsclose." },
            { icon: CheckCircle2, t: "Shared discovery", d: "Browse the marketplace and inspect jobs whether you mainly hire or mainly work." },
          ].map((f) => (
            <div key={f.t} className="gig-panel gig-panel-interactive p-6">
              <div className="gig-icon-tile h-11 w-11"><f.icon className="h-5 w-5" /></div>
              <h3 className="mt-3 font-semibold">{f.t}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>

        <div className="gig-panel flex flex-col gap-4 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="gig-eyebrow">Ready to move?</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Choose a role and enter the app.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/auth?role=worker&redirect=/app">
              <Button className="gap-2 rounded-full"><Zap className="h-4 w-4" /> Worker account <ArrowRight className="h-4 w-4" /></Button>
            </Link>
            <Link to="/auth?role=client&redirect=/app/post">
              <Button variant="outline" className="rounded-full">Client account</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  </PublicSiteShell>
);

const FlowCard = ({ icon: Icon, title, steps }: { icon: typeof Zap; title: string; steps: string[] }) => (
  <div className="gig-panel gig-panel-interactive p-7">
    <div className="gig-icon-tile h-12 w-12"><Icon className="h-5 w-5" /></div>
    <h2 className="mt-4 font-display text-2xl font-bold">{title}</h2>
    <div className="mt-5 space-y-3">
      {steps.map((s, i) => (
        <div key={s} className="flex items-start gap-3">
          <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</div>
          <p className="text-sm leading-6 text-muted-foreground">{s}</p>
        </div>
      ))}
    </div>
  </div>
);

export default HowItWorks;
