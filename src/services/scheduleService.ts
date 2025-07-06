'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';
import type { ScheduleSession } from '@/types';
import { revalidatePath } from 'next/cache';

const scheduleCollectionRef = collection(db, 'schedule');

export async function getSchedule(): Promise<ScheduleSession[]> {
  const q = query(scheduleCollectionRef, orderBy("time"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ScheduleSession));
}

export async function addScheduleSession(session: Omit<ScheduleSession, 'id'>) {
  try {
    const docRef = await addDoc(scheduleCollectionRef, session);
    revalidatePath('/dashboard');
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
    revalidatePath('/dashboard');
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
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return { success: false, error: (error as Error).message };
  }
}
