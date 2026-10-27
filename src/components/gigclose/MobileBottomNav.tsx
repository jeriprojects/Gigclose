import { NavLink, useLocation } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { getAppNavItems, publicNavItems } from "@/components/gigclose/navigation";

export const MobileBottomNav = () => {
  const location = useLocation();
  const { data: profile } = useCurrentProfile();
  const isAppPage = location.pathname === "/app" || location.pathname.startsWith("/app/");
  const items = isAppPage
    ? getAppNavItems(profile?.account_type, profile?.is_admin)
    : publicNavItems;

  return createPortal(
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-[9999] flex h-16 w-full items-center justify-start overflow-x-auto border-t border-[#C7C4D8] bg-white px-1 shadow-[0px_-4px_10px_rgba(0,0,0,0.08)] lg:hidden"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className="flex h-full min-w-[4.25rem] flex-1 flex-col items-center justify-center px-0.5"
          >
            {({ isActive }) => (
              <div
                className={`inline-flex max-w-full flex-col items-center justify-center rounded-full px-1.5 py-1 transition-all ${
                  isActive ? "bg-[#D0E1FB] text-[#54647A]" : "text-[#464555]"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="max-w-full truncate font-sans text-[10px] font-medium leading-4">
                  {item.label}
                </span>
              </div>
            )}
          </NavLink>
        );
      })}
    </nav>,
    document.body
  );
};