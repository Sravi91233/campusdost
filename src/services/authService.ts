'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { SignUpSchema } from '@/types';
import type { z } from 'zod';
import type { UserProfile } from '@/types';
import type { User as FirebaseAuthUser } from 'firebase/auth';

type SignUpData = z.infer<typeof SignUpSchema>;

/**
 * Normalizes a date string (from ISO or YYYY-MM-DD) to a YYYY-MM-DD string.
 * This ensures consistency in the database.
 * @param dateStr The date string to normalize.
 * @returns A string in YYYY-MM-DD format, or null if the input is invalid.
 */
function normalizeDateToYYYYMMDD(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    // Use UTC methods to avoid timezone-related off-by-one day errors
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

/**
 * Creates a user profile document in Firestore after successful Firebase Auth registration.
 * @param user - The user object from Firebase Authentication.
 * @param data - The additional data from the sign-up form.
 * @returns The newly created user profile.
 */
export async function createUserProfileInFirestore(
  user: FirebaseAuthUser,
  data: SignUpData
): Promise<UserProfile> {
  const userDocRef = doc(db, 'users', user.uid);
  
  const normalizedDate = normalizeDateToYYYYMMDD(data.inductionDate);
  if (!normalizedDate) {
    throw new Error('Invalid induction date provided.');
  }

  // Create the "safe" profile without the password.
  const userProfile: UserProfile = {
    uid: user.uid,
    email: data.email,
    name: data.name,
    registrationNo: data.registrationNo,
    stream: data.stream,
    inductionDate: normalizedDate,
    role: 'user', // Default role for new sign-ups
    phoneNumber: data.phoneNumber,
  };

  await setDoc(userDocRef, userProfile);
  return userProfile;
}


export async function getUserProfile(uid: string): Promise<UserProfile | null> {
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
              stream: userData.stream,
              phoneNumber: userData.phoneNumber,
            };
            return safeProfile;
        } else {
            return null;
        }
    } catch (error: any) {
        console.error("Error getting user profile:", error);
        return null;
    }
}
