'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  limit,
} from 'firebase/firestore';
import { SignUpSchema } from '@/types';
import type { z } from 'zod';
import type { UserProfile } from '@/types';

type SignUpData = z.infer<typeof SignUpSchema>;

const usersCollectionRef = collection(db, 'users');

// WARNING: THIS IS AN INSECURE AUTHENTICATION SYSTEM.
// This has been implemented as per a specific user request to bypass Firebase Authentication.
// Storing and querying plaintext passwords is a significant security vulnerability.

export async function signUpUser(data: SignUpData): Promise<{ success: true, profile: UserProfile } | { success: false, error: string }> {
  try {
    // Check if user already exists
    const q = query(usersCollectionRef, where("email", "==", data.email), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Create a new user document with a generated UID
    const newUserDocRef = doc(usersCollectionRef);
    
    // This object includes the password and is ONLY used for writing to Firestore.
    const userProfileWithPassword = {
      uid: newUserDocRef.id,
      email: data.email,
      name: data.name,
      registrationNo: data.registrationNo,
      inductionDate: data.inductionDate,
      role: 'user' as const, // Default role for new sign-ups
      password: data.password, // Storing password in plaintext
    };

    await setDoc(newUserDocRef, userProfileWithPassword);
    
    // Create and return the "safe" profile without the password.
    const { password, ...safeProfile } = userProfileWithPassword;

    return { success: true, profile: safeProfile };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, error: "An unexpected error occurred during sign-up." };
  }
}

export async function loginUser(email: string, passwordAttempt: string): Promise<{ success: true; profile: UserProfile } | { success: false; error: string; }> {
  try {
    const q = query(usersCollectionRef, where("email", "==", email), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data(); // This object from Firestore includes the password field.

    if (userData.password !== passwordAttempt) {
      return { success: false, error: 'Invalid email or password.' };
    }

    // Create and return the "safe" profile without the password.
    const safeProfile: UserProfile = {
      uid: userDoc.id,
      email: userData.email,
      name: userData.name,
      registrationNo: userData.registrationNo,
      inductionDate: userData.inductionDate,
      role: userData.role,
    };

    return { success: true, profile: safeProfile };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: "An unexpected error occurred during login." };
  }
}

export async function getUserProfile(uid: string): Promise<{ success: true, profile: UserProfile } | { success: false, error: string}> {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const safeProfile: UserProfile = {
              uid: userDocSnap.id,
              email: userData.email,
              name: userData.name,
              registrationNo: userData.registrationNo,
              inductionDate: userData.inductionDate,
              role: userData.role,
            };
            return { success: true, profile: safeProfile };
        } else {
            return { success: false, error: 'User profile not found.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
