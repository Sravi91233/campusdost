
'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, query, getDoc, onSnapshot } from 'firebase/firestore';
import type { MapLocation } from '@/types';
import { revalidatePath } from 'next/cache';
import { rebuildVisibleLocationsCache } from './mapConfigService';

const locationsCollectionRef = collection(db, 'locations');

export function onVisibleLocationsUpdate(callback: (locations: MapLocation[]) => void): () => void {
  const visibleLocationsDocRef = doc(db, 'map-data', 'visible');
  
  const unsubscribe = onSnapshot(visibleLocationsDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(Array.isArray(data.locations) ? data.locations : []);
    } else {
      callback([]);
    }
  });

  return unsubscribe;
}

export async function getLocations(): Promise<MapLocation[]> {
  const snapshot = await getDocs(query(locationsCollectionRef));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MapLocation));
}

export async function getVisibleLocations(): Promise<MapLocation[]> {
    try {
        const visibleLocationsDocRef = doc(db, 'map-data', 'visible');
        const docSnap = await getDoc(visibleLocationsDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            return Array.isArray(data.locations) ? data.locations : [];
        }
    } catch (error) {
        console.error("Error fetching visible locations cache: ", error);
    }
    return [];
}


export async function addLocation(location: Omit<MapLocation, 'id'>) {
  try {
    const docRef = await addDoc(locationsCollectionRef, location);
    await rebuildVisibleLocationsCache();
    revalidatePath('/admin');
    // Revalidation is still useful for users who load the page after a change.
    // The real-time listener will handle currently connected users.
    revalidatePath('/dashboard', 'layout'); 
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
    await rebuildVisibleLocationsCache();
    revalidatePath('/admin');
    revalidatePath('/dashboard', 'layout');
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
    await rebuildVisibleLocationsCache();
    revalidatePath('/admin');
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error) {
    console.error("Error deleting document: ", error);
    return { success: false, error: (error as Error).message };
  }
}
