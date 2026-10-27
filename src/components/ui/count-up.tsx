import { useEffect, useRef, useState } from "react";

export const CountUp = ({
  value,
  duration = 1400,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) => {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let started = false;

    const run = () => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / duration, 1);
        setDisplay(value * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started) {
        started = true;
        run();
        observer.disconnect();
      }
    }, { threshold: 0.3 });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration, value]);

  return <span ref={ref}>{`${prefix}${display.toFixed(decimals)}${suffix}`}</span>;
};
