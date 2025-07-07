
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
 * Fetches all schedule sessions from all dates using a collection group query.
 * This requires a Firestore index on the 'sessions' collection group.
 */
export async function getSchedule(): Promise<ScheduleSession[]> {
  const sessionsCollectionGroup = collectionGroup(db, 'sessions');
  const q = query(sessionsCollectionGroup);
  const snapshot = await getDocs(q);
  
  const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleSession));

  // Sort on the server to avoid complex composite indexes and handle bad data.
  sessions.sort((a, b) => {
    if (!a.date || !b.date) return 0;
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
    const sessionsCollectionRef = collection(db, 'schedule', session.date, 'sessions');
    const docRef = await addDoc(sessionsCollectionRef, session);
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
    const newDate = sessionData.date;

    if (oldDate === newDate) {
      // Date hasn't changed, just update the document in place.
      const sessionDoc = doc(db, 'schedule', oldDate, 'sessions', id);
      await updateDoc(sessionDoc, sessionData);
    } else {
      // Date has changed. Move the document: delete old, set new in a transaction.
      const oldDocRef = doc(db, 'schedule', oldDate, 'sessions', id);
      const newDocRef = doc(db, 'schedule', newDate, 'sessions', id);
      
      await runTransaction(db, async (transaction) => {
        // No need to read the old doc; `sessionData` is the complete new state.
        transaction.delete(oldDocRef);
        transaction.set(newDocRef, sessionData);
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
