import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Bell, LocateFixed, MapPin, Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/gigclose/AppShell";
import { LocationQualityIndicator } from "@/components/gigclose/LocationQualityIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import bolaImage from "@/assets/bola.jpg";
import ellaImage from "@/assets/ella.jpg";
import exploreHeroBackgroundImage from "@/assets/job-background.jpg";
import huduImage from "@/assets/hudu.jpg";
import kelvinImage from "@/assets/kelvin.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useGeolocation } from "@/hooks/use-geolocation";
import ujuImage from "@/assets/uju.jpg";
import {
  CATEGORY_META,
  Job,
  JobCategory,
  formatDistance,
  formatNaira,
  matchesAllSearchTerms,
  rankJobsForUser,
} from "@/lib/gigs";
import { requestNotificationPermission, usePreferences } from "@/lib/preferences";

type ExploreJob = Job & {
  km?: number;
  etaMin?: number;
};

const categoryOptions = Object.entries(CATEGORY_META) as [JobCategory, (typeof CATEGORY_META)[JobCategory]][];
const JOBS_PER_PAGE = 12;

const heroPeopleImages = [
  { name: "Bola", image: bolaImage },
  { name: "Uju", image: ujuImage },
  { name: "Hudu", image: huduImage },
  { name: "Ella", image: ellaImage },
  { name: "Kelvin", image: kelvinImage },
];

const previewCardImages = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&w=900&q=80",
];

const fetchOpenJobs = async () => {
  const { data, error } = await supabase.from("jobs").select("*").eq("status", "open").limit(100);
  if (error) throw error;
  return data as Job[];
};

const AppExplore = () => {
  const { location, request, status } = useGeolocation();
  const { data: jobs = [] } = useQuery({ queryKey: ["app-explore-jobs"], queryFn: fetchOpenJobs });
  const { prefs, update } = usePreferences();
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">(
    Capacitor.isNativePlatform()
      ? "default"
      : typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported",
  );
  const [query, setQuery] = useState("");
  const [radius, setRadius] = useState(20);
  const [category, setCategory] = useState<JobCategory | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const resultsTopRef = useRef<HTMLDivElement>(null);
  const hasLocation = status === "granted";
  const alertsReady = notificationPermission === "granted" && prefs.notificationsAutoMatch;

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const interval = window.setInterval(() => {
      setNotificationPermission(Notification.permission);
    }, 2_000);
    return () => window.clearInterval(interval);
  }, []);

  const rankedJobs = useMemo<ExploreJob[]>(() => {
    if (hasLocation) return rankJobsForUser(jobs, location);
    return [...jobs].sort((a, b) => Number(b.urgent) - Number(a.urgent) || b.created_at.localeCompare(a.created_at));
  }, [hasLocation, jobs, location]);

  const availableJobs = useMemo(() => {
    return rankedJobs
      .filter((j) => !hasLocation || (j.km ?? Number.POSITIVE_INFINITY) <= radius)
      .filter((j) => matchesAllSearchTerms(j, query));
  }, [hasLocation, query, radius, rankedJobs]);

  const filtered = useMemo(
    () => availableJobs.filter((job) => category === "all" || job.category === category),
    [availableJobs, category],
  );

  const highPayCount = filtered.filter((job) => job.budget_ngn >= 60000).length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / JOBS_PER_PAGE));
  const pageStart = (currentPage - 1) * JOBS_PER_PAGE;
  const paginatedJobs = filtered.slice(pageStart, pageStart + JOBS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [category, query, radius]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const scrollToResults = () => {
    const top = resultsTopRef.current
      ? resultsTopRef.current.getBoundingClientRect().top + window.scrollY - 96
      : 0;

    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const goToPage = (page: number) => {
    const nextPage = Math.min(totalPages, Math.max(1, page));
    if (nextPage === currentPage) return;
    setCurrentPage(nextPage);
    scrollToResults();
  };

  const enableNotifications = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    if (permission === "granted") update({ notificationsAutoMatch: true });
  };

  return (
    <AppShell>
      <section className="bg-white pb-12 sm:pb-16">
        <div
          className="relative overflow-hidden pt-8 sm:pt-12"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.84) 52%, rgba(2,6,23,0.72) 100%), url(${exploreHeroBackgroundImage})`,
            backgroundPosition: "center top",
            backgroundSize: "cover",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.36),transparent_34%),radial-gradient(circle_at_18%_26%,rgba(59,130,246,0.22),transparent_28%)]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/45 to-transparent" />
          <div className="container relative max-w-7xl">
            <div className="pb-8 pt-6 sm:pb-10 sm:pt-12 lg:pb-12 lg:pt-14">
              <div className="grid items-center gap-7 lg:grid-cols-[1fr,430px] lg:gap-10 xl:grid-cols-[1fr,500px]">
                <div className="max-w-4xl">
                  <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                    Discover local work that is ready to move.
                  </h1>
                  <p className="mt-5 max-w-2xl text-sm leading-7 text-white sm:text-base">
                    {hasLocation
                      ? `Showing opportunities near ${location.label}. Search, filter, and apply to work around you.`
                      : "Browse live jobs across Nigeria, then turn on location for distance and ETA ranking."}
                  </p>
                  <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
                    <LocationQualityIndicator
                      className="border-white/20 bg-white/10 text-white"
                      textClassName="text-white"
                    />
                    {!hasLocation && status !== "unsupported" && (
                      <Button onClick={request} className="w-full rounded-full bg-white text-slate-950 hover:bg-slate-100 sm:w-auto">
                        <LocateFixed className="mr-2 h-4 w-4" />
                        Use my location
                      </Button>
                    )}
                    <Button
                      onClick={enableNotifications}
                      disabled={alertsReady || notificationPermission === "unsupported"}
                      className="w-full rounded-full bg-sky-500 text-white hover:bg-sky-600 sm:w-auto"
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {alertsReady ? "Job alerts on" : notificationPermission === "denied" ? "Alerts blocked" : "Get job alerts"}
                    </Button>
                  </div>
                </div>

                <ExploreHeroPeople resultCount={filtered.length} />
              </div>

              <div className="mt-7 rounded-[1.75rem] border border-white/20 bg-white/95 p-2 shadow-[0_28px_80px_-56px_rgba(15,23,42,0.75)] backdrop-blur sm:mt-9 sm:p-3">
                <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr),150px,190px]">
                  <div className="group relative flex min-h-14 items-center rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-3 transition focus-within:border-sky-300 focus-within:bg-white focus-within:shadow-[0_18px_44px_-34px_rgba(14,165,233,0.75)]">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sky-600 shadow-sm transition group-focus-within:bg-sky-500 group-focus-within:text-white">
                      <Search className="h-4 w-4" />
                    </div>
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search jobs by title, city, bus stop, category, or details"
                      className="h-12 border-0 bg-transparent px-3 text-base font-medium text-slate-950 shadow-none placeholder:text-slate-400 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                  <FilterSelect value={String(radius)} onChange={(v) => setRadius(Number(v))} label="Radius" disabled={!hasLocation}>
                    {[5, 10, 20, 50].map((v) => <option key={v} value={v}>{v}km radius</option>)}
                  </FilterSelect>
                  <FilterSelect value={category} onChange={(v) => setCategory(v as JobCategory | "all")} label="Category">
                    <option value="all">All categories</option>
                    {categoryOptions.map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
                  </FilterSelect>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-7xl pt-5">
          <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryChip active={category === "all"} onClick={() => setCategory("all")} label="All jobs" count={availableJobs.length} />
            {categoryOptions.map(([key, value]) => (
              <CategoryChip
                key={key}
                active={category === key}
                onClick={() => setCategory(key)}
                label={value.label}
                count={availableJobs.filter((job) => job.category === key).length}
              />
            ))}
          </div>

          <div ref={resultsTopRef} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Open jobs</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered.length} results{highPayCount ? `, including ${highPayCount} high-paying jobs` : ""}
              </p>
            </div>
            <div className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              {hasLocation ? `${radius}km radius` : "All locations"}
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedJobs.map((job, index) => (
              <JobCard key={job.id} job={job} href={`/app/jobs/${job.id}`} hasLocation={hasLocation} image={previewCardImages[(pageStart + index) % previewCardImages.length]} />
            ))}
          </div>

          {filtered.length > JOBS_PER_PAGE && (
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-center text-sm font-medium text-slate-500 sm:text-left">
                Showing {pageStart + 1}-{Math.min(pageStart + JOBS_PER_PAGE, filtered.length)} of {filtered.length} jobs
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-bold transition ${
                        currentPage === page
                          ? "border-sky-500 bg-sky-500 text-white shadow-[0_18px_42px_-24px_rgba(14,165,233,0.9)]"
                          : "border-slate-200 bg-white text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                      }`}
                      aria-label={`Go to job page ${page}`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="gig-panel mt-6 border-dashed p-12 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">No matching jobs</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Widen your radius, clear the category filter, or search a nearby city or bus stop.
              </p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
};

const ExploreHeroPeople = ({ resultCount }: { resultCount: number }) => (
  <div className="relative mx-auto min-h-[260px] w-full max-w-[500px] sm:min-h-[330px] lg:min-h-[380px]">
    <ExploreConnectionWave resultCount={resultCount} />

    {heroPeopleImages.map(({ name, image }, index) => (
      <div
        key={name}
        className={`absolute overflow-hidden rounded-full border-[6px] border-white bg-slate-100 shadow-[0_22px_56px_-34px_rgba(15,23,42,0.7)] ${
          [
            "left-3 top-2 h-24 w-24 sm:left-6 sm:top-6 sm:h-32 sm:w-32",
            "right-4 top-5 h-20 w-20 sm:right-7 sm:top-8 sm:h-28 sm:w-28",
            "bottom-5 left-7 h-20 w-20 sm:bottom-8 sm:left-10 sm:h-28 sm:w-28",
            "bottom-4 right-8 h-24 w-24 sm:bottom-8 sm:right-12 sm:h-36 sm:w-36",
            "left-1/2 top-0 h-16 w-16 -translate-x-1/2 sm:h-20 sm:w-20",
          ][index]
        }`}
      >
        <img src={image} alt={name} className="h-full w-full object-cover" />
      </div>
    ))}
  </div>
);

const ExploreConnectionWave = ({ resultCount }: { resultCount: number }) => (
  <div
    className="absolute left-1/2 top-1/2 h-32 w-[68%] min-w-[230px] -translate-x-1/2 -translate-y-1/2"
    aria-label={`${resultCount} live jobs connecting to nearby workers`}
  >
    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
      {[0, 1, 2, 3].map((pulse) => (
        <span
          key={pulse}
          className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-[0_0_26px_rgba(255,255,255,0.95)]"
          style={{
            left: `${pulse * 24}%`,
            animation: "loader-slide 2.6s ease-in-out infinite",
            animationDelay: `${pulse * 260}ms`,
          }}
        />
      ))}
    </div>
  </div>
);

const CategoryChip = ({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) => (
  <button
    type="button"
    onClick={onClick}
    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
      active ? "border-primary bg-primary text-primary-foreground shadow-glow-sm" : "border-border bg-white/85 text-foreground hover:border-primary/40"
    }`}
  >
    {label} <span className={active ? "text-white/75" : "text-muted-foreground"}>{count}</span>
  </button>
);

const JobCard = ({ job, href, hasLocation, image }: { job: ExploreJob; href: string; hasLocation: boolean; image: string }) => {
  const cat = CATEGORY_META[job.category];
  const snippet =
    job.description?.trim() ||
    `${cat.label} support needed around ${job.location_label}, with a clear budget and fast response window.`;

  return (
    <article className="group flex min-h-[390px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white text-slate-950 shadow-[0_24px_64px_-48px_rgba(15,23,42,0.5)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_30px_80px_-52px_rgba(14,165,233,0.46)]">
      <Link to={href} className="relative block aspect-[16/8.5] overflow-hidden bg-slate-100">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 rounded-full border border-white/45 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700 shadow-sm backdrop-blur">
          {cat.label}
        </div>
        {job.urgent && (
          <div className="absolute right-3 top-3 rounded-full bg-slate-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
            Urgent
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          {hasLocation && job.km != null && job.etaMin != null ? (
            <>
              <span>{job.etaMin} min ETA</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{formatDistance(job.km)} away</span>
            </>
          ) : (
            <>
              <span>Live job</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span>{cat.label}</span>
            </>
          )}
        </div>
        <Link to={href} className="mt-3 block">
          <h3 className="font-display text-xl font-bold leading-tight tracking-tight text-slate-950 transition group-hover:text-sky-700">
            {job.title}
          </h3>
        </Link>
        <p className="mt-2 whitespace-normal break-words text-sm leading-6 text-slate-600">{snippet}</p>
        <div className="mt-auto pt-4">
          <div className="mb-4 h-px bg-slate-200" />
          <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Budget</p>
              <p className="mt-1 font-display text-xl font-bold text-slate-950">{formatNaira(job.budget_ngn)}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-sky-500" />
                <span className="break-words">{job.location_label}</span>
              </p>
            </div>
            <Link
              to={href}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-4 text-sm font-semibold text-white transition hover:bg-sky-600 min-[420px]:w-auto"
            >
              View job
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

const FilterSelect = ({ label, value, onChange, children, disabled = false }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode; disabled?: boolean }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-950 disabled:opacity-50" aria-label={label} disabled={disabled}>
    {children}
  </select>
);

export default AppExplore;
