'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import type { ScheduleSession } from '@/types';
import { revalidatePath } from 'next/cache';

const scheduleCollectionRef = collection(db, 'schedule');

export async function getSchedule(): Promise<ScheduleSession[]> {
  // Fetch without ordering to avoid the need for a composite index.
  const q = query(scheduleCollectionRef);
  const snapshot = await getDocs(q);
  const sessions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleSession));

  // Sort the results here on the server.
  sessions.sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) {
      return dateComparison;
    }
    return a.time.localeCompare(b.time);
  });

  return sessions;
}

export async function addScheduleSession(session: Omit<ScheduleSession, 'id'>) {
  try {
    const docRef = await addDoc(scheduleCollectionRef, session);
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateScheduleSession(id: string, session: Partial<Omit<ScheduleSession, 'id'>>) {
  try {
    const sessionDoc = doc(db, 'schedule', id);
    await updateDoc(sessionDoc, session);
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteScheduleSession(id: string) {
  try {
    const sessionDoc = doc(db, 'schedule', id);
    await deleteDoc(sessionDoc);
    revalidatePath('/dashboard', 'layout');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return { success: false, error: (error as Error).message };
  }
}
