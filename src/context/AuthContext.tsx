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
  login: (data: z.infer<TLogin>) => ReturnType<typeof serviceLogin>;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is signed in, get their profile
        const profileResult = await getUserProfile(currentUser.uid);
        setUser(currentUser);
        if (profileResult.success && profileResult.profile) {
          setUserProfile(profileResult.profile);
        } else {
          // This case should ideally not happen if profiles are created on sign-up.
          // For safety, we clear the profile and log the user out.
          setUserProfile(null);
          auth.signOut();
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      // The initial check is complete.
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // These functions just call the service. onAuthStateChanged will update the context state.
  const login = useCallback(async (data: z.infer<TLogin>) => {
    return serviceLogin(data.email, data.password);
  }, []);

  const signUp = useCallback(async (data: z.infer<TSignUp>) => {
    return serviceSignUp(data);
  }, []);


  const value = { user, userProfile, loading, login, signUp };

  // The provider ALWAYS renders children. This prevents the entire UI tree
  // from being unmounted during login, which was the cause of the infinite loop.
  // Page components will use the `loading` and `user` values from the context to decide what to render.
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
