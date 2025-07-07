
'use server';

import { db } from '@/lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { revalidatePath } from 'next/cache';
import type { Connection } from '@/types';

const connectionsCollectionRef = collection(db, 'connections');

// Helper to create a consistent, sorted document ID for a connection
function createConnectionId(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_');
}

// Fetches all connections (pending or connected) for a given user
export async function getConnectionsForUser(uid: string): Promise<Connection[]> {
  if (!uid) return [];
  try {
    const q = query(connectionsCollectionRef, where('participants', 'array-contains', uid));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Connection));
  } catch (error) {
    console.error("Error fetching connections for user:", error);
    return [];
  }
}

// Sends a connection request from one user to another
export async function sendConnectionRequest(fromUid: string, toUid: string): Promise<{ success: boolean; connection?: Connection; error?: string }> {
  const connectionId = createConnectionId(fromUid, toUid);
  const connectionDocRef = doc(db, 'connections', connectionId);

  try {
    const docSnap = await getDoc(connectionDocRef);
    if (docSnap.exists()) {
      return { success: false, error: "A connection or request already exists." };
    }

    const newConnectionData: Omit<Connection, 'id'> = {
      participants: [fromUid, toUid].sort() as [string, string],
      status: 'pending',
      requestedBy: fromUid,
    };

    await setDoc(connectionDocRef, newConnectionData);
    
    const newConnection: Connection = {
        id: connectionId,
        ...newConnectionData
    }

    revalidatePath('/dashboard');
    return { success: true, connection: newConnection };
  } catch (error) {
    console.error("Error sending connection request:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Accepts a pending connection request
export async function acceptConnectionRequest(connectionId: string): Promise<{ success: boolean; error?: string }> {
  const connectionDocRef = doc(db, 'connections', connectionId);
  try {
    await updateDoc(connectionDocRef, { status: 'connected' });
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error accepting connection request:", error);
    return { success: false, error: (error as Error).message };
  }
}

// Declines a pending request or cancels a sent one
export async function declineOrCancelRequest(connectionId: string): Promise<{ success: boolean; error?: string }> {
  const connectionDocRef = doc(db, 'connections', connectionId);
  try {
    await deleteDoc(connectionDocRef);
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error declining/cancelling request:", error);
    return { success: false, error: (error as Error).message };
  }
}
