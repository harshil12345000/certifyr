import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EmployeePortalAuth } from '@/components/employee-portal/EmployeePortalAuth';
import { EmployeePortalDashboard } from '@/components/employee-portal/EmployeePortalDashboard';
import { EmployeePortalProvider } from '@/contexts/EmployeePortalContext';

export default function EmployeePortal() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [portalSettings, setPortalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(() => {
    // Try to load employee session from localStorage
    const stored = localStorage.getItem('employee_portal_session');
    return stored ? JSON.parse(stored) : null;
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setErrorMsg('Invalid organization link. Please check your URL.');
      setLoading(false);
      return;
    }

    const fetchPortalSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('request_portal_settings')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('enabled', true)
          .single();

        if (error) {
          setErrorMsg('Error fetching portal settings. Please try again later.');
          setPortalSettings(null);
        } else if (!data) {
          setErrorMsg('This organization does not have the request portal enabled. Please contact your admin.');
          setPortalSettings(null);
        } else {
          setPortalSettings(data);
        }
      } catch (error) {
        setErrorMsg('A network or server error occurred. Please try again later.');
        setPortalSettings(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPortalSettings();
  }, [organizationId]);

  // Persist employee session to localStorage
  useEffect(() => {
    if (employee) {
      localStorage.setItem('employee_portal_session', JSON.stringify(employee));
    } else {
      localStorage.removeItem('employee_portal_session');
    }
  }, [employee]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="mb-4 text-red-600 font-semibold text-lg">{errorMsg}</div>
        <button
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!portalSettings) {
    // This should be unreachable, but fallback just in case
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <div className="mb-4 text-red-600 font-semibold text-lg">Request portal is not available for this organization.</div>
      </div>
    );
  }

  return (
    <EmployeePortalProvider organizationId={organizationId!}>
      {employee ? (
        <EmployeePortalDashboard employee={employee} onSignOut={() => setEmployee(null)} />
      ) : (
        <EmployeePortalAuth 
          portalSettings={portalSettings}
          onEmployeeAuthenticated={setEmployee}
        />
      )}
    </EmployeePortalProvider>
  );
}