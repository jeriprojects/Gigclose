import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LazySectionProps = {
  children: ReactNode;
  className?: string;
  minHeight?: number;
  rootMargin?: string;
  skeletonClassName?: string;
};

export const LazySection = ({
  children,
  className = "",
  minHeight = 120,
  rootMargin = "180px",
  skeletonClassName = "",
}: LazySectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={cn("transition-all duration-700", visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0", className)}>
      {visible ? (
        children
      ) : (
        <div
          style={{ minHeight }}
          className={cn("overflow-hidden rounded-[28px] border border-border/60 bg-card/80 p-5", skeletonClassName)}
        >
          <div className="space-y-3">
            <div className="h-3 w-24 rounded-full bg-muted animate-pulse" />
            <div className="h-8 w-2/3 rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-full rounded-full bg-muted animate-pulse" />
            <div className="h-4 w-5/6 rounded-full bg-muted animate-pulse" />
            <div className="grid gap-3 pt-3 sm:grid-cols-3">
              <div className="h-20 rounded-2xl bg-muted animate-pulse" />
              <div className="h-20 rounded-2xl bg-muted animate-pulse" />
              <div className="h-20 rounded-2xl bg-muted animate-pulse" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
