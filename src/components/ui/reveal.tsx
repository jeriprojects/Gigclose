import { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "fade-up" | "fade-left" | "fade-right" | "zoom" | "blur";

export const Reveal = ({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  once = true,
  threshold = 0.12,
  style,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  once?: boolean;
  threshold?: number;
  style?: React.CSSProperties;
}) => {
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
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      className={cn("reveal-base", `reveal-${variant}`, visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
};
