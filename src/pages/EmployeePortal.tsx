import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { EmployeePortalAuth } from '@/components/employee-portal/EmployeePortalAuth';
import { EmployeePortalDashboard } from '@/components/employee-portal/EmployeePortalDashboard';
import { EmployeePortalProvider, useEmployeePortal } from '@/contexts/EmployeePortalContext';

export default function EmployeePortal() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const [portalSettings, setPortalSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<any>(() => {
    // Try to load employee session from localStorage
    const stored = localStorage.getItem('employee_portal_session');
    return stored ? JSON.parse(stored) : null;
  });

  // Sync employee state with context
  const context = useEmployeePortal?.();
  useEffect(() => {
    if (context && context.setEmployee) {
      context.setEmployee(employee);
    }
  }, [employee, context]);

  useEffect(() => {
    if (!organizationId) return;

    const fetchPortalSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('request_portal_settings')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('enabled', true)
          .single();

        if (error || !data) {
          setPortalSettings(null);
        } else {
          setPortalSettings(data);
        }
      } catch (error) {
        console.error('Error fetching portal settings:', error);
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