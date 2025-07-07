
'use server';

import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  collectionGroup,
  runTransaction
} from 'firebase/firestore';
import type { ScheduleSession } from '@/types';
import { revalidatePath } from 'next/cache';

/**
 * Normalizes a date string (from ISO or YYYY-MM-DD) to a YYYY-MM-DD string.
 * @param dateStr The date string to normalize.
 * @returns A string in YYYY-MM-DD format, or null if the input is invalid.
 */
function normalizeDateToYYYYMMDD(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    // new Date() can parse both '2025-07-20' and '2025-07-20T18:30:00.000Z'
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
 * Fetches all schedule sessions from all dates, normalizing date formats.
 * This requires a Firestore index on the 'sessions' collection group.
 */
export async function getSchedule(): Promise<ScheduleSession[]> {
  const sessionsCollectionGroup = collectionGroup(db, 'sessions');
  const q = query(sessionsCollectionGroup);
  const snapshot = await getDocs(q);
  
  const sessions = snapshot.docs
    .map(doc => {
      const data = doc.data();
      const normalizedDate = normalizeDateToYYYYMMDD(data.date);
      
      if (!normalizedDate) {
        console.warn(`Document ${doc.id} has an invalid or missing date, skipping.`);
        return null;
      }
      
      return { 
        id: doc.id, 
        ...data,
        date: normalizedDate, // Override with the clean YYYY-MM-DD format
      } as ScheduleSession;
    })
    .filter((session): session is ScheduleSession => session !== null);

  // Sort on the server to handle bad time data gracefully.
  sessions.sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;
    
    if (!a.time || !b.time) return 0;
    return a.time.localeCompare(b.time);
  });

  return sessions;
}

/**
 * Adds a new session to the database under the specified date.
 * e.g., /schedule/2024-09-01/sessions/{newId}
 */
export async function addScheduleSession(session: Omit<ScheduleSession, 'id'>) {
  try {
    const normalizedDate = normalizeDateToYYYYMMDD(session.date);
    if (!normalizedDate) {
      return { success: false, error: "Invalid date format provided." };
    }
    const sessionToSave = { ...session, date: normalizedDate };

    const sessionsCollectionRef = collection(db, 'schedule', sessionToSave.date, 'sessions');
    const docRef = await addDoc(sessionsCollectionRef, sessionToSave);
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Updates an existing session. If the date is changed, it moves the document
 * to the correct subcollection in a transaction.
 */
export async function updateScheduleSession(id: string, oldDate: string, sessionData: Omit<ScheduleSession, 'id'>) {
  try {
    const normalizedNewDate = normalizeDateToYYYYMMDD(sessionData.date);
    if (!normalizedNewDate) {
      return { success: false, error: "Invalid date format in update." };
    }
    // Since getSchedule() now normalizes, oldDate should already be clean.
    // We normalize it again just in case of any edge cases.
    const normalizedOldDate = normalizeDateToYYYYMMDD(oldDate);
    if (!normalizedOldDate) {
      return { success: false, error: "Invalid old date format in update." };
    }

    const sessionToSave = { ...sessionData, date: normalizedNewDate };

    if (normalizedOldDate === normalizedNewDate) {
      // Date hasn't changed, just update the document in place.
      const sessionDoc = doc(db, 'schedule', normalizedOldDate, 'sessions', id);
      await updateDoc(sessionDoc, sessionToSave);
    } else {
      // Date has changed. Move the document: delete old, set new in a transaction.
      const oldDocRef = doc(db, 'schedule', normalizedOldDate, 'sessions', id);
      const newDocRef = doc(db, 'schedule', normalizedNewDate, 'sessions', id);
      
      await runTransaction(db, async (transaction) => {
        transaction.delete(oldDocRef);
        transaction.set(newDocRef, sessionToSave);
      });
    }

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Deletes a session from the database. Requires the date to find the document.
 */
export async function deleteScheduleSession(id: string, date: string) {
  try {
    // The date passed here should be normalized from the component state.
    const sessionDoc = doc(db, 'schedule', date, 'sessions', id);
    await deleteDoc(sessionDoc);
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return { success: false, error: (error as Error).message };
  }
}
