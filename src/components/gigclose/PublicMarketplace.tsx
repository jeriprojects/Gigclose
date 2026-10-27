import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BriefcaseBusiness, Compass, LocateFixed, LogIn, ShieldCheck, Sparkles, Wallet, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/gigclose/CategoryIcon";
import { LazySection } from "@/components/ui/lazy-section";
import { Footer } from "@/components/gigclose/Footer";
import { Logo } from "@/components/gigclose/Logo";
import { PhoneMock } from "@/components/gigclose/PhoneMock";
import { CATEGORY_META, DEFAULT_LOCATION, Job, JobCategory, AREA_OPTIONS, formatDistance, formatNaira, rankJobsForUser, resolveArea } from "@/lib/gigs";

const DiscoveryMap = lazy(() => import("./DiscoveryMap"));

const RADII = [5, 15, 30] as const;

const fetchOpenJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("status", "open")
    .order("urgent", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(80);

  if (error) throw error;
  return data as Job[];
};

export const PublicMarketplace = ({ compact = false }: { compact?: boolean }) => {
  const { user, signOut } = useAuth();
  const { data: profile } = useCurrentProfile();
  const { location, status, request } = useGeolocation();
  const { data: jobs = [] } = useQuery({ queryKey: ["public-open-jobs"], queryFn: fetchOpenJobs });

  const [radius, setRadius] = useState<(typeof RADII)[number]>(15);
  const [category, setCategory] = useState<JobCategory | "all">("all");
  const [selectedArea, setSelectedArea] = useState(DEFAULT_LOCATION.label);

  useEffect(() => {
    setSelectedArea(location?.label ?? DEFAULT_LOCATION.label);
  }, [location]);

  const area = useMemo(() => {
    if (selectedArea === location.label) {
      return { lat: location.lat, lng: location.lng, label: location.label };
    }
    return resolveArea(selectedArea);
  }, [location, selectedArea]);

  const rankedJobs = useMemo(() => {
    return rankJobsForUser(jobs, area)
      .filter((job) => job.km <= radius && (category === "all" || job.category === category))
      .sort((a, b) => b.priorityScore - a.priorityScore || a.km - b.km || b.budget_ngn - a.budget_ngn);
  }, [area, category, jobs, radius]);

  const highlightedJobs = rankedJobs.slice(0, compact ? 12 : 9);
  const totalValue = highlightedJobs.reduce((sum, job) => sum + job.budget_ngn, 0);

  const workerAuthHref = "/auth?redirect=/app";
  const clientAuthHref = "/auth?role=client&redirect=/app/post";

  const primaryCta = !user
    ? { to: workerAuthHref, label: "Earn Now", icon: Zap }
    : profile?.account_type === "client"
      ? { to: "/app/post", label: "Hire Instantly", icon: BriefcaseBusiness }
      : { to: "/app", label: "Open Worker Dashboard", icon: Zap };

  const secondaryCta = !user
    ? { to: clientAuthHref, label: "Post a Job", icon: BriefcaseBusiness }
    : profile?.account_type === "client"
      ? { to: "/app/post", label: "Create a Job", icon: BriefcaseBusiness }
      : { to: clientAuthHref, label: "Use a Client Account", icon: LogIn };

  const PrimaryIcon = primaryCta.icon;
  const SecondaryIcon = secondaryCta.icon;

  const getJobHref = (job: Job) => {
    if (!user) return `/jobs/${job.id}`;
    return `/app/jobs/${job.id}`;
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#marketplace" className="transition-colors hover:text-foreground">Marketplace</a>
            <a href="#roles" className="transition-colors hover:text-foreground">Roles</a>
            <Link to="/admin/auth" className="transition-colors hover:text-foreground">Admin</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/app">
                  <Button size="sm" variant="outline" className="rounded-full">Dashboard</Button>
                </Link>
                <Button size="sm" className="rounded-full" onClick={signOut}>Sign out</Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button size="sm" variant="ghost" className="hidden rounded-full sm:inline-flex">Sign in</Button>
                </Link>
                <Link to={primaryCta.to}>
                  <Button size="sm" className="rounded-full shadow-glow-sm">{primaryCta.label}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-radial-blue" />
        <div className="absolute left-0 top-10 -z-10 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-warning/10 blur-3xl" />
        <div className="absolute inset-y-0 right-[18%] -z-10 hidden w-px bg-gradient-to-b from-transparent via-border/70 to-transparent lg:block" />

        <div className="container py-10 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
            <div className="animate-float-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success animate-blink" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                Live marketplace across the world
                <span className="text-muted-foreground">· Nigeria first</span>
              </div>

              <div className="mt-6 space-y-4">
                <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
                  Make money
                  <br />
                  <span className="text-gradient-primary">around you.</span>
                  <br />
                  Right now.
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  GigClose is the real-time work engine for nearby earning and instant hiring. Browse live jobs publicly, then move fast inside a clear worker or client account.
                </p>
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to={primaryCta.to}>
                  <Button size="lg" className="h-14 rounded-full px-8 text-base font-bold shadow-glow group">
                    <PrimaryIcon className="mr-2 h-5 w-5" />
                    {primaryCta.label}
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <Link to={secondaryCta.to}>
                  <Button size="lg" variant="outline" className="h-14 rounded-full px-8 text-base font-semibold">
                    <SecondaryIcon className="mr-2 h-5 w-5" />
                    {secondaryCta.label}
                  </Button>
                </Link>
              </div>

              <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-money text-primary-foreground">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="text-sm">
                  <div className="text-xs text-muted-foreground">Smart earnings nearby</div>
                  <div className="font-semibold">
                    Visible jobs currently total <span className="font-bold text-primary">{formatNaira(totalValue || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["W", "C", "A", "K"].map((label, index) => (
                    <div
                      key={label}
                      className="grid h-9 w-9 place-items-center rounded-full border-2 border-background text-xs font-bold text-primary-foreground"
                      style={{ background: `hsl(${(index * 52 + 200) % 360} 85% 58%)` }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{highlightedJobs.length}+ live gigs</span> already visible near {area.label}
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <SignalCard label="Live gigs nearby" value={highlightedJobs.length} hint={`${radius}km radius`} />
                <SignalCard label="Visible payout" value={formatNaira(totalValue || 0)} hint="top jobs right now" />
                <SignalCard label="Best fit" value={status === "granted" ? "GPS locked" : "Choose area"} hint={area.label} />
              </div>
            </div>

            <div className="animate-float-up lg:justify-end [animation-delay:120ms]">
              <div className="relative mx-auto flex max-w-[420px] flex-col items-center gap-4 lg:items-end">
                <PhoneMock />

                <div className="w-full rounded-[28px] border border-border bg-card/95 p-5 shadow-elevated backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Location required</div>
                      <h2 className="mt-2 font-display text-2xl font-bold">Where should we search?</h2>
                    </div>
                    <Compass className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We always ask for your location on landing so discovery feels immediate. Use GPS or choose an area manually.
                  </p>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label htmlFor="landing-location" className="text-sm font-semibold">Location</label>
                      <select
                        id="landing-location"
                        value={selectedArea}
                        onChange={(event) => setSelectedArea(event.target.value)}
                        className="mt-2 flex h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm"
                      >
                        {AREA_OPTIONS.map((option) => (
                          <option key={option.label} value={option.label}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="rounded-full" onClick={request}>
                        <LocateFixed className="mr-2 h-4 w-4" />
                        {status === "denied" ? "Retry location" : "Use my location"}
                      </Button>
                      <span className="inline-flex items-center rounded-full bg-secondary px-3 py-2 text-xs font-medium text-muted-foreground">
                        {status === "granted" ? `Using ${location.label}` : "Browse publicly before login"}
                      </span>
                    </div>

                    <div className="rounded-[24px] border border-border bg-background p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Current focus</div>
                          <div className="mt-1 font-semibold">{area.label}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Coverage</div>
                          <div className="font-semibold">Worldwide</div>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {["Lagos", "Abuja", "Port Harcourt", "Accra", "Nairobi", "London"].map((label) => (
                          <span key={label} className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <LazySection className="container pb-10" minHeight={500}>
        <section id="marketplace" className="rounded-[36px] border border-border bg-transparent p-5 shadow-elevated backdrop-blur md:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Public marketplace preview
              </div>
              <h2 className="mt-3 font-display text-3xl font-bold">See gigs around {area.label}</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Nearby jobs rank by distance first and payout strength next so the most useful opportunities rise to the top.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {RADII.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRadius(value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${radius === value ? "bg-primary text-primary-foreground shadow-glow-sm" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
                >
                  {value}km
                </button>
              ))}
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as JobCategory | "all")}
                className="h-10 rounded-full border border-input bg-background px-4 text-sm font-semibold"
              >
                <option value="all">All categories</option>
                {Object.entries(CATEGORY_META).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr,0.85fr]">
            <Suspense fallback={<div className="h-[360px] rounded-[28px] border border-border bg-secondary animate-pulse lg:h-[560px]" />}>
              <DiscoveryMap
                center={[area.lat, area.lng]}
                radiusKm={radius}
                jobs={highlightedJobs}
                centerLabel={area.label}
                getJobHref={getJobHref}
              />
            </Suspense>

            <div className="space-y-3 lg:max-h-[560px] lg:overflow-y-auto lg:pr-1">
              {highlightedJobs.length === 0 && (
                <div className="rounded-[24px] border border-dashed border-border bg-background px-5 py-10 text-center text-sm text-muted-foreground">
                  No gigs are visible in this range yet. Try a wider radius or a different location.
                </div>
              )}
              {highlightedJobs.map((job, index) => (
                <article key={job.id} className="group rounded-[24px] border border-border bg-background p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                          <CategoryIcon category={job.category} className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">{job.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_META[job.category].label} · {job.location_label}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="rounded-full bg-secondary px-3 py-1">{formatDistance(job.km)}</span>
                        <span className="rounded-full bg-secondary px-3 py-1">{job.etaMin} min ETA</span>
                        {job.urgent && <span className="rounded-full bg-warning/15 px-3 py-1 font-semibold text-warning">Urgent</span>}
                        <span className="rounded-full bg-secondary px-3 py-1">#{index + 1} near you</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-xl font-bold text-primary">{formatNaira(job.budget_ngn)}</div>
                      <div className="text-xs text-muted-foreground">visible before login</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link to={getJobHref(job)}>
                      <Button className="rounded-full">
                        {profile?.account_type === "client" ? "Post similar job" : "Open job"}
                      </Button>
                    </Link>
                    {!user && (
                      <Link to={clientAuthHref}>
                        <Button variant="outline" className="rounded-full">Hire instead</Button>
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </LazySection>

      <LazySection className="container pb-16" minHeight={340}>
        <section id="roles" className="grid gap-4 lg:grid-cols-2">
          <RoleCard
            icon={Zap}
            eyebrow="Job seeker"
            title="One account. One lane. Built to earn fast."
            body="Browse nearby gigs, accept work, track your wallet, and let Auto-Earn bring opportunities to you. No client tools, no clutter."
            ctaLabel={profile?.account_type === "worker" ? "Open worker dashboard" : "Create worker account"}
            ctaTo={profile?.account_type === "worker" ? "/app" : workerAuthHref}
            bullets={["Nearby gigs ranked by distance and payout", "Wallet, performance score, and Auto-Earn controls", "Role-specific dashboard with zero hiring noise"]}
          />
          <RoleCard
            icon={BriefcaseBusiness}
            eyebrow="Job poster"
            title="Hire instantly with a client-only workflow."
            body="Post jobs, fund escrow, track hiring spend, and manage active workers from one focused dashboard. No worker permissions on the same account."
            ctaLabel={profile?.account_type === "client" ? "Post a job" : "Create client account"}
            ctaTo={profile?.account_type === "client" ? "/app/post" : clientAuthHref}
            bullets={["Mandatory ₦5000 job-post fee before publishing", "Escrow-backed job payments and admin-reviewed withdrawals", "Clean hiring dashboard for active jobs and spend overview"]}
          />
        </section>
      </LazySection>

      {!compact && (
        <>
          <LazySection className="container pb-20" minHeight={280}>
            <section className="rounded-[36px] border border-border bg-gradient-card p-6 shadow-card md:p-8">
              <div className="grid gap-5 md:grid-cols-3">
                <BenefitCard icon={ShieldCheck} title="Trust by default" body="Escrow, behavior score, role boundaries, and admin oversight keep the flow accountable." />
                <BenefitCard icon={Wallet} title="Payments stay internal" body="Posting fees, payouts, commissions, and withdrawals stay traceable inside GigClose." />
                <BenefitCard icon={ArrowRight} title="Friction stays low" body="Public discovery drives interest, but critical actions stay protected behind login and role checks." />
              </div>
            </section>
          </LazySection>
          <Footer />
        </>
      )}
    </main>
  );
};

const SignalCard = ({ label, value, hint }: { label: string; value: string | number; hint: string }) => (
  <div className="rounded-[24px] border border-border bg-card px-4 py-4 shadow-soft transition-transform duration-300 hover:-translate-y-1">
    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
    <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
  </div>
);

const RoleCard = ({
  icon: Icon,
  eyebrow,
  title,
  body,
  ctaLabel,
  ctaTo,
  bullets,
}: {
  icon: typeof Zap;
  eyebrow: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaTo: string;
  bullets: string[];
}) => (
  <article className="rounded-[32px] border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated">
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div className="mt-5 text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</div>
    <h3 className="mt-2 font-display text-3xl font-bold leading-tight">{title}</h3>
    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
    <div className="mt-5 space-y-2">
      {bullets.map((bullet) => (
        <div key={bullet} className="rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground/90">
          {bullet}
        </div>
      ))}
    </div>
    <Link to={ctaTo} className="mt-6 inline-flex">
      <Button className="rounded-full">{ctaLabel}</Button>
    </Link>
  </article>
);

const BenefitCard = ({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof ShieldCheck;
  title: string;
  body: string;
}) => (
  <div className="rounded-[28px] border border-border bg-background/80 p-5">
    <Icon className="h-5 w-5 text-primary" />
    <h3 className="mt-3 font-display text-xl font-bold">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
  </div>
);
