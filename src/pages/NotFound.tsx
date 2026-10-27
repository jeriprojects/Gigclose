import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Compass, Home as HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/gigclose/Logo";

const NotFound = () => {
  const location = useLocation();
  useEffect(() => { console.error("404:", location.pathname); }, [location.pathname]);

  return (
    <div className="gig-grid-surface min-h-screen p-3">
      <header className="container relative z-10 flex h-16 items-center justify-between rounded-full border border-slate-200 bg-white px-3 shadow-[0_22px_70px_-48px_rgba(15,23,42,0.35)] sm:px-5">
        <Link to="/" className="rounded-full px-1"><Logo /></Link>
        <Link to="/explore"><Button size="sm" className="rounded-full">Explore jobs</Button></Link>
      </header>
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center py-8">
        <div className="gig-page-hero max-w-xl p-12 text-center">
          <p className="gig-eyebrow">Lost route</p>
          <h1 className="mt-3 font-display text-7xl font-bold text-gradient-primary">404</h1>
          <p className="mt-4 text-muted-foreground">This page does not exist, but the marketplace is still moving.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/"><Button className="rounded-full gap-2"><HomeIcon className="h-4 w-4" /> Go home</Button></Link>
            <Link to="/explore"><Button variant="outline" className="rounded-full gap-2"><Compass className="h-4 w-4" /> Browse jobs</Button></Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
