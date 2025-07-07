"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Handshake, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getUsersByStream } from "@/services/userService";
import type { UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";

export function BuddyMatcher() {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [buddies, setBuddies] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only fetch if we have the necessary user info
    if (userProfile?.stream && userProfile?.uid) {
      const fetchBuddies = async () => {
        setIsLoading(true);
        const fetchedBuddies = await getUsersByStream(userProfile.stream, userProfile.uid);
        setBuddies(fetchedBuddies);
        setIsLoading(false);
      };
      fetchBuddies();
    } else {
        // If there's no user profile, we're not loading anything.
        setIsLoading(false);
    }
  }, [userProfile]);

  const handleConnect = (buddyId: string) => {
    // Phase 2 will implement connection logic.
    toast({
      title: "Coming Soon!",
      description: "The ability to connect and chat is in development.",
    });
    console.log(`Connection request to ${buddyId} initiated.`);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Finding students in your stream...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Students from the <span className="font-bold text-foreground">{userProfile?.stream || '...'}</span> stream.
      </p>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {buddies.length > 0 ? (
          buddies.map(buddy => (
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
                  <Button size="sm" variant="outline" onClick={() => handleConnect(buddy.uid)}>
                    <Handshake className="h-4 w-4 mr-2"/> Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
             <p className="font-semibold">You're a pioneer!</p>
             <p className="text-sm text-muted-foreground">
                Looks like you're one of the first here from your stream. Check back later as more students join.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
