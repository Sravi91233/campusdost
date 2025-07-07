import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import type { ChatMessage } from '@/types';

// The callback will be used to update the component's state.
// It returns an unsubscribe function to be called on component unmount.
export function getMessages(
  connectionId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesCollectionRef = collection(db, 'chats', connectionId, 'messages');
  const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        text: data.text,
        senderId: data.senderId,
        // Ensure timestamp is serializable
        timestamp: data.timestamp ? { seconds: (data.timestamp as Timestamp).seconds, nanoseconds: (data.timestamp as Timestamp).nanoseconds } : null,
      } as ChatMessage;
    });
    callback(messages);
  });

  return unsubscribe;
}

// Sends a message to a specific chat
export async function sendMessage(
  connectionId: string,
  senderId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  if (!text.trim()) {
    return { success: false, error: 'Message cannot be empty.' };
  }

  try {
    const messagesCollectionRef = collection(db, 'chats', connectionId, 'messages');
    await addDoc(messagesCollectionRef, {
      text,
      senderId,
      timestamp: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error: (error as Error).message };
  }
}
