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
      console.log('Starting signup process for:', email);
      console.log('Signup data received:', data);
      
      const redirectUrl = `${window.location.origin}/dashboard`;
      
      // Create a clean metadata object - ensure we're using the exact field names the database expects
      const metaData: Record<string, any> = {
        full_name: data.fullName.trim(),
      };

      // Only add optional fields if they have non-empty values
      if (data.phoneNumber?.trim()) {
        metaData.phone_number = data.phoneNumber.trim();
        console.log('Adding phone_number to metadata:', metaData.phone_number);
      }
      if (data.organizationName?.trim()) {
        metaData.organization_name = data.organizationName.trim();
        console.log('Adding organization_name to metadata:', metaData.organization_name);
      }
      if (data.organizationType?.trim()) {
        metaData.organization_type = data.organizationType.trim();
        console.log('Adding organization_type to metadata:', metaData.organization_type);
      }
      if (data.organizationSize?.trim()) {
        metaData.organization_size = data.organizationSize.trim();
        console.log('Adding organization_size to metadata:', metaData.organization_size);
      }
      if (data.organizationWebsite?.trim()) {
        metaData.organization_website = data.organizationWebsite.trim();
        console.log('Adding organization_website to metadata:', metaData.organization_website);
      }
      if (data.organizationLocation?.trim()) {
        metaData.organization_location = data.organizationLocation.trim();
        console.log('Adding organization_location to metadata:', metaData.organization_location);
      }

      // Handle the "Other" organization type case
      if (data.organizationType === 'Other' && data.organizationTypeOther?.trim()) {
        metaData.organization_type_other = data.organizationTypeOther.trim();
        console.log('Adding organization_type_other to metadata:', metaData.organization_type_other);
      }

      console.log('Final metadata object being sent to Supabase:', metaData);
      
      const { data: signUpData, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: metaData
        }
      });
      
      console.log('Supabase signup response:', { signUpData, error });
      
      if (error) {
        console.error('Supabase signup error:', error);
        return { error };
      }

      if (signUpData?.user) {
        console.log('User created successfully:', signUpData.user.id);
        console.log('User metadata sent:', signUpData.user.user_metadata);
        
        // Give the trigger a moment to complete
        setTimeout(async () => {
          try {
            // Verify the user profile was created
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('user_id', signUpData.user.id)
              .single();
            
            if (profileError) {
              console.error('Profile creation verification failed:', profileError);
            } else {
              console.log('User profile created successfully:', profile);
            }
          } catch (verificationError) {
            console.error('Profile verification error:', verificationError);
          }
        }, 2000); // Increased timeout to 2 seconds
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
