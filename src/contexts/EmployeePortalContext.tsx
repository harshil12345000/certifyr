
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmployeePortalContextType {
  organizationId: string;
  organization: any;
  employee: any;
  setEmployee: (employee: any) => void;
  isAuthenticated: boolean;
  refreshEmployee: () => Promise<void>;
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

  const refreshEmployee = async () => {
    // Check if there's employee data in localStorage (from authentication)
    const storedEmployee = localStorage.getItem('employee_portal_auth');
    if (storedEmployee) {
      try {
        const employeeData = JSON.parse(storedEmployee);
        console.log('Setting employee from localStorage:', employeeData);
        setEmployee(employeeData);
      } catch (error) {
        console.error('Error parsing stored employee data:', error);
        localStorage.removeItem('employee_portal_auth');
      }
    }
  };

  useEffect(() => {
    refreshEmployee();
  }, []);

  const value = {
    organizationId,
    organization,
    employee,
    setEmployee: (emp: any) => {
      console.log('Setting employee in context:', emp);
      setEmployee(emp);
      // Store in localStorage for persistence
      if (emp) {
        localStorage.setItem('employee_portal_auth', JSON.stringify(emp));
      } else {
        localStorage.removeItem('employee_portal_auth');
      }
    },
    isAuthenticated: !!employee,
    refreshEmployee
  };

  return (
    <EmployeePortalContext.Provider value={value}>
      {children}
    </EmployeePortalContext.Provider>
  );
}
