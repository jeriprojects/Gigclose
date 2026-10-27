import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const PageTransitionShell = ({ children }: { children: ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div key={location.pathname} className="page-transition-shell">
      {children}
    </div>
  );
};
