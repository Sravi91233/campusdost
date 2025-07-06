'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import type { MapLocation } from '@/types';
import { revalidatePath } from 'next/cache';

const locationsCollectionRef = collection(db, 'locations');

export async function getLocations(): Promise<MapLocation[]> {
  const snapshot = await getDocs(query(locationsCollectionRef));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MapLocation));
}

export async function addLocation(location: Omit<MapLocation, 'id'>) {
  try {
    const docRef = await addDoc(locationsCollectionRef, location);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error adding document: ", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateLocation(id: string, location: Partial<Omit<MapLocation, 'id'>>) {
  try {
    const locationDoc = doc(db, 'locations', id);
    await updateDoc(locationDoc, location);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error updating document: ", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteLocation(id: string) {
  try {
    const locationDoc = doc(db, 'locations', id);
    await deleteDoc(locationDoc);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return { success: false, error: (error as Error).message };
  }
}
