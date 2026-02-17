import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePortalAuth } from "@/components/employee-portal/EmployeePortalAuth";
import { EmployeePortalDashboard } from "@/components/employee-portal/EmployeePortalDashboard";
import { EmployeePortalProvider } from "@/contexts/EmployeePortalContext";
import { EmployeePortalSkeleton } from "@/components/employee-portal/EmployeePortalSkeleton";

export default function EmployeePortal() {
  const { slug } = useParams<{ slug: string }>();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [portalSettings, setPortalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(null);

  // Resolve slug to organization ID and portal settings in one call
  // Uses SECURITY DEFINER function so anonymous users can access it
  useEffect(() => {
    const resolvePortal = async () => {
      if (!slug) {
        setSlugError("Invalid portal URL");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_portal_info", {
          p_slug: slug,
        });

        if (error) {
          console.error("Error resolving portal:", error);
          setSlugError("Error loading portal");
          setLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          setSlugError("Portal not found or not enabled");
          setLoading(false);
          return;
        }

        const portalInfo = data[0];
        setOrganizationId(portalInfo.organization_id);
        setPortalSettings({
          enabled: portalInfo.enabled,
          portal_url: portalInfo.portal_url,
          organization_id: portalInfo.organization_id,
        });
      } catch (error) {
        console.error("Error resolving portal:", error);
        setSlugError("Error loading portal");
      } finally {
        setLoading(false);
      }
    };

    resolvePortal();
  }, [slug]);

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
    <EmployeePortalProvider organizationId={organizationId!} portalSlug={slug!}>
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
