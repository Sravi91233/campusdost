'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { MapCorners } from '@/types';
import { revalidatePath } from 'next/cache';

const mapConfigDocRef = doc(db, 'map-config', 'main');

export async function getMapCorners(): Promise<MapCorners | null> {
  try {
    const docSnap = await getDoc(mapConfigDocRef);
    if (docSnap.exists()) {
      return docSnap.data().corners as MapCorners;
    }
  } catch (error) {
    console.error("Error fetching map corners: ", error);
  }
  return null;
}

export async function setMapCorners(corners: MapCorners) {
  try {
    await setDoc(mapConfigDocRef, { corners });
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error setting map corners: ", error);
    return { success: false, error: (error as Error).message };
  }
}
