import { useMemo } from "react";
import { Globe, MapPin, Navigation, RotateCcw } from "lucide-react";
import { CATEGORY_META, type JobCategory } from "@/lib/gigs";
import {
  ANY,
  COUNTRIES,
  DEFAULT_LOCATION_FILTER,
  findArea,
  findCountry,
  findLga,
  findState,
  type LocationFilter,
} from "@/lib/locations";

type Props = {
  value: LocationFilter;
  onChange: (next: LocationFilter) => void;
  radius: number;
  onRadiusChange: (km: number) => void;
  radii?: number[];
  category: JobCategory | "all";
  onCategoryChange: (value: JobCategory | "all") => void;
  query: string;
  onQueryChange: (value: string) => void;
};

export const LocationFilters = ({
  value,
  onChange,
  radius,
  onRadiusChange,
  radii = [1, 5, 10],
  category,
  onCategoryChange,
  query,
  onQueryChange,
}: Props) => {
  const country = useMemo(() => findCountry(value.country), [value.country]);
  const state = useMemo(() => (value.state !== ANY ? findState(country, value.state) : undefined), [country, value.state]);
  const lga = useMemo(() => (value.lga !== ANY ? findLga(state, value.lga) : undefined), [state, value.lga]);
  const area = useMemo(() => (value.area !== ANY ? findArea(lga, value.area) : undefined), [lga, value.area]);

  const reset = () => onChange({ ...DEFAULT_LOCATION_FILTER });
  const isCustom =
    value.state !== ANY ||
    value.lga !== ANY ||
    value.area !== ANY ||
    value.busStop !== ANY ||
    value.country !== DEFAULT_LOCATION_FILTER.country;

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary">
          <Navigation className="h-3.5 w-3.5" /> Radius
        </span>
        {radii.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRadiusChange(value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              radius === value
                ? "bg-primary text-primary-foreground shadow-glow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {value}km
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> Live
        </span>
      </div>

      <div className="mt-3">
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by job title, bus stop, area, or category…"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Search jobs"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-6">
        <Select
          icon={<Globe className="h-3.5 w-3.5" />}
          label="Country"
          value={value.country}
          onChange={(v) => onChange({ ...DEFAULT_LOCATION_FILTER, country: v })}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          label="State"
          value={value.state}
          onChange={(v) => onChange({ ...value, state: v, lga: ANY, area: ANY, busStop: ANY })}
        >
          <option value={ANY}>Any state</option>
          {country.states.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select
          label="LGA"
          value={value.lga}
          onChange={(v) => onChange({ ...value, lga: v, area: ANY, busStop: ANY })}
          disabled={!state}
        >
          <option value={ANY}>{state ? "Any LGA" : "Select state first"}</option>
          {state?.lgas.map((l) => (
            <option key={l.name} value={l.name}>
              {l.name}
            </option>
          ))}
        </Select>

        <Select
          label="Area"
          value={value.area}
          onChange={(v) => onChange({ ...value, area: v, busStop: ANY })}
          disabled={!lga}
        >
          <option value={ANY}>{lga ? "Any area" : "Select LGA first"}</option>
          {lga?.areas.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </Select>

        <Select
          label="Bus stop"
          value={value.busStop}
          onChange={(v) => onChange({ ...value, busStop: v })}
          disabled={!area}
        >
          <option value={ANY}>{area ? "Any bus stop" : "Select area first"}</option>
          {area?.busStops?.map((stop) => (
            <option key={stop} value={stop}>
              {stop}
            </option>
          ))}
        </Select>

        <Select
          label="Job type"
          value={category}
          onChange={(value) => onCategoryChange(value as JobCategory | "all")}
        >
          <option value="all">All job types</option>
          {Object.entries(CATEGORY_META).map(([key, meta]) => (
            <option key={key} value={key}>
              {meta.label}
            </option>
          ))}
        </Select>
      </div>

      {isCustom && (
        <div className="mt-3 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            Filtering: {[value.busStop, value.area, value.lga, value.state, country.name]
              .filter((part) => part && part !== ANY)
              .join(" · ")}
          </span>
          <button
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 font-semibold text-primary hover:bg-primary/10"
          >
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      )}
    </div>
  );
};

const Select = ({
  icon,
  label,
  value,
  onChange,
  children,
  disabled,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <label className="block">
    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1">
      {icon}
      {label}
    </span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-xs disabled:opacity-50"
    >
      {children}
    </select>
  </label>
);
