import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getSession,
  getProfile,
  onAuthStateChange,
  updateProfile as apiUpdateProfile,
} from '@/services/auth';
import { getPatientByProfileId, createPatientRecord } from '@/services/patients';
import { isSupabaseConfigured } from '@/services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [patientRecord, setPatientRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to load user profile & patient record
  const loadUserData = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      setPatientRecord(null);
      return;
    }

    setUser(authUser);

    try {
      const { profile: pData } = await getProfile(authUser.id);
      let activeProfile = pData;

      if (!activeProfile) {
        const meta = authUser.user_metadata || {};
        activeProfile = {
          id: authUser.id,
          full_name: meta.full_name || authUser.email?.split('@')[0] || 'User',
          role: meta.role || 'patient',
          phone: meta.phone || '',
        };
      }

      setProfile(activeProfile);

      if (activeProfile?.role === 'patient') {
        const { data: pRec } = await getPatientByProfileId(authUser.id);
        if (pRec) {
          setPatientRecord(pRec);
        } else {
          const { data: newPRec } = await createPatientRecord(authUser.id);
          setPatientRecord(newPRec);
        }
      } else {
        setPatientRecord(null);
      }
    } catch (err) {
      console.error('[AuthContext] Error loading user data:', err);
    }
  }, []);

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    getSession()
      .then(async ({ session: activeSession }) => {
        if (!mounted) return;
        setSession(activeSession);
        if (activeSession?.user) {
          await loadUserData(activeSession.user);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data: authListener } = onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      if (currentSession?.user) {
        await loadUserData(currentSession.user);
      } else {
        setUser(null);
        setProfile(null);
        setPatientRecord(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [loadUserData]);

  const login = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      try {
        const res = await apiSignIn({ email, password });
        if (res.error) {
          return { error: res.error };
        }
        setUser(res.user);
        setSession(res.session);
        setProfile(res.profile);
        setPatientRecord(res.patientRecord);
        return { user: res.user, profile: res.profile, error: null };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async ({ email, password, fullName, role = 'patient', phone = '' }) => {
      setLoading(true);
      try {
        const res = await apiSignUp({ email, password, fullName, role, phone });
        if (res.error) {
          return { error: res.error };
        }
        setUser(res.user);
        setSession(res.session);
        setProfile(res.profile);
        setPatientRecord(res.patientRecord);
        return { user: res.user, profile: res.profile, error: null };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await apiSignOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setPatientRecord(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(
    async (updates) => {
      if (!user) return { error: new Error('Not authenticated') };
      const { data, error } = await apiUpdateProfile(user.id, updates);
      if (!error && data) {
        setProfile(data);
      }
      return { data, error };
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      session,
      profile,
      patientRecord,
      loading,
      isAuthenticated: Boolean(user),
      role: profile?.role || null,
      login,
      signup,
      logout,
      updateUserProfile,
      refreshProfile: () => (user ? loadUserData(user) : Promise.resolve()),
    }),
    [user, session, profile, patientRecord, loading, login, signup, logout, updateUserProfile, loadUserData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
