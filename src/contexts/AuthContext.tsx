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
        console.log('Auth event:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, data: SignUpData) => {
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const metaData: Record<string, any> = {
        full_name: data.fullName,
        phone_number: data.phoneNumber,
        organization_name: data.organizationName,
        organization_type: data.organizationType,
        organization_size: data.organizationSize,
        organization_website: data.organizationWebsite,
        organization_location: data.organizationLocation,
      };

      if (data.organizationType === 'Other' && data.organizationTypeOther) {
        metaData.organization_type_other = data.organizationTypeOther;
      }
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metaData
        }
      });
      
      return { error };
    } catch (error) {
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
