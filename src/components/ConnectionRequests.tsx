
"use client";

import { useState, useMemo } from 'react';
import type { Connection, UserProfile } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, Loader2, BellRinging } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { acceptConnectionRequest, declineOrCancelRequest } from '@/services/connectionService';
import { Separator } from './ui/separator';

interface ConnectionRequestsProps {
  initialConnections: Connection[];
  potentialBuddies: UserProfile[];
  onUpdate: (connections: Connection[]) => void;
}

export function ConnectionRequests({ initialConnections, potentialBuddies, onUpdate }: ConnectionRequestsProps) {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  if (!userProfile) return null;

  const incomingRequests = useMemo(() => {
    return initialConnections.filter(c =>
        c.status === 'pending' && c.requestedBy !== userProfile.uid
    );
  }, [initialConnections, userProfile.uid]);

  const getRequesterProfile = (connection: Connection): UserProfile | undefined => {
    return potentialBuddies.find(buddy => buddy.uid === connection.requestedBy);
  };

  const handleAccept = async (connectionId: string) => {
    setProcessingId(connectionId);
    const result = await acceptConnectionRequest(connectionId);
    if (result.success) {
      onUpdate(initialConnections.map(c => c.id === connectionId ? { ...c, status: 'connected' } : c));
      toast({ title: "Connection accepted!" });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setProcessingId(null);
  };

  const handleDecline = async (connectionId: string) => {
    setProcessingId(connectionId);
    const result = await declineOrCancelRequest(connectionId);
    if (result.success) {
      onUpdate(initialConnections.filter(c => c.id !== connectionId));
      toast({ title: "Request declined." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setProcessingId(null);
  };

  if (incomingRequests.length === 0) {
    return null; // Don't render anything if there are no requests
  }
  
  return (
    <div className='space-y-4'>
        <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 px-1"><BellRinging className="h-4 w-4 text-primary" /> Connection Requests</h3>
            {incomingRequests.map(req => {
                const requester = getRequesterProfile(req);
                if (!requester) return null;

                const isProcessing = processingId === req.id;

                return (
                <Card key={req.id}>
                    <CardContent className="p-3 flex items-center gap-4">
                    <Avatar>
                        <AvatarImage src={`https://placehold.co/40x40.png`} alt={requester.name} data-ai-hint="person face" />
                        <AvatarFallback>{requester.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                        <p className="font-semibold">{requester.name}</p>
                        <p className="text-sm text-muted-foreground">Wants to connect</p>
                    </div>
                    <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="h-9 w-9 border-green-500 text-green-500 hover:bg-green-500/10 hover:text-green-600" onClick={() => handleAccept(req.id)} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button size="icon" variant="outline" className="h-9 w-9 border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDecline(req.id)} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                        </Button>
                    </div>
                    </CardContent>
                </Card>
                );
            })}
        </div>
        <Separator />
    </div>
  );
}
