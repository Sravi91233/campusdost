
"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getUsersByStream } from "@/services/userService";
import { getConnectionsForUser } from "@/services/connectionService";
import type { UserProfile, Connection } from "@/types";
import { Loader2 } from "lucide-react";
import { ConnectionRequests } from "@/components/ConnectionRequests";
import { BuddyMatcher } from "@/components/buddy-matcher";
import { ConnectedBuddies } from "@/components/connected-buddies";
import { ChatDialog } from "@/components/chat-dialog";

export function BuddyFeatureWrapper() {
  const { userProfile } = useAuth();
  const [buddies, setBuddies] = useState<UserProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<Connection | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (userProfile) {
        setIsLoading(true);
        const [buddiesData, connectionsData] = await Promise.all([
          getUsersByStream(userProfile.stream, userProfile.uid),
          getConnectionsForUser(userProfile.uid)
        ]);
        setBuddies(buddiesData);
        setConnections(connectionsData);
        setIsLoading(false);
      }
    }
    fetchData();
  }, [userProfile]);

  const allUsersForProfileLookup = useMemo(() => {
      if (!userProfile) return [];
      // Combine own profile with fetched buddies for easy lookups in child components
      return [userProfile, ...buddies];
  }, [userProfile, buddies]);

  const activeChatBuddyProfile = useMemo(() => {
    if (!activeChat || !userProfile) return null;
    const buddyId = activeChat.participants.find(p => p !== userProfile.uid);
    return allUsersForProfileLookup.find(u => u.uid === buddyId) || null;
  }, [activeChat, userProfile, allUsersForProfileLookup]);

  if (isLoading) {
    return (
       <div className="flex flex-col items-center justify-center h-40 gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Finding students in your stream...</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <ConnectionRequests 
        initialConnections={connections} 
        potentialBuddies={allUsersForProfileLookup}
        onUpdate={(updatedConnections) => setConnections(updatedConnections)}
      />
      
      <ConnectedBuddies
        connections={connections}
        potentialBuddies={allUsersForProfileLookup}
        onStartChat={setActiveChat}
      />
      
      <BuddyMatcher 
        initialBuddies={buddies} 
        initialConnections={connections}
        onUpdate={(updatedConnections) => setConnections(updatedConnections)}
      />
      
      {activeChat && userProfile && activeChatBuddyProfile && (
        <ChatDialog
          connection={activeChat}
          userProfile={userProfile}
          buddyProfile={activeChatBuddyProfile}
          onClose={() => setActiveChat(null)}
        />
      )}
    </div>
  )
}
