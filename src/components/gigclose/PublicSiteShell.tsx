import { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/gigclose/Footer";
import { Logo } from "@/components/gigclose/Logo";
import { MobileBottomNav } from "@/components/gigclose/MobileBottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileMenu } from "@/components/gigclose/UserProfileMenu";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { publicNavItems } from "@/components/gigclose/navigation";

export const PublicSiteShell = ({ children, showFooter = true }: { children: ReactNode; showFooter?: boolean }) => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const clientAuthHref = "/auth?role=client&redirect=/app/post";
  const postJobHref = user && profile?.account_type === "client" ? "/app/post" : clientAuthHref;

  return (
    <div className="site-radial-background min-h-screen text-foreground">
      <header className="sticky top-0 z-50 bg-background py-2 shadow-none backdrop-blur-xl">
        <div className="container">
          <div className="flex min-h-12 items-center justify-between gap-3 bg-transparent px-0 py-1 sm:min-h-14">
            <Link
              to="/"
              className="flex min-w-0 items-center rounded-[8px] px-1 py-1 text-slate-950 transition"
              aria-label="Go to homepage"
            >
              <Logo size={36} />
            </Link>

            <nav
              className="hidden items-center gap-7 text-black lg:flex"
            >
              {publicNavItems.map((item) => (
                <NavLink key={`${item.label}-${item.to}`} to={item.to} end={item.end}
                  className={({ isActive }) =>
                    `text-sm font-extrabold transition ${
                      isActive
                        ? "text-[#6787fe]"
                        : "text-slate-800 hover:text-[#6787fe]"
                    }`
                  }>
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              {user ? (
                <UserProfileMenu />
              ) : (
                <>
                  <Link to="/auth">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden rounded-[6px] px-4 text-sm font-extrabold text-slate-800 hover:bg-slate-50 hover:text-[#6787fe] sm:inline-flex"
                    >
                      Log In
                    </Button>
                  </Link>
                  <Link to="/auth?role=worker&redirect=/app">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden rounded-[6px] px-4 text-sm font-extrabold text-slate-800 hover:bg-slate-50 hover:text-[#6787fe] lg:inline-flex"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              <Link to={user ? "/app/messages" : "/auth"} aria-label="Notifications">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-[6px] h-9 w-9 text-slate-800 hover:bg-slate-100"
                >
                  <Bell className="h-5 w-5 text-[#464555]" />
                </Button>
              </Link>
              {user && profileLoading ? (
                <Button
                  disabled
                  size="sm"
                  className="rounded-[6px] bg-[#0081FF] px-3 text-xs font-extrabold text-white shadow-[0_14px_32px_-22px_rgba(0,129,255,0.95)] hover:bg-[#006fdc] sm:px-5 sm:text-sm"
                >
                  <span className="sm:hidden">Post</span>
                  <span className="hidden sm:inline">Post a Job</span>
                </Button>
              ) : (
                <Link to={postJobHref}>
                  <Button
                    size="sm"
                    className="rounded-[6px] bg-[#0081FF] px-3 text-xs font-extrabold text-white shadow-[0_14px_32px_-22px_rgba(0,129,255,0.95)] hover:bg-[#006fdc] sm:px-5 sm:text-sm"
                  >
                    <span className="sm:hidden">Post</span>
                    <span className="hidden sm:inline">Post a Job</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="h-3 bg-gradient-to-b from-transparent to-background" />
      <main className="pb-16 lg:pb-0">{children}</main>
      {showFooter && <Footer />}
      <MobileBottomNav />
    </div>
  );
};
