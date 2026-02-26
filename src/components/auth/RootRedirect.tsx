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
      // Check for Supabase auth hash fragments (invite, recovery, signup, magiclink)
      // These arrive when an invited admin clicks the email link
      if (window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        if (accessToken && type) {
          // Preserve the hash and redirect to auth/confirm for processing
          navigate(`/auth/confirm${window.location.hash}`, { replace: true });
          return;
        }
      }

      // Check for query-based auth params (token, token_hash, code)
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('token') || searchParams.get('token_hash') || searchParams.get('code')) {
        navigate(`/auth/confirm${window.location.search}${window.location.hash}`, { replace: true });
        return;
      }

      const authToken = localStorage.getItem("authToken");
      const lastLogin = localStorage.getItem("lastLogin");

      if (authToken && lastLogin) {
        const lastLoginTime = parseInt(lastLogin, 10);
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        const timeSinceLogin = now - lastLoginTime;

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

