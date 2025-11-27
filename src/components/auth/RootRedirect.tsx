import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * RootRedirect component handles the root (/) route logic:
 * - Checks for authToken and lastLogin in localStorage
 * - If both exist and lastLogin is within 7 days, redirects to /dashboard
 * - Otherwise, renders the landing page content at / (URL stays as /)
 */
export const RootRedirect = () => {
  const navigate = useNavigate();
  const [shouldShowLanding, setShouldShowLanding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = () => {
      const authToken = localStorage.getItem("authToken");
      const lastLogin = localStorage.getItem("lastLogin");

      // Check if both token and lastLogin exist
      if (authToken && lastLogin) {
        const lastLoginTime = parseInt(lastLogin, 10);
        const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        const now = Date.now();
        const timeSinceLogin = now - lastLoginTime;

        // If lastLogin is within the last 7 days, redirect to dashboard
        if (timeSinceLogin < sevenDaysInMs && timeSinceLogin >= 0) {
          navigate("/dashboard", { replace: true });
          return;
        }
      }

      // Otherwise, show landing page at / (URL stays as /)
      setShouldShowLanding(true);
      setIsChecking(false);
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // If checking, show loading state
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page in iframe to keep URL as /
  if (shouldShowLanding) {
    return (
      <iframe
        src="/landing/index.html"
        className="w-full h-screen border-0"
        title="Landing Page"
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
      />
    );
  }

  return null;
};

