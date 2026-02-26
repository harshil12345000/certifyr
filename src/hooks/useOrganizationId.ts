import { useMemo } from "react";
import { useOrganizationMembership } from "./useOrganizationMembership";

/**
 * Hook to safely get the organization ID for the current user
 * Handles multiple organization memberships by taking the first active admin membership
 * Returns null if no organization is found
 */
export function useOrganizationId() {
  const { membership, loading, refetch } = useOrganizationMembership();
  const orgId = useMemo(
    () => (membership?.role === "admin" ? membership.organization_id : null),
    [membership?.organization_id, membership?.role],
  );

  return { orgId, loading, refetch };
}
