'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { MapBounds } from '@/types';
import { revalidatePath } from 'next/cache';

const mapConfigDocRef = doc(db, 'map-config', 'main');

export async function getMapBounds(): Promise<MapBounds | null> {
  try {
    const docSnap = await getDoc(mapConfigDocRef);
    if (docSnap.exists()) {
      return docSnap.data().bounds as MapBounds;
    }
  } catch (error) {
    console.error("Error fetching map bounds: ", error);
  }
  return null;
}

export async function setMapBounds(bounds: MapBounds) {
  try {
    await setDoc(mapConfigDocRef, { bounds });
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error setting map bounds: ", error);
    return { success: false, error: (error as Error).message };
  }
}
