
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
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('employee_portal_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!organizationId) {
      setError('Organization ID is required');
      setLoading(false);
      return;
    }

    const fetchPortalSettings = async () => {
      try {
        console.log('Fetching portal settings for org:', organizationId);
        const { data, error } = await supabase
          .from('request_portal_settings')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('enabled', true)
          .maybeSingle();

        if (error) {
          console.error('Error fetching portal settings:', error);
          setError('Failed to load portal settings');
          setPortalSettings(null);
        } else if (!data) {
          console.log('No portal settings found or portal disabled');
          setPortalSettings(null);
        } else {
          console.log('Portal settings loaded:', data);
          setPortalSettings(data);
        }
      } catch (error) {
        console.error('Error in fetchPortalSettings:', error);
        setError('Failed to load portal');
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
      try {
        localStorage.setItem('employee_portal_session', JSON.stringify(employee));
      } catch (error) {
        console.error('Error saving employee session:', error);
      }
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!portalSettings) {
    return <Navigate to="/auth" replace />;
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
