import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface OrganizationMembership {
  organization_id: string;
  role: string;
  status: string;
}

type MembershipCacheEntry = {
  data: OrganizationMembership | null;
  updatedAt: number;
  pending: Promise<OrganizationMembership | null> | null;
};

const CACHE_TTL_MS = 30_000;
const membershipCache = new Map<string, MembershipCacheEntry>();

const isFresh = (entry?: MembershipCacheEntry | null) =>
  !!entry && Date.now() - entry.updatedAt < CACHE_TTL_MS;

export async function getOrganizationMembershipForUser(
  userId: string,
  options?: { force?: boolean },
): Promise<OrganizationMembership | null> {
  const cached = membershipCache.get(userId);
  if (!options?.force && isFresh(cached)) {
    return cached?.data ?? null;
  }
  if (cached?.pending) {
    return cached.pending;
  }

  const pending = (async () => {
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id, role, status")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data?.organization_id) {
        membershipCache.set(userId, {
          data: null,
          updatedAt: Date.now(),
          pending: null,
        });
        return null;
      }

      const normalized: OrganizationMembership = {
        organization_id: data.organization_id,
        role: data.role ?? "admin",
        status: data.status ?? "active",
      };

      membershipCache.set(userId, {
        data: normalized,
        updatedAt: Date.now(),
        pending: null,
      });
      return normalized;
    } catch (error) {
      console.error("Unexpected error fetching organization membership:", error);
      membershipCache.set(userId, {
        data: null,
        updatedAt: Date.now(),
        pending: null,
      });
      return null;
    }
  })();

  membershipCache.set(userId, {
    data: cached?.data ?? null,
    updatedAt: cached?.updatedAt ?? 0,
    pending,
  });

  return pending;
}

export function invalidateOrganizationMembershipCache(userId?: string) {
  if (userId) {
    membershipCache.delete(userId);
    return;
  }
  membershipCache.clear();
}

export function useOrganizationMembership() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<OrganizationMembership | null>(null);
  const [loading, setLoading] = useState<boolean>(() => !!user?.id);

  const refreshMembership = useCallback(
    async (force = false) => {
      if (!user?.id) {
        setMembership(null);
        setLoading(false);
        return null;
      }

      const cached = membershipCache.get(user.id);
      const hasFreshCache = !force && isFresh(cached);
      if (!hasFreshCache) {
        setLoading(true);
      }

      const result = await getOrganizationMembershipForUser(user.id, { force });
      setMembership(result);
      setLoading(false);
      return result;
    },
    [user?.id],
  );

  useEffect(() => {
    if (!user?.id) {
      setMembership(null);
      setLoading(false);
      return;
    }

    const cached = membershipCache.get(user.id);
    if (cached?.data) {
      setMembership(cached.data);
      if (isFresh(cached)) {
        setLoading(false);
      }
    } else {
      setLoading(true);
    }

    void refreshMembership(false);
  }, [refreshMembership, user?.id]);

  return { membership, loading, refetch: () => refreshMembership(true) };
}
