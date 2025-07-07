'use server';

import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { SignUpSchema } from '@/types';
import type { z } from 'zod';

type SignUpData = z.infer<typeof SignUpSchema>;

export async function signUpUser(data: SignUpData) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    const userProfile = {
      uid: user.uid,
      email: data.email,
      name: data.name,
      registrationNo: data.registrationNo,
      inductionDate: data.inductionDate,
      role: 'user' as const,
    };

    await setDoc(doc(db, 'users', user.uid), userProfile);

    return { success: true, userId: user.uid };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, userId: userCredential.user.uid };
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
            return { success: true, profile: userDoc.data() };
        } else {
            return { success: false, error: 'User profile not found.' };
        }
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
