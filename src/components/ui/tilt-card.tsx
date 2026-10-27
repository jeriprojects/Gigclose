import { ReactNode, useRef } from "react";
import { cn } from "@/lib/utils";

export const TiltCard = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node || window.matchMedia("(pointer: coarse)").matches) return;
    const rect = node.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 12;
    const rotateX = (0.5 - py) * 12;
    node.style.setProperty("--tilt-x", `${rotateX}deg`);
    node.style.setProperty("--tilt-y", `${rotateY}deg`);
    node.style.setProperty("--glow-x", `${px * 100}%`);
    node.style.setProperty("--glow-y", `${py * 100}%`);
  };

  const reset = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <div
      ref={ref}
      className={cn("tilt-card", className)}
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </div>
  );
};
