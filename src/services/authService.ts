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

// The return type now includes the profile on success
export async function signUpUser(data: SignUpData): Promise<{ success: true, user: User, profile: UserProfile } | { success: false, error: string }> {
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

// This function is now fully atomic: it authenticates AND gets the profile.
export async function loginUser(email: string, password: string): Promise<{ success: true; user: User; profile: UserProfile } | { success: false; error: string; }> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const profileResult = await getUserProfile(user.uid);
    
    if (profileResult.success && profileResult.profile) {
      return { success: true, user, profile: profileResult.profile };
    }
    
    // If the profile doesn't exist, something is wrong. Sign out for safety.
    await signOut(auth);
    return { success: false, error: 'User profile not found.' };

  } catch (error: any) {
    // Convert known Firebase auth errors to friendlier messages
    let friendlyMessage = "An unexpected error occurred.";
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        friendlyMessage = 'Invalid email or password.';
        break;
      case 'auth/invalid-email':
        friendlyMessage = 'Please enter a valid email address.';
        break;
    }
    return { success: false, error: friendlyMessage };
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

export async function getUserProfile(uid: string): Promise<{ success: true, profile: UserProfile } | { success: false, error: string}> {
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
