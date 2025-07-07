'use server';

import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { SignUpSchema } from '@/types';
import type { z } from 'zod';
import type { UserProfile } from '@/types';

type SignUpData = z.infer<typeof SignUpSchema>;

export async function signUpUser(data: SignUpData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    const userProfile: UserProfile = {
      uid: user.uid,
      email: data.email,
      name: data.name,
      registrationNo: data.registrationNo,
      inductionDate: data.inductionDate,
      role: 'user', // Default role for new sign-ups
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return { success: true, user, profile: userProfile };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: true; user: User; profile: UserProfile } | { success: false; error: string; }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const profileResult = await getUserProfile(user.uid);
    
    if (profileResult.success && profileResult.profile) {
      return { success: true, user, profile: profileResult.profile };
    }
    
    await signOut(auth); // Sign out if profile is missing
    return { success: false, error: 'User profile not found.' };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserProfile(uid: string) {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            return { success: true, profile: userDoc.data() as UserProfile };
        } else {
            return { success: false, error: 'User profile not found.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
