'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { getUserProfile, createUserProfileInFirestore } from '@/services/authService';
import type { UserProfile, SignUpSchema as TSignUp } from '@/types';
import type { z } from 'zod';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
  signUp: (data: z.infer<TSignUp>) => Promise<{ success: boolean, error?: string, profile?: UserProfile }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  login: async () => ({ success: false, error: 'Auth not initialized' }),
  signUp: async () => ({ success: false, error: 'Auth not initialized' }),
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // On initial mount, set up the listener for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        // User is logged in, fetch their profile from Firestore
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        // User is logged out
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting user and profile state
      return { success: true };
    } catch (error: any) {
      return { success: false, error: "Invalid email or password." };
    }
  }, []);

  const signUp = useCallback(async (data: z.infer<TSignUp>) => {
    try {
      // Step 1: Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // Step 2: Create user profile in Firestore
      // This is now handled within the same function
      const newUserProfile = await createUserProfileInFirestore(firebaseUser, data);
      
      // The onAuthStateChanged listener will eventually update the context state,
      // but we can return the profile immediately for a faster UI update.
      return { success: true, profile: newUserProfile };
    } catch (error: any) {
      // Handle known error codes
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'This email address is already in use.' };
      }
      return { success: false, error: 'An unexpected error occurred during sign-up.' };
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    // onAuthStateChanged will handle clearing user and profile state
  }, []);

  const value = useMemo(() => ({
    user,
    userProfile,
    loading,
    login,
    signUp,
    logout
  }), [user, userProfile, loading, login, signUp, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
