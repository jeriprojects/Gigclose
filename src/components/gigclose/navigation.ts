import {
  Briefcase,
  CircleHelp,
  Compass,
  Info,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Shield,
  Sparkles,
  Wallet,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AppRole } from "@/lib/gigs";

export type NavigationItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
};

export const publicNavItems: NavigationItem[] = [
  { to: "/", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/how-it-works", label: "How It Works", icon: CircleHelp },
  { to: "/about", label: "About", icon: Info },
  { to: "/contact", label: "Contact", icon: Mail },
];

export const getAppNavItems = (role: AppRole | undefined, isAdmin = false): NavigationItem[] => {
  const baseNavItems: NavigationItem[] = role === "client"
    ? [
        { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
        { to: "/app/explore", label: "Explore", icon: Compass },
        { to: "/app/post", label: "Post", icon: Zap },
        { to: "/app/jobs", label: "Jobs", icon: Briefcase },
        { to: "/app/messages", label: "Chat", icon: MessageSquare },
        { to: "/app/wallet", label: "Wallet", icon: Wallet },
      ]
    : [
        { to: "/app", label: "Home", icon: Zap, end: true },
        { to: "/app/automatch", label: "AutoMatch", icon: Sparkles },
        { to: "/app/explore", label: "Explore", icon: Compass },
        { to: "/app/jobs", label: "Jobs", icon: Briefcase },
        { to: "/app/messages", label: "Chat", icon: MessageSquare },
        { to: "/app/wallet", label: "Wallet", icon: Wallet },
      ];

  return isAdmin
    ? [...baseNavItems, { to: "/app/admin", label: "Admin", icon: Shield }]
    : baseNavItems;
};
