import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useGeolocation } from "@/hooks/use-geolocation";
import { AppShell } from "@/components/gigclose/AppShell";
import { Button } from "@/components/ui/button";
import { CategoryIcon } from "@/components/gigclose/CategoryIcon";
import { CATEGORY_META, etaMinutes, formatDistance, formatNaira, haversineKm, Job } from "@/lib/gigs";
import { Bookmark, Clock, MapPin, Search } from "lucide-react";

const Saved = () => {
  const { user } = useAuth();
  const { location } = useGeolocation();
  const { data, isLoading } = useQuery({
    queryKey: ["saved-list", user?.id],
    queryFn: async () => { const { data, error } = await supabase.from("saved_gigs").select("job_id, jobs(*)").eq("user_id", user!.id); if (error) throw error; return (data || []).map((r) => r.jobs as Job).filter(Boolean); },
    enabled: !!user,
  });

  return (
    <AppShell>
      <div className="container max-w-5xl py-6">
        <div className="gig-page-hero signed-in-hero--gray mb-5 flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
          <div>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Saved Gigs</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">Keep promising work close while you compare distance, ETA, and pay.</p>
          </div>
          <div className="gig-stat-tile p-4">
            <div className="text-xs text-muted-foreground">Saved</div>
            <div className="font-display text-3xl font-bold text-foreground">{data?.length ?? 0}</div>
          </div>
        </div>
        <div className="space-y-2">
          {isLoading && <p className="text-muted-foreground">Loading...</p>}
          {data?.length === 0 && (
            <div className="gig-panel border-dashed p-10 text-center">
              <Bookmark className="h-10 w-10 mx-auto text-muted-foreground/30" />
              <p className="mt-3 text-muted-foreground">No saved gigs yet.</p>
              <Link to="/app/explore"><Button className="mt-3 gap-2" size="sm"><Search className="h-4 w-4" /> Browse gigs</Button></Link>
            </div>
          )}
          {data?.map((job) => {
            const km = haversineKm(location, { lat: Number(job.latitude), lng: Number(job.longitude) });
            const cat = CATEGORY_META[job.category];
            return (
              <Link key={job.id} to={`/app/jobs/${job.id}`} className="gig-panel gig-panel-interactive flex items-center gap-3 p-4">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><CategoryIcon category={job.category} className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{job.title}</div>
                  <div className="text-xs text-muted-foreground flex gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{formatDistance(km)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{etaMinutes(km)}m</span>
                  </div>
                </div>
                <div className="font-bold text-primary text-sm">{formatNaira(job.budget_ngn)}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
};

export default Saved;
