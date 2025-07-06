'use server';

import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query } from 'firebase/firestore';
import type { MapCorners, MapLocation } from '@/types';
import { revalidatePath } from 'next/cache';

const mapConfigDocRef = doc(db, 'map-config', 'main');

function isPointInPolygon(point: { lat: number; lng: number }, polygon: { lat: number; lng: number }[]): boolean {
  let isInside = false;
  const n = polygon.length;
  if (n < 3) return false;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    
    const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    if (intersect) isInside = !isInside;
  }
  return isInside;
}


export async function rebuildVisibleLocationsCache() {
    try {
        const corners = await getMapCorners();
        if (!corners) {
            console.log("No map boundaries set, clearing visible locations cache.");
            const visibleLocationsDocRef = doc(db, 'map-data', 'visible');
            await setDoc(visibleLocationsDocRef, { locations: [] });
            revalidatePath('/dashboard');
            return;
        }

        const locationsCollectionRef = collection(db, 'locations');
        const locationsSnapshot = await getDocs(query(locationsCollectionRef));
        const allLocations = locationsSnapshot.docs.map(l => ({ id: l.id, ...l.data() } as MapLocation));
        
        const polygonPath = [corners.nw, corners.sw, corners.se, corners.ne];
        const visibleLocations = allLocations.filter(loc => isPointInPolygon(loc.position, polygonPath));
        
        const visibleLocationsDocRef = doc(db, 'map-data', 'visible');
        await setDoc(visibleLocationsDocRef, { locations: visibleLocations });

        revalidatePath('/dashboard');
    } catch (error) {
        console.error("Error rebuilding visible locations cache: ", error);
    }
}


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
    await rebuildVisibleLocationsCache();
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error setting map corners: ", error);
    return { success: false, error: (error as Error).message };
  }
}
