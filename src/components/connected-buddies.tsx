
"use client";

import { useMemo } from 'react';
import type { Connection, UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users } from 'lucide-react';
import { Separator } from './ui/separator';

interface ConnectedBuddiesProps {
  connections: Connection[];
  potentialBuddies: UserProfile[]; // Used for name/avatar lookup
  onStartChat: (connection: Connection) => void;
}

export function ConnectedBuddies({ connections, potentialBuddies, onStartChat }: ConnectedBuddiesProps) {
  const { userProfile } = useAuth();

  if (!userProfile) return null;

  const connectedBuddies = useMemo(() => {
    return connections
      .filter(c => c.status === 'connected')
      .map(c => {
        const buddyId = c.participants.find(p => p !== userProfile.uid);
        const buddyProfile = potentialBuddies.find(b => b.uid === buddyId);
        return { connection: c, buddyProfile };
      })
      .filter(item => item.buddyProfile); // Ensure we found a profile
  }, [connections, potentialBuddies, userProfile.uid]);

  if (connectedBuddies.length === 0) {
    return null;
  }

  return (
    <div className='space-y-4'>
        <Separator />
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-1"><Users className="h-4 w-4 text-primary" /> My Connections</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {connectedBuddies.map(({ connection, buddyProfile }) => {
                if (!buddyProfile) return null;
                return (
                    <div key={connection.id} className="p-2 flex items-center gap-4 rounded-lg hover:bg-muted/50">
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png`} alt={buddyProfile.name} data-ai-hint="person face" />
                            <AvatarFallback>{buddyProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{buddyProfile.name}</p>
                            <p className="text-xs text-muted-foreground">{buddyProfile.stream}</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => onStartChat(connection)}>
                            <MessageSquare className="mr-2 h-4 w-4" /> Message
                        </Button>
                    </div>
                );
            })}
            </div>
        </div>
    </div>
  );
}
