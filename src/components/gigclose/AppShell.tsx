import { Link, NavLink } from "react-router-dom";
import { Logo } from "@/components/gigclose/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { UserProfileMenu } from "@/components/gigclose/UserProfileMenu";
import { getAppNavItems } from "@/components/gigclose/navigation";
import { ActiveHireBanner } from "@/components/gigclose/ActiveHireBanner";
import { Footer } from "@/components/gigclose/Footer";
import { MobileBottomNav } from "@/components/gigclose/MobileBottomNav";

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { data: profile } = useCurrentProfile();
  const role = profile?.account_type;
  const postJobHref = user && role === "worker"
    ? "/auth?role=client&redirect=/app/post"
    : "/app/post";

  const navItems = getAppNavItems(role, profile?.is_admin);

  return (
    <div className="site-radial-background min-h-screen text-foreground">
      <header className="sticky top-0 z-50 bg-background/85 py-2 backdrop-blur-xl lg:!mx-0 lg:!mt-0">
        <div className="container">
          <div className="flex min-h-12 items-center justify-between gap-3 bg-transparent px-0 py-1 sm:min-h-14">
            <Link to="/app" className="flex min-w-0 items-center rounded-[8px] px-1 py-1 text-slate-950 transition" aria-label="Open dashboard">
              <Logo size={36} />
            </Link>
            <nav className="hidden items-center gap-5 text-black lg:flex">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-1.5 text-sm font-extrabold transition ${isActive ? "text-[#6787fe]" : "text-slate-800 hover:text-[#6787fe]"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {user && <UserProfileMenu />}
              <Link to={postJobHref}>
                <Button size="sm" className="rounded-[6px] bg-[#0081FF] px-3 text-xs font-extrabold text-white shadow-[0_14px_32px_-22px_rgba(0,129,255,0.95)] hover:bg-[#006fdc] sm:px-5 sm:text-sm">
                  <span className="sm:hidden">Post</span>
                  <span className="hidden sm:inline">Post a Job</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>
      <ActiveHireBanner />

      <main className="pb-16 lg:pb-0">{children}</main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
};
