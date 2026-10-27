import { useEffect, useState } from "react";

export const SiteCursor = () => {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(pointer: fine)");
    const updateEnabled = () => setEnabled(media.matches);
    updateEnabled();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateEnabled);
    } else if (typeof media.addListener === "function") {
      media.addListener(updateEnabled);
    }

    const onMove = (event: MouseEvent) => {
      setVisible(true);
      setPosition({ x: event.clientX, y: event.clientY });
      const target = event.target as HTMLElement | null;
      setInteractive(Boolean(target?.closest("a, button, [role='button'], input, textarea, select")));
    };

    const onLeave = () => setVisible(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", updateEnabled);
      } else if (typeof media.removeListener === "function") {
        media.removeListener(updateEnabled);
      }

      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        className={`site-cursor-ring ${visible ? "is-visible" : ""} ${interactive ? "is-interactive" : ""}`}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
      <div
        className={`site-cursor-dot ${visible ? "is-visible" : ""} ${interactive ? "is-interactive" : ""}`}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      />
    </>
  );
};
