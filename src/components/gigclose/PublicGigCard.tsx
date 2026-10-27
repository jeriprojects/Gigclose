import heroCity from "@/assets/hero-city.jpg";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/gigclose/CategoryIcon";
import { CATEGORY_META, CATEGORY_SURFACE, Job, formatDistance, formatNaira } from "@/lib/gigs";
import { MapPin } from "lucide-react";

type PublicGigCardProps = {
  job: Job & { km: number; etaMin: number };
  href: string;
};

export const PublicGigCard = ({ job, href }: PublicGigCardProps) => {
  const category = CATEGORY_META[job.category];

  return (
    <article className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card surface-hover">
      <div className="relative h-44 overflow-hidden">
        <img src={heroCity} alt={job.title} className="h-full w-full object-cover" />
        <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_SURFACE[job.category]} mix-blend-multiply opacity-90`} />
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          <CategoryIcon category={job.category} className="h-3.5 w-3.5" />
          {category.label}
        </div>
        {job.urgent && (
          <div className="absolute right-4 top-4 rounded-full bg-warning px-3 py-1 text-xs font-bold uppercase text-warning-foreground">
            Urgent
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-2xl font-bold text-white">{formatNaira(job.budget_ngn)}</div>
          <div className="text-xs text-white/80">{job.etaMin} min ETA</div>
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-display text-2xl font-bold leading-tight">{job.title}</h3>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary px-3 py-1">{category.label}</span>
          <span className="rounded-full bg-secondary px-3 py-1">{formatDistance(job.km)} away</span>
          <span className="rounded-full bg-secondary px-3 py-1">{job.location_label}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            {job.location_label}
          </div>
          <Link to={href}>
            <Button className="rounded-full">View job</Button>
          </Link>
        </div>
      </div>
    </article>
  );
};
