
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, data: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // When user signs in, check if they need to be added to an organization
        if (event === 'SIGNED_IN' && session?.user) {
          await ensureUserHasOrganization(session.user);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        ensureUserHasOrganization(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const ensureUserHasOrganization = async (user: User) => {
    try {
      // Check if user is already in an organization
      const { data: existingMembership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMembership) {
        return;
      }

      // Get user profile to check for organization data
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('organization_name, organization_type, organization_location, email, phone_number')
        .eq('user_id', user.id)
        .single();

      if (userProfile?.organization_name) {
        // Create organization
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert([{
            name: userProfile.organization_name,
            email: userProfile.email,
            phone: userProfile.phone_number,
            address: userProfile.organization_location
          }])
          .select()
          .single();

        if (orgError) {
          console.error('Error creating organization:', orgError);
          return;
        }

        // Add user as admin to the organization
        const { error: memberError } = await supabase
          .from('organization_members')
          .insert([{
            organization_id: newOrg.id,
            user_id: user.id,
            role: 'admin',
            status: 'active'
          }]);

        if (memberError) {
          console.error('Error adding user to organization:', memberError);
        }
      }
    } catch (error) {
      console.error('Error in ensureUserHasOrganization:', error);
    }
  };

  const signUp = async (email: string, password: string, data: SignUpData) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
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
      if (data.organizationType === 'Other' && data.organizationTypeOther?.trim()) {
        metaData.organization_type_other = data.organizationTypeOther.trim();
      }
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metaData
        }
      });
      
      if (error) {
        console.error('Supabase signup error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    try {
      // Configure session persistence based on rememberMe
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && !rememberMe) {
        // If not remembering, we'll use session storage instead of local storage
        // This is handled by configuring the storage in the client
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
      
      // Force page refresh to ensure clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force cleanup even if signOut fails
      setUser(null);
      setSession(null);
      window.location.href = '/auth';
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
