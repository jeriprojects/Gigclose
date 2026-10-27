import { ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const Parallax = ({
  children,
  className,
  speed = 0.12,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const update = () => {
      const rect = node.getBoundingClientRect();
      const viewportMid = window.innerHeight / 2;
      const elementMid = rect.top + rect.height / 2;
      const delta = (elementMid - viewportMid) * speed;
      node.style.setProperty("--parallax-y", `${delta}px`);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [speed]);

  return (
    <div ref={ref} className={cn("parallax-layer", className)}>
      {children}
    </div>
  );
};
