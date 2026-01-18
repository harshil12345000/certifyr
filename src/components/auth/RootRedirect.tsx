import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// External Framer landing page URL
const FRAMER_LANDING_URL = "https://certifyr.framer.website/";

/**
 * RootRedirect component handles the root (/) route logic:
 * - Checks for authToken and lastLogin in localStorage
 * - If both exist and lastLogin is within 7 days, redirects to /dashboard
 * - Otherwise, redirects to the external Framer landing page
 */
export const RootRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const authToken = localStorage.getItem("authToken");
      const lastLogin = localStorage.getItem("lastLogin");

      // Check if both token and lastLogin exist
      if (authToken && lastLogin) {
        const lastLoginTime = parseInt(lastLogin, 10);
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const timeSinceLogin = now - lastLoginTime;

        // If lastLogin is within the last 7 days, redirect to dashboard
        if (timeSinceLogin < sevenDaysInMs && timeSinceLogin >= 0) {
          navigate("/dashboard", { replace: true });
          return;
        }
      }

      // Otherwise, redirect to external Framer landing page
      window.location.href = FRAMER_LANDING_URL;
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

