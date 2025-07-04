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
  const [employee, setEmployee] = useState<any>(null);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!portalSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Portal Not Available</h2>
          <p className="text-muted-foreground mb-4">This organization's request portal is not enabled or does not exist. Please contact your admin for access.</p>
        </div>
      </div>
    );
  }

  return (
    <EmployeePortalProvider organizationId={organizationId!}>
      {employee && employee.status === 'approved' ? (
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