import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  // Public routes that should never trigger /auth redirect
  const publicRoutes = ["/", "/landing"];
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If it's a public route, always allow access
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, redirect to /auth if user is not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
