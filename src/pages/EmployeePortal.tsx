import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePortalAuth } from "@/components/employee-portal/EmployeePortalAuth";
import { EmployeePortalDashboard } from "@/components/employee-portal/EmployeePortalDashboard";
import { EmployeePortalProvider } from "@/contexts/EmployeePortalContext";
import { EmployeePortalSkeleton } from "@/components/employee-portal/EmployeePortalSkeleton";

export default function EmployeePortal() {
  const { slug, orgId } = useParams<{ slug?: string; orgId?: string }>();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [portalSettings, setPortalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);

  // Resolve slug to organization ID, or use orgId directly for legacy URLs
  useEffect(() => {
    const resolveIdentifier = async () => {
      // If orgId is provided (legacy URL format), use it directly
      if (orgId) {
        setOrganizationId(orgId);
        setLoading(false);
        return;
      }

      // If slug is provided (new URL format), resolve it
      if (!slug) {
        setSlugError("Invalid portal URL");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("id")
          .eq("portal_slug", slug)
          .maybeSingle();

        if (error) {
          console.error("Error resolving slug:", error);
          setSlugError("Error loading portal");
          setLoading(false);
          return;
        }

        if (!data) {
          setSlugError("Portal not found");
          setLoading(false);
          return;
        }

        setOrganizationId(data.id);
      } catch (error) {
        console.error("Error resolving organization slug:", error);
        setSlugError("Error loading portal");
        setLoading(false);
      }
    };

    resolveIdentifier();
  }, [slug, orgId]);

  useEffect(() => {
    const fetchPortalSettings = async () => {
      if (!organizationId) return;
      try {
        const { data, error } = await supabase
          .from("request_portal_settings")
          .select("*")
          .eq("organization_id", organizationId)
          .maybeSingle();

        if (error) {
          setPortalSettings(null);
        } else if (data && data.enabled) {
          setPortalSettings(data);
        } else {
          setPortalSettings(null);
        }
      } catch (error) {
        setPortalSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalSettings();
  }, [organizationId]);

  // Check for existing employee session
  useEffect(() => {
    const storedEmployee = localStorage.getItem(
      `employee_portal_${organizationId}`,
    );
    if (storedEmployee) {
      try {
        const employeeData = JSON.parse(storedEmployee);
        setEmployee(employeeData);
      } catch (error) {
        console.error("Error parsing stored employee data:", error);
        localStorage.removeItem(`employee_portal_${organizationId}`);
      }
    }
  }, [organizationId]);

  const handleEmployeeAuthenticated = (employeeData: any) => {
    setEmployee(employeeData);
    // Store employee data for session persistence
    localStorage.setItem(
      `employee_portal_${organizationId}`,
      JSON.stringify(employeeData),
    );
  };

  const handleSignOut = () => {
    setEmployee(null);
    localStorage.removeItem(`employee_portal_${organizationId}`);
  };

  if (loading) {
    return <EmployeePortalSkeleton />;
  }

  if (slugError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-card p-8 rounded shadow text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Portal Not Available</h2>
          <p className="text-muted-foreground">{slugError}</p>
        </div>
      </div>
    );
  }

  if (!portalSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Portal Not Available</h2>
          <p className="text-muted-foreground mb-4">
            This organization's request portal is not enabled or does not exist.
            Please contact your administrator for access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <EmployeePortalProvider organizationId={organizationId!}>
      {employee && employee.status === "approved" ? (
        <EmployeePortalDashboard
          employee={employee}
          onSignOut={handleSignOut}
        />
      ) : (
        <EmployeePortalAuth
          portalSettings={portalSettings}
          onEmployeeAuthenticated={handleEmployeeAuthenticated}
        />
      )}
    </EmployeePortalProvider>
  );
}
