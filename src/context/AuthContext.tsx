'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, loginUser as serviceLogin, signUpUser as serviceSignUp } from '@/services/authService';
import type { UserProfile, LoginSchema as TLogin, SignUpSchema as TSignUp } from '@/types';
import type { z } from 'zod';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean; // This is ONLY for the initial auth state check
  login: (email: string, password: string) => ReturnType<typeof serviceLogin>;
  signUp: (data: z.infer<TSignUp>) => ReturnType<typeof serviceSignUp>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  signUp: async () => ({ success: false, error: 'Auth not initialized' }),
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // This effect runs once on mount to check the current auth state
  // and set up a listener for future changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is signed in, get their profile
        const profileResult = await getUserProfile(currentUser.uid);
        setUser(currentUser);
        if (profileResult.success && profileResult.profile) {
          setUserProfile(profileResult.profile);
        } else {
          // Profile doesn't exist or failed to load, sign out for safety
          setUserProfile(null);
          auth.signOut();
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // The login function now calls the service and, upon success,
  // directly updates the context's state. This is crucial.
  const login = useCallback(async (email: string, password: string) => {
    const result = await serviceLogin(email, password);
    if (result.success) {
      setUser(result.user);
      setUserProfile(result.profile);
    }
    return result;
  }, []);

  // The sign-up function does the same for new users.
  const signUp = useCallback(async (data: z.infer<TSignUp>) => {
    const result = await serviceSignUp(data);
    if (result.success) {
      setUser(result.user);
      setUserProfile(result.profile);
    }
    return result;
  }, []);

  const value = { user, userProfile, loading, login, signUp };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
