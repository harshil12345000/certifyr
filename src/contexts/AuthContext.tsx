import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Define an interface for the additional sign-up data
export interface SignUpData {
  fullName: string;
  phoneNumber?: string;
  organizationName?: string;
  organizationType?: string;
  organizationTypeOther?: string; // For when "Other" is selected
  organizationSize?: string;
  organizationWebsite?: string;
  organizationLocation?: string;
  selectedPlan?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    data: SignUpData,
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session: initialSession },
          error: sessionError
        } = await supabase.auth.getSession();

        // Handle refresh token errors - clear everything and start fresh
        if (sessionError) {
          console.warn('Session error detected:', sessionError);
          
          if (sessionError.message?.includes('Refresh Token') || 
              sessionError.message?.includes('refresh_token_not_found') ||
              sessionError.message?.includes('Invalid Refresh Token')) {
            console.warn('Stale/invalid refresh token detected, clearing auth data...');
            await supabase.auth.signOut();
            localStorage.removeItem("authToken");
            localStorage.removeItem("lastLogin");
            // Clear all Supabase localStorage keys
            Object.keys(localStorage).forEach(key => {
              if (key.startsWith('sb-')) {
                localStorage.removeItem(key);
              }
            });
            setUser(null);
            setSession(null);
            setLoading(false);
            return;
          }
        }

        let validUser = initialSession?.user ?? null;

        if (mounted) {
          setSession(initialSession);
          setUser(validUser);

          // Store authToken in localStorage if session exists
          // Note: We don't set lastLogin here to preserve the original login time
          // lastLogin should only be set on actual sign-in events
          if (initialSession?.access_token) {
            localStorage.setItem("authToken", initialSession.access_token);
          } else {
            // Clear localStorage if no valid session
            localStorage.removeItem("authToken");
            localStorage.removeItem("lastLogin");
          }

          // Organization handling removed from here to prevent race condition
          // It will be handled in the auth state change listener only
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // On any error, clear auth state
        await supabase.auth.signOut();
        localStorage.removeItem("authToken");
        localStorage.removeItem("lastLogin");
        setUser(null);
        setSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      let validUser = session?.user ?? null;

      setSession(session);
      setUser(validUser);

      // Update localStorage based on auth state changes
      if (session?.access_token) {
        localStorage.setItem("authToken", session.access_token);
        // Update lastLogin only on sign in events to preserve original login time
        if (event === "SIGNED_IN") {
          localStorage.setItem("lastLogin", Date.now().toString());
        }
      } else {
        // Clear localStorage on sign out or token expiration
        localStorage.removeItem("authToken");
        localStorage.removeItem("lastLogin");
      }

      // When user signs in, check if they need to be added to an organization
      if (event === "SIGNED_IN" && validUser) {
        setTimeout(() => {
          ensureUserHasOrganization(validUser);
        }, 0);
      }

      setLoading(false);
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserHasOrganization = async (user: User) => {
    try {
      console.log(`[ORG CHECK] Starting for user ${user.id}`);
      
      // Check if user already has an active admin membership to prevent duplicates
      const { data: existingMembership, error: membershipError } = await supabase
        .from("organization_members")
        .select("organization_id, role, status")
        .eq("user_id", user.id)
        .eq("status", "active");

      if (membershipError) {
        console.error("[ORG ERROR] Error checking memberships:", membershipError);
      }

      if (existingMembership && existingMembership.length > 0) {
        if (existingMembership.length > 1) {
          console.error(`[ORG ERROR] User ${user.id} has ${existingMembership.length} active memberships!`, existingMembership);
        }
        console.log(`[ORG CHECK] User already has organization, skipping creation`);
        return;
      }

      // Get user profile to check for organization data
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select(
          "organization_name, organization_type, organization_location, email, phone_number",
        )
        .eq("user_id", user.id)
        .single();

      let orgId: string | null = null;
      if (userProfile?.organization_name) {
        // Try to find existing org
        const { data: org } = await supabase
          .from("organizations")
          .select("id")
          .eq("name", userProfile.organization_name)
          .maybeSingle();
        if (org?.id) {
          orgId = org.id;
        } else {
          // Create organization if not exists
          const { data: newOrg, error: orgError } = await supabase
            .from("organizations")
            .insert([
              {
                name: userProfile.organization_name,
                email: userProfile.email,
                phone: userProfile.phone_number,
                address: userProfile.organization_location,
                portal_slug: userProfile.organization_name
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/^-+|-+$/g, '')
              },
            ])
            .select()
            .single();
          if (orgError) {
            console.error("Error creating organization:", orgError);
            return;
          }
          orgId = newOrg.id;
          console.log(`[ORG CHECK] Created new organization ${orgId}`);
        }
      }
      if (!orgId) return;
      
      // Upsert user as admin in organization_members with conflict handling
      const { error: upsertError } = await supabase
        .from("organization_members")
        .upsert(
          {
            organization_id: orgId,
            user_id: user.id,
            role: "admin",
            status: "active",
          },
          { 
            onConflict: "organization_id,user_id",
            ignoreDuplicates: true
          },
        );
      if (upsertError) {
        console.error(
          "Error upserting user to organization_members:",
          upsertError,
        );
      } else {
        console.log(`[ORG CHECK] Added user to organization ${orgId}`);
      }
    } catch (error) {
      console.error("Error in ensureUserHasOrganization:", error);
    }
  };

  const signUp = async (email: string, password: string, data: SignUpData) => {
    try {
      const redirectUrl = `${window.location.origin}/`;

      // Create a clean metadata object - ensure we're using the exact field names the database expects
      const metaData: Record<string, any> = {
        full_name: data.fullName.trim(),
      };

      // Only add optional fields if they have non-empty values
      if (data.phoneNumber?.trim()) {
        metaData.phone_number = data.phoneNumber.trim();
      }
      if (data.organizationName?.trim()) {
        metaData.organization_name = data.organizationName.trim();
      }
      if (data.organizationType?.trim()) {
        metaData.organization_type = data.organizationType.trim();
      }
      if (data.organizationSize?.trim()) {
        metaData.organization_size = data.organizationSize.trim();
      }
      if (data.organizationWebsite?.trim()) {
        metaData.organization_website = data.organizationWebsite.trim();
      }
      if (data.organizationLocation?.trim()) {
        metaData.organization_location = data.organizationLocation.trim();
      }

      // Handle the "Other" organization type case
      if (
        data.organizationType === "Other" &&
        data.organizationTypeOther?.trim()
      ) {
        metaData.organization_type_other = data.organizationTypeOther.trim();
      }

      // Selected plan for onboarding (used by handle_new_user trigger)
      if (data.selectedPlan) {
        metaData.selectedPlan = data.selectedPlan;
      }

      console.log("Attempting signup with metadata:", metaData);
      console.log("Redirect URL:", redirectUrl);
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metaData,
        },
      });

      if (error) {
        console.error("Supabase signup error:", error);
        return { error };
      }

      console.log("Signup successful:", signUpData);
      
      // If email confirmation is disabled, user will be automatically logged in
      // and the auth state listener will handle the session update
      // If email confirmation is enabled, user needs to verify email first
      
      return { error: null };
    } catch (error) {
      console.error("Unexpected signup error:", error);
      return { error };
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe = false,
  ) => {
    try {
      const cleanedEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithPassword({
        email: cleanedEmail,
        password,
      });

      if (!error) {
        const { data: { session: newSession } } = await supabase.auth.getSession();
        const validUser = newSession?.user ?? null;
        setSession(newSession);
        setUser(validUser);

        if (newSession?.access_token) {
          localStorage.setItem("authToken", newSession.access_token);
          localStorage.setItem("lastLogin", Date.now().toString());
        }
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear authToken and lastLogin from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("lastLogin");

      // Force page refresh to ensure clean state
      window.location.href = "/auth";
    } catch (error) {
      console.error("Error signing out:", error);
      // Force cleanup even if signOut fails
      setUser(null);
      setSession(null);
      // Clear authToken and lastLogin from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("lastLogin");
      window.location.href = "/auth";
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
