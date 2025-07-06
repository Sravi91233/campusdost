"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Handshake } from 'lucide-react';
import { Button } from "@/components/ui/button";

type Buddy = {
  name: string;
  avatar: string;
  interests: string[];
};

const allInterests = ["Tech", "Design", "Sports", "Music", "Literature", "Gaming"];

const allBuddies: Buddy[] = [
  { name: "Alex Ray", avatar: "https://placehold.co/40x40.png", interests: ["Tech", "Gaming"] },
  { name: "Jordan Lee", avatar: "https://placehold.co/40x40.png", interests: ["Sports", "Music"] },
  { name: "Casey Kim", avatar: "https://placehold.co/40x40.png", interests: ["Design", "Literature"] },
  { name: "Morgan Pat", avatar: "https://placehold.co/40x40.png", interests: ["Tech", "Literature"] },
  { name: "Taylor B.", avatar: "https://placehold.co/40x40.png", interests: ["Music", "Gaming", "Design"] },
  { name: "Sam Jones", avatar: "https://placehold.co/40x40.png", interests: ["Sports", "Tech"] },
];

export function BuddyMatcher() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const filteredBuddies = useMemo(() => {
    if (selectedInterests.length === 0) {
      return [];
    }
    return allBuddies.filter(buddy =>
      selectedInterests.every(interest => buddy.interests.includes(interest))
    ).slice(0, 3); // Limit to 3 matches
  }, [selectedInterests]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">Select your interests to find like-minded people!</p>
        <ToggleGroup
          type="multiple"
          variant="outline"
          value={selectedInterests}
          onValueChange={(value) => setSelectedInterests(value)}
          className="flex-wrap justify-start"
        >
          {allInterests.map(interest => (
            <ToggleGroupItem key={interest} value={interest} aria-label={`Toggle ${interest}`} className="m-1">
              {interest}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="space-y-3">
        {filteredBuddies.length > 0 ? (
          filteredBuddies.map(buddy => (
            <Card key={buddy.name} className="transition-all hover:bg-muted">
              <CardContent className="p-3">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={buddy.avatar} alt={buddy.name} data-ai-hint="person face" />
                    <AvatarFallback>{buddy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-grow">
                    <p className="font-semibold">{buddy.name}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {buddy.interests.map(interest => (
                        <Badge key={interest} variant="secondary" className="text-xs">{interest}</Badge>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Handshake className="h-4 w-4 mr-2"/> Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          selectedInterests.length > 0 && (
            <p className="text-sm text-center text-muted-foreground pt-4">No exact matches found. Try selecting fewer interests.</p>
          )
        )}
      </div>
    </div>
  );
}
