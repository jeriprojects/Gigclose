import { Database } from "@/integrations/supabase/types";
import { BriefcaseBusiness, Hammer, Palette, Package, Sparkles, Truck, Wrench, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type SavedGig = Database["public"]["Tables"]["saved_gigs"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type WithdrawalRequest = Database["public"]["Tables"]["withdrawal_requests"]["Row"];
export type ContactInquiry = Database["public"]["Tables"]["contact_inquiries"]["Row"];
export type JobApplication = Database["public"]["Tables"]["job_applications"]["Row"];
export type WorkerRating = Database["public"]["Tables"]["worker_ratings"]["Row"];
export type AccountType = Database["public"]["Enums"]["account_type"];
export type AppRole = "worker" | "client";
export type JobCategory = Job["category"];

// Lekki Phase 1 default reference point
export const DEFAULT_LOCATION = { lat: 6.4474, lng: 3.4732, label: "Lekki Phase 1" };
export const AREA_OPTIONS = [
  DEFAULT_LOCATION,
  { lat: 6.4281, lng: 3.4216, label: "Victoria Island" },
  { lat: 6.45, lng: 3.435, label: "Ikoyi" },
  { lat: 6.5095, lng: 3.3711, label: "Yaba" },
  { lat: 6.5833, lng: 3.35, label: "Ikeja GRA" },
  { lat: 6.4969, lng: 3.359, label: "Surulere" },
  { lat: 6.6203, lng: 3.3776, label: "Magodo" },
  { lat: 6.4506, lng: 3.3941, label: "Marina" },
  { lat: 9.0765, lng: 7.3986, label: "Abuja" },
  { lat: 4.8156, lng: 7.0498, label: "Port Harcourt" },
  { lat: 7.3775, lng: 3.947, label: "Ibadan" },
  { lat: 6.335, lng: 5.6037, label: "Benin City" },
  { lat: 6.5244, lng: 3.3792, label: "Lagos Island" },
  { lat: 6.5248, lng: 3.7492, label: "Epe" },
  { lat: 12.0022, lng: 8.592, label: "Kano" },
  { lat: 9.8965, lng: 8.8583, label: "Jos" },
  { lat: 6.4402, lng: 7.4943, label: "Enugu" },
  { lat: 5.532, lng: 7.486, label: "Owerri" },
  { lat: 5.0433, lng: 7.912, label: "Uyo" },
  { lat: 10.5105, lng: 7.4165, label: "Kaduna" },
  { lat: 8.4966, lng: 4.5421, label: "Ilorin" },
  { lat: 7.771, lng: 4.5569, label: "Osogbo" },
  { lat: 6.2104, lng: 7.0741, label: "Onitsha" },
  { lat: 4.9589, lng: 8.3269, label: "Calabar" },
  { lat: 5.6037, lng: -0.187, label: "Accra" },
  { lat: 1.2921, lng: 36.8219, label: "Nairobi" },
  { lat: -26.2041, lng: 28.0473, label: "Johannesburg" },
  { lat: 25.2048, lng: 55.2708, label: "Dubai" },
  { lat: 51.5072, lng: -0.1276, label: "London" },
  { lat: 52.52, lng: 13.405, label: "Berlin" },
  { lat: 40.7128, lng: -74.006, label: "New York" },
  { lat: 43.6532, lng: -79.3832, label: "Toronto" },
];

const R = 6371; // km
export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function formatDistance(km: number) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${km.toFixed(1)}km`;
}

// Rough ETA assuming 25km/h average urban transit
export function etaMinutes(km: number) {
  return Math.max(2, Math.round((km / 25) * 60));
}

export const CATEGORY_META: Record<Job["category"], { label: string; icon: LucideIcon }> = {
  cleaning: { label: "Cleaning", icon: Sparkles },
  delivery: { label: "Delivery", icon: Truck },
  electrical: { label: "Electrical", icon: Zap },
  plumbing: { label: "Plumbing", icon: Wrench },
  moving: { label: "Moving", icon: Package },
  creative: { label: "Creative", icon: Palette },
  handyman: { label: "Handyman", icon: Hammer },
  other: { label: "Other", icon: BriefcaseBusiness },
};

export const CATEGORY_SURFACE: Record<JobCategory, string> = {
  cleaning: "from-sky-500/90 to-cyan-400/80",
  delivery: "from-orange-500/90 to-amber-400/80",
  electrical: "from-yellow-400/90 to-orange-500/90",
  plumbing: "from-emerald-500/90 to-teal-400/80",
  moving: "from-fuchsia-500/90 to-rose-400/80",
  creative: "from-violet-500/90 to-pink-400/80",
  handyman: "from-indigo-500/90 to-blue-500/80",
  other: "from-slate-700/90 to-slate-500/80",
};

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString()}`;
}

export const JOB_POST_FEE_NGN = 5000;
export const PLATFORM_FEE_RATE = 0.015;

export function resolveArea(label?: string | null) {
  if (!label) return DEFAULT_LOCATION;
  return AREA_OPTIONS.find((area) => area.label === label) ?? DEFAULT_LOCATION;
}

export function nearestArea(point: { lat: number; lng: number }) {
  return AREA_OPTIONS
    .map((area) => ({ ...area, km: haversineKm(point, area) }))
    .sort((a, b) => a.km - b.km)[0];
}

export function getJobCoordinates(job: Pick<Job, "latitude" | "longitude">) {
  return { lat: Number(job.latitude), lng: Number(job.longitude) };
}

export function enrichJob(job: Job, center = DEFAULT_LOCATION) {
  const km = haversineKm(center, getJobCoordinates(job));
  return {
    ...job,
    km,
    etaMin: etaMinutes(km),
    categoryMeta: CATEGORY_META[job.category],
    priorityScore: Math.round(Math.max(0, 30 - km) * 100 + job.budget_ngn / 250),
  };
}

export function accountSupportsRole(accountType: AccountType, role: AppRole) {
  return accountType === role;
}

export function profileSkills(profile: Profile) {
  return (profile.skills ?? []).filter(Boolean);
}

export function getProfileCoordinates(profile: Pick<Profile, "city">) {
  const maybeLatitude = "latitude" in profile ? Number(profile.latitude) : NaN;
  const maybeLongitude = "longitude" in profile ? Number(profile.longitude) : NaN;
  if (Number.isFinite(maybeLatitude) && Number.isFinite(maybeLongitude)) {
    return {
      lat: maybeLatitude,
      lng: maybeLongitude,
      label: profile.city ?? nearestArea({ lat: maybeLatitude, lng: maybeLongitude }).label,
    };
  }
  const area = resolveArea(profile.city);
  return { lat: area.lat, lng: area.lng, label: area.label };
}

export type MatchedWorker = Profile & {
  km: number;
  etaMin: number;
  locationLabel: string;
  matchingSkills: string[];
};

export function matchWorkers(
  profiles: Profile[],
  target: { label?: string | null; lat: number; lng: number },
  category?: JobCategory,
  limit = 5,
) {
  const categoryLabel = category ? CATEGORY_META[category].label.toLowerCase() : "";

  return profiles
    .filter((profile) => accountSupportsRole(profile.account_type, "worker"))
    .map((profile) => {
      const location = getProfileCoordinates(profile);
      const km = haversineKm({ lat: target.lat, lng: target.lng }, location);
      const matchingSkills = profileSkills(profile).filter((skill) =>
        categoryLabel ? skill.toLowerCase().includes(categoryLabel) : true,
      );
      const score = Number(profile.behavior_score) * 20 - km * 3 + matchingSkills.length * 8;

      return {
        ...profile,
        km,
        etaMin: etaMinutes(km),
        locationLabel: location.label,
        matchingSkills,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score: _score, ...worker }) => worker);
}

export function rankJobsForUser(jobs: Job[], center = DEFAULT_LOCATION) {
  return jobs
    .map((job) => enrichJob(job, center))
    .sort((a, b) => b.priorityScore - a.priorityScore || a.km - b.km || b.budget_ngn - a.budget_ngn);
}

export function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeSearchQuery(query: string) {
  return normalizeSearchText(query)
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
}

export function getJobSearchText(job: Pick<Job, "title" | "description" | "location_label" | "category">) {
  return normalizeSearchText(
    [
      job.title,
      job.description ?? "",
      job.location_label,
      CATEGORY_META[job.category].label,
    ].join(" "),
  );
}

export function matchesAllSearchTerms(job: Pick<Job, "title" | "description" | "location_label" | "category">, query: string) {
  const parts = tokenizeSearchQuery(query);
  if (!parts.length) return true;

  const words = new Set(getJobSearchText(job).split(" ").filter(Boolean));
  return parts.every((part) => words.has(part));
}

export function groupJobsByCategory<T extends Pick<Job, "category">>(jobs: T[]) {
  return jobs.reduce<Record<JobCategory, T[]>>(
    (acc, job) => {
      acc[job.category].push(job);
      return acc;
    },
    {
      cleaning: [],
      delivery: [],
      electrical: [],
      plumbing: [],
      moving: [],
      creative: [],
      handyman: [],
      other: [],
    },
  );
}
