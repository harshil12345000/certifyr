import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * RootRedirect component handles the root (/) route logic:
 * - Checks for actual Supabase session (not localStorage)
 * - If valid session exists, redirects to /dashboard
 * - Otherwise, renders the landing page content at / (URL stays as /)
 */
export const RootRedirect = () => {
  const navigate = useNavigate();
  const [shouldShowLanding, setShouldShowLanding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // Clear any stale tokens
          localStorage.removeItem("authToken");
          localStorage.removeItem("lastLogin");
          setShouldShowLanding(true);
          setIsChecking(false);
          return;
        }
        
        // Valid session exists, redirect to dashboard
        navigate("/dashboard", { replace: true });
      } catch (e) {
        console.error("Error checking session:", e);
        // On error, show landing and clear stale data
        localStorage.removeItem("authToken");
        localStorage.removeItem("lastLogin");
        setShouldShowLanding(true);
        setIsChecking(false);
      }
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

