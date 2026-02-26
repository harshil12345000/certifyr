
import { useOrganizationMembership } from "./useOrganizationMembership";

export function useOrganizationSecurity() {
  const { membership, loading, refetch } = useOrganizationMembership();

  const isAdmin = membership?.role === "admin";
  const organizationId = membership?.organization_id;

  const checkAdminAccess = (requiredOrgId?: string) => {
    if (!isAdmin) return false;
    if (requiredOrgId && organizationId !== requiredOrgId) return false;
    return true;
  };

  const checkOrganizationAccess = (requiredOrgId?: string) => {
    if (!membership) return false;
    if (requiredOrgId && organizationId !== requiredOrgId) return false;
    return true;
  };

  return {
    membership,
    loading,
    isAdmin,
    organizationId,
    refetch,
    checkAdminAccess,
    checkOrganizationAccess,
  };
}
