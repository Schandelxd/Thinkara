import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.warn('Failed to get session (check your Supabase config):', err.message);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });
      subscription = data?.subscription;
    } catch (err) {
      console.warn('Failed to setup auth listener:', err.message);
    }

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  // Sign up — Supabase will send OTP email if email confirmations are enabled
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
    return data;
  };

  // Verify OTP code sent to email
  const verifyOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    if (error) throw error;
    return data;
  };

  // Resend OTP verification email
  const resendVerification = async (email) => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) throw error;
    return data;
  };

  // Sign in with email + password
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  };

  // Request password reset — sends OTP to email
  const resetPasswordRequest = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return data;
  };

  // Update password (when logged in, or after reset OTP)
  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return data;
  };

  // Verify password reset OTP
  const verifyPasswordResetOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    // Clear per-user session marker BEFORE signing out
    localStorage.removeItem('thinkara_current_user_id');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Delete account
  const deleteAccount = async () => {
    // Clear user data from localStorage first
    const userId = user?.id;
    if (userId) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`thinkara_${userId}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      localStorage.removeItem('thinkara_current_user_id');
    }
    
    // Attempt to delete user via RPC function in Supabase.
    // NOTE: This requires creating the following function in the Supabase SQL editor:
    // create or replace function delete_user() returns void as $$
    // begin
    //   delete from auth.users where id = auth.uid();
    // end;
    // $$ language plpgsql security definer;
    try {
      await supabase.rpc('delete_user');
    } catch (e) {
      console.warn("RPC delete_user failed or not found.", e);
    }

    // Sign out (account deletion from Supabase requires server-side admin API)
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    verifyOtp,
    resendVerification,
    signIn,
    signOut,
    resetPasswordRequest,
    updatePassword,
    verifyPasswordResetOtp,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
