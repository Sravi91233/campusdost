'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { getUserProfile, loginUser as serviceLogin, signUpUser as serviceSignUp } from '@/services/authService';
import type { UserProfile, LoginSchema as TLogin, SignUpSchema as TSignUp } from '@/types';
import { Loader2 } from 'lucide-react';
import type { z } from 'zod';

type AuthContextType = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (data: z.infer<TLogin>) => Promise<ReturnType<typeof serviceLogin>>;
  signUp: (data: z.infer<TSignUp>) => Promise<ReturnType<typeof serviceSignUp>>;
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const profileResult = await getUserProfile(user.uid);
        if (profileResult.success && profileResult.profile) {
            setUserProfile(profileResult.profile);
        } else {
            setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (data: z.infer<TLogin>) => {
    setLoading(true);
    const result = await serviceLogin(data.email, data.password);
    if (result.success) {
      setUser(result.user);
      setUserProfile(result.profile);
    }
    setLoading(false);
    return result;
  };

  const signUp = async (data: z.infer<TSignUp>) => {
    setLoading(true);
    const result = await serviceSignUp(data);
    if (result.success) {
      setUser(result.user);
      setUserProfile(result.profile);
    }
    setLoading(false);
    return result;
  };


  const value = { user, userProfile, loading, login, signUp };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}
