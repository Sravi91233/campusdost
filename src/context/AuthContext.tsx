'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { loginUser as serviceLogin, signUpUser as serviceSignUp } from '@/services/authService';
import type { UserProfile, SignUpSchema as TSignUp } from '@/types';
import type { z } from 'zod';

const AUTH_STORAGE_KEY = 'campus-compass-auth';

type AuthContextType = {
  userProfile: UserProfile | null;
  loading: boolean; // For initial localStorage check
  login: (email: string, password: string) => ReturnType<typeof serviceLogin>;
  signUp: (data: z.infer<TSignUp>) => ReturnType<typeof serviceSignUp>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  userProfile: null,
  loading: true,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  signUp: async () => ({ success: false, error: 'Auth not initialized' }),
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // On initial mount, try to load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setUserProfile(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not parse user from localStorage", error);
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await serviceLogin(email, password);
    if (result.success && result.profile) {
      setUserProfile(result.profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.profile));
    }
    return result;
  }, []);

  const signUp = useCallback(async (data: z.infer<TSignUp>) => {
    const result = await serviceSignUp(data);
    if (result.success && result.profile) {
      setUserProfile(result.profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result.profile));
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    setUserProfile(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({
    userProfile,
    loading,
    login,
    signUp,
    logout
  }), [userProfile, loading, login, signUp, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
