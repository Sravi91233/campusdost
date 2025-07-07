'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import type { UserProfile } from '@/types';

const usersCollectionRef = collection(db, 'users');

/**
 * Fetches a list of users belonging to a specific stream, excluding the current user.
 * @param stream The academic stream to filter by.
 * @param currentUserId The UID of the current user to exclude from the results.
 * @returns A promise that resolves to an array of UserProfile objects.
 */
export async function getUsersByStream(stream: string, currentUserId: string): Promise<UserProfile[]> {
  try {
    // Create a query to find users in the same stream, but not the current user.
    // We add a limit to avoid fetching thousands of users in a large system.
    const q = query(
      usersCollectionRef,
      where('stream', '==', stream),
      where('uid', '!=', currentUserId),
      limit(50) 
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return [];
    }

    // Map over the documents and build a clean UserProfile array.
    // This is crucial for security as it strips the password field from the data.
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data();
      
      const userProfile: UserProfile = {
        uid: data.uid,
        email: data.email,
        name: data.name,
        registrationNo: data.registrationNo,
        inductionDate: data.inductionDate,
        role: data.role,
        stream: data.stream,
      };
      return userProfile;
    });

    return users;

  } catch (error) {
    console.error("Error fetching users by stream:", error);
    // Return an empty array in case of an error to prevent the app from crashing.
    return [];
  }
}
