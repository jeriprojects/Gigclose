import { ChevronDown, LayoutDashboard, LogOut, Settings, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const UserProfileMenu = () => {
  const { user, signOut } = useAuth();
  const { data: profile } = useCurrentProfile();

  if (!user) return null;

  const displayName =
    profile?.display_name?.trim() ||
    user.user_metadata?.display_name?.trim() ||
    user.email?.split("@")[0] ||
    "Account";
  const firstName = displayName.split(/\s+/)[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Open ${firstName}'s account menu`}
          className="h-9 max-w-full gap-2 rounded-[6px] px-2 text-sm font-extrabold text-slate-800 hover:bg-slate-100 hover:text-[#6787fe] sm:px-3"
        >
          <UserRound className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="max-w-20 truncate sm:max-w-32">{firstName}</span>
          <ChevronDown className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem asChild>
          <Link to="/app">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
