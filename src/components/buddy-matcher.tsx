
"use client";

import { useState, useMemo } from "react";
import type { Connection, UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendConnectionRequest, acceptConnectionRequest, declineOrCancelRequest } from "@/services/connectionService";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Handshake,
  Clock,
  Check,
  X,
  BellRing,
  Users,
  MessageSquare,
} from 'lucide-react';


interface BuddyMatcherProps {
  potentialBuddies: UserProfile[];
  connections: Connection[];
  onConnectionsUpdate: (connections: Connection[]) => void;
  onStartChat: (connection: Connection) => void;
}

type CategorizedBuddy = {
  profile: UserProfile;
  connection?: Connection;
  status: 'incoming_request' | 'connected' | 'pending_sent' | 'not_connected';
};

export function BuddyMatcher({ potentialBuddies, connections, onConnectionsUpdate, onStartChat }: BuddyMatcherProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const categorizedBuddies = useMemo((): CategorizedBuddy[] => {
    if (!userProfile) return [];

    return potentialBuddies.map(buddy => {
      const connection = connections.find(c => c.participants.includes(buddy.uid));
      
      if (!connection) {
        return { profile: buddy, status: 'not_connected' };
      }

      if (connection.status === 'connected') {
        return { profile: buddy, connection, status: 'connected' };
      }

      if (connection.status === 'pending') {
        if (connection.requestedBy === userProfile.uid) {
          return { profile: buddy, connection, status: 'pending_sent' };
        } else {
          return { profile: buddy, connection, status: 'incoming_request' };
        }
      }

      // Fallback, should not be reached
      return { profile: buddy, status: 'not_connected' };
    });
  }, [potentialBuddies, connections, userProfile]);

  const incomingRequests = useMemo(() => categorizedBuddies.filter(b => b.status === 'incoming_request'), [categorizedBuddies]);
  const connectedBuddies = useMemo(() => categorizedBuddies.filter(b => b.status === 'connected'), [categorizedBuddies]);
  const otherBuddies = useMemo(() => categorizedBuddies.filter(b => b.status === 'not_connected' || b.status === 'pending_sent'), [categorizedBuddies]);


  const handleConnect = async (buddy: UserProfile) => {
    if (!userProfile) return;
    setProcessingId(buddy.uid);
    const result = await sendConnectionRequest(userProfile.uid, buddy.uid);
    if (result.success && result.connection) {
      onConnectionsUpdate([...connections, result.connection]);
      toast({ title: "Request Sent!", description: `Your connection request to ${buddy.name} has been sent.` });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setProcessingId(null);
  };

  const handleAccept = async (connectionId: string) => {
    setProcessingId(connectionId);
    const result = await acceptConnectionRequest(connectionId);
    if (result.success) {
      onConnectionsUpdate(connections.map(c => c.id === connectionId ? { ...c, status: 'connected' } : c));
      toast({ title: "Connection accepted!" });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setProcessingId(null);
  };

  const handleDeclineOrCancel = async (connectionId: string) => {
    setProcessingId(connectionId);
    const result = await declineOrCancelRequest(connectionId);
    if (result.success) {
      onConnectionsUpdate(connections.filter(c => c.id !== connectionId));
      toast({ title: "Request Removed" });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setProcessingId(null);
  };
  
  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      {/* Incoming Requests Section */}
      {incomingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-1"><BellRing className="h-4 w-4 text-primary" /> Connection Requests</h3>
          {incomingRequests.map(({ profile, connection }) => {
            if (!connection) return null;
            const isProcessing = processingId === connection.id;
            return (
              <Card key={profile.uid}>
                <CardContent className="p-3 flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={`https://placehold.co/40x40.png`} alt={profile.name} data-ai-hint="person face" />
                    <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">Wants to connect</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="outline" className="h-9 w-9 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleAccept(connection.id)} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button size="icon" variant="outline" className="h-9 w-9 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeclineOrCancel(connection.id)} disabled={isProcessing}>
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
           <Separator />
        </div>
      )}

      {/* Connected Buddies Section */}
      {connectedBuddies.length > 0 && (
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-1"><Users className="h-4 w-4 text-primary" /> My Connections</h3>
             <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {connectedBuddies.map(({ profile, connection }) => {
                    if (!connection) return null;
                    return (
                        <Card key={profile.uid} className="transition-all hover:bg-muted/50">
                            <CardContent className="p-3 flex items-center gap-4">
                                <Avatar>
                                    <AvatarImage src={`https://placehold.co/40x40.png`} alt={profile.name} data-ai-hint="person face" />
                                    <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold">{profile.name}</p>
                                    <p className="text-xs text-muted-foreground">{profile.registrationNo}</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => onStartChat(connection)}>
                                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
            <Separator />
        </div>
      )}

      {/* Other Students Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-1">
          Other Students in {userProfile.stream}
        </h3>
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
           {otherBuddies.length > 0 ? (
            otherBuddies.map(({ profile, connection, status }) => {
                const isProcessing = processingId === profile.uid || processingId === connection?.id;
                let button;
                switch (status) {
                case 'pending_sent':
                    button = <Button size="sm" variant="outline" onClick={() => connection && handleDeclineOrCancel(connection.id)} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Clock className="h-4 w-4 mr-2"/> Sent</>}
                            </Button>;
                    break;
                case 'not_connected':
                    button = <Button size="sm" variant="default" onClick={() => handleConnect(profile)} disabled={isProcessing}>
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Handshake className="h-4 w-4 mr-2"/> Connect</>}
                            </Button>;
                    break;
                default:
                    button = null;
                }

                return (
                    <Card key={profile.uid} className="transition-all hover:bg-muted/50">
                        <CardContent className="p-3 flex items-center gap-4">
                        <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png`} alt={profile.name} data-ai-hint="person face" />
                            <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{profile.name}</p>
                            <p className="text-xs text-muted-foreground">{profile.registrationNo}</p>
                        </div>
                        {button}
                        </CardContent>
                    </Card>
                )
            })
            ) : (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-center text-sm text-muted-foreground">
                    <p>No other students found in your stream right now.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
