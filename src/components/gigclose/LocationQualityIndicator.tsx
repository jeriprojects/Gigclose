import { Crosshair, Loader2, MapPin } from "lucide-react";
import { useGeolocation, LocationQuality } from "@/hooks/use-geolocation";
import { cn } from "@/lib/utils";

const QUALITY_META: Record<LocationQuality, { label: string; dot: string; text: string }> = {
  excellent: { label: "Excellent", dot: "bg-success", text: "text-success" },
  good: { label: "Good", dot: "bg-success/80", text: "text-success" },
  fair: { label: "Fair", dot: "bg-warning", text: "text-warning" },
  poor: { label: "Low", dot: "bg-destructive", text: "text-destructive" },
  unknown: { label: "Approximate", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

export const LocationQualityIndicator = ({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) => {
  const { location, status, request } = useGeolocation();
  const quality = location.quality ?? "unknown";
  const meta = QUALITY_META[quality];
  const accuracy = location.accuracy ? `±${Math.round(location.accuracy)}m` : null;
  const isPrompting = status === "prompting";

  return (
    <button
      type="button"
      onClick={request}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:border-primary/40 transition-colors",
        className,
      )}
      title="Refresh location"
    >
      {isPrompting ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
      ) : (
        <span className="relative flex h-2 w-2">
          <span className={cn("absolute inset-0 rounded-full opacity-60 animate-ping", meta.dot)} />
          <span className={cn("relative h-2 w-2 rounded-full", meta.dot)} />
        </span>
      )}
      <MapPin className="h-3.5 w-3.5 text-primary" />
      <span className={cn("text-foreground", textClassName)}>{location.label}</span>
      <span className={cn("hidden sm:inline", meta.text, textClassName)}>· {meta.label}</span>
      {accuracy && <span className={cn("hidden md:inline text-muted-foreground", textClassName)}>{accuracy}</span>}
      <Crosshair className="h-3 w-3 text-muted-foreground" />
    </button>
  );
};
