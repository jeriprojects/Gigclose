import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageLoader } from "@/components/ui/page-loader";
import { useCurrentProfile } from "@/hooks/use-current-profile";
import { AppRole } from "@/lib/gigs";

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: AppRole[];
  requireAdmin?: boolean;
};

export const ProtectedRoute = ({ children, allowedRoles, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();

  if (loading) {
    return <PageLoader label="Checking your session..." />;
  }

  if (!user) {
    const roleHint = allowedRoles?.length === 1 ? `&role=${allowedRoles[0]}` : "";
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}${roleHint}`} replace />;
  }

  if (profileLoading) {
    return <PageLoader label="Loading your access..." />;
  }

  if (requireAdmin && !profile?.is_admin) {
    return <Navigate to={`/admin/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRoles?.length && (!profile || !allowedRoles.includes(profile.account_type as AppRole))) {
    return <Navigate to="/app" replace />;
  }

  if (profile?.is_suspended) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
