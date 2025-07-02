import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmployeePortalContextType {
  organizationId: string;
  organization: any;
  employee: any;
  setEmployee: (employee: any) => void;
  isAuthenticated: boolean;
}

const EmployeePortalContext = createContext<EmployeePortalContextType | undefined>(undefined);

export function useEmployeePortal() {
  const context = useContext(EmployeePortalContext);
  if (!context) {
    throw new Error('useEmployeePortal must be used within EmployeePortalProvider');
  }
  return context;
}

interface EmployeePortalProviderProps {
  children: React.ReactNode;
  organizationId: string;
}

export function EmployeePortalProvider({ children, organizationId }: EmployeePortalProviderProps) {
  const [employee, setEmployee] = useState<any>(null);
  const [organization, setOrganization] = useState<any>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const { data } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();

        setOrganization(data);
      } catch (error) {
        console.error('Error fetching organization:', error);
      }
    };

    fetchOrganization();
  }, [organizationId]);

  const value = {
    organizationId,
    organization,
    employee,
    setEmployee,
    isAuthenticated: !!employee
  };

  return (
    <EmployeePortalContext.Provider value={value}>
      {children}
    </EmployeePortalContext.Provider>
  );
}