import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CATEGORY_META, Job, formatDistance, formatNaira } from "@/lib/gigs";

type DiscoveryJob = Job & { km: number; etaMin: number };

const buildIcon = (Icon: typeof CATEGORY_META[Job["category"]]["icon"], urgent: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width:38px;height:38px;border-radius:999px;
      background:${urgent ? "hsl(32 95% 50%)" : "hsl(224 100% 58%)"};
      color:#fff;display:grid;place-items:center;
      box-shadow:0 10px 30px rgba(15,23,42,.22),0 0 0 3px rgba(255,255,255,.92);">${renderToStaticMarkup(createElement(Icon, { size: 18, strokeWidth: 2.25 }))}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });

const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:22px;height:22px;">
    <div style="position:absolute;inset:0;border-radius:999px;background:hsl(224 100% 58%);box-shadow:0 0 0 7px hsl(224 100% 58% / .18),0 0 0 14px hsl(224 100% 58% / .08);"></div>
    <div style="position:absolute;inset:6px;border-radius:999px;background:#fff;"></div>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const Recenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);

  return null;
};

type DiscoveryMapProps = {
  center: [number, number];
  radiusKm: number;
  jobs: DiscoveryJob[];
  centerLabel: string;
  getJobHref: (job: DiscoveryJob) => string;
};

const DiscoveryMap = ({ center, radiusKm, jobs, centerLabel, getJobHref }: DiscoveryMapProps) => {
  return (
    <div className="h-[360px] overflow-hidden rounded-[28px] border border-border bg-card shadow-card lg:h-[560px]">
      <MapContainer center={center} zoom={12} scrollWheelZoom className="h-full w-full">
        <Recenter center={center} />
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Marker position={center} icon={userIcon}>
          <Popup>{centerLabel}</Popup>
        </Marker>
        <Circle center={center} radius={radiusKm * 1000} pathOptions={{ color: "hsl(224 100% 58%)", fillOpacity: 0.08, weight: 1.4 }} />
        {jobs.map((job) => (
          <Marker
            key={job.id}
            position={[Number(job.latitude), Number(job.longitude)]}
            icon={buildIcon(CATEGORY_META[job.category].icon, job.urgent)}
          >
            <Popup>
              <div className="space-y-1.5 text-sm">
                <div className="font-semibold">{job.title}</div>
                <div className="text-xs text-muted-foreground">
                  {CATEGORY_META[job.category].label} · {job.location_label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistance(job.km)} away · {job.etaMin} min ETA
                </div>
                <div className="font-bold text-primary">{formatNaira(job.budget_ngn)}</div>
                <Link to={getJobHref(job)} className="text-xs font-semibold text-primary underline underline-offset-4">
                  Open details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DiscoveryMap;
