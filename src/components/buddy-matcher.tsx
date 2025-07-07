
"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Handshake, Loader2, Clock, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import type { UserProfile, Connection } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { sendConnectionRequest, declineOrCancelRequest } from "@/services/connectionService";

interface BuddyMatcherProps {
  initialBuddies: UserProfile[];
  initialConnections: Connection[];
  onUpdate: (connections: Connection[]) => void;
}

type ConnectionStatus = 'not_connected' | 'pending_sent' | 'connected';

export function BuddyMatcher({ initialBuddies, initialConnections, onUpdate }: BuddyMatcherProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [buddies] = useState<UserProfile[]>(initialBuddies);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getConnectionStatus = (buddyId: string): { status: ConnectionStatus, connectionId: string | null } => {
    if (!userProfile) return { status: 'not_connected', connectionId: null };
    
    const connection = initialConnections.find(c =>
      c.participants.includes(userProfile.uid) && c.participants.includes(buddyId)
    );

    if (!connection) {
      return { status: 'not_connected', connectionId: null };
    }

    if (connection.status === 'connected') {
      return { status: 'connected', connectionId: connection.id };
    }

    // A pending request exists, but we only care about ones this user sent.
    // Incoming requests are handled by the ConnectionRequests component.
    if (connection.status === 'pending' && connection.requestedBy === userProfile.uid) {
      return { status: 'pending_sent', connectionId: connection.id };
    }

    // Buddy has a pending request with someone else, or an incoming one for us. Treat as not connected for this component's purpose.
    return { status: 'not_connected', connectionId: null };
  };

  const handleConnect = async (buddy: UserProfile) => {
    if (!userProfile) return;
    setProcessingId(buddy.uid);
    const result = await sendConnectionRequest(userProfile.uid, buddy.uid);
    if (result.success && result.connection) {
      onUpdate([...initialConnections, result.connection]);
      toast({ title: "Request Sent!", description: `Your connection request to ${buddy.name} has been sent.` });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setProcessingId(null);
  };
  
  const handleCancelRequest = async (connectionId: string, buddy: UserProfile) => {
      setProcessingId(buddy.uid);
      const result = await declineOrCancelRequest(connectionId);
      if (result.success) {
          onUpdate(initialConnections.filter(c => c.id !== connectionId));
          toast({ title: "Request Cancelled" });
      } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
      }
      setProcessingId(null);
  }

  const buddiesToShow = useMemo(() => {
    if (!userProfile) return [];
    return buddies.filter(buddy => {
      const { status } = getConnectionStatus(buddy.uid);
      return status !== 'connected';
    });
  }, [buddies, initialConnections, userProfile]);


  if (!userProfile) {
     return (
      <div className="flex flex-col items-center justify-center h-40 gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Connect with students from the <span className="font-bold text-foreground">{userProfile?.stream || '...'}</span> stream.
      </p>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {buddiesToShow.length > 0 ? (
          buddiesToShow.map(buddy => {
            const { status, connectionId } = getConnectionStatus(buddy.uid);
            const isProcessing = processingId === buddy.uid;

            // This component no longer shows connected or pending_received states,
            // as those are handled elsewhere.
            if (status === 'connected') return null;

            let button;
            switch (status) {
              case 'pending_sent':
                button = <Button size="sm" variant="outline" onClick={() => connectionId && handleCancelRequest(connectionId, buddy)} disabled={isProcessing}>
                           {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Clock className="h-4 w-4 mr-2"/> Sent</>}
                         </Button>;
                break;
              default:
                button = <Button size="sm" variant="default" onClick={() => handleConnect(buddy)} disabled={isProcessing}>
                           {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Handshake className="h-4 w-4 mr-2"/> Connect</>}
                         </Button>;
                break;
            }

            return (
              <Card key={buddy.uid} className="transition-all hover:bg-muted/50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://placehold.co/40x40.png`} alt={buddy.name} data-ai-hint="person face" />
                      <AvatarFallback>{buddy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <p className="font-semibold">{buddy.name}</p>
                      <p className="text-xs text-muted-foreground">{buddy.registrationNo}</p>
                    </div>
                    {button}
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
             <p className="font-semibold">All Caught Up!</p>
             <p className="text-sm text-muted-foreground">
                There are no new students to connect with in your stream right now.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
