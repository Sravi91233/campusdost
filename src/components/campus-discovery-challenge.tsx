"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, HelpCircle, Loader2, MapPin, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMap } from '@/context/MapContext';
import { cn } from '@/lib/utils';
import type { MapLocation } from '@/types';

// Let's define our challenge locations. We can reuse MapLocation type.
// In a real app, this might come from a service.
const challengeLocations: (MapLocation & { badge: string })[] = [
  { id: 'cl1', name: 'Main Library', description: '', icon: 'Library', position: { lat: 31.2560, lng: 75.7050 }, badge: 'Bookworm' },
  { id: 'cl2', name: 'Student Union Building', description: '', icon: 'Building2', position: { lat: 31.2545, lng: 75.7065 }, badge: 'Socialite' },
  { id: 'cl3', name: 'Sports Complex', description: '', icon: 'Landmark', position: { lat: 31.2520, lng: 75.7080 }, badge: 'Athlete' },
];

// Earth radius in meters
const R = 6371e3;
// Distance threshold in meters to consider a "check-in" valid
const CHECK_IN_THRESHOLD_METERS = 50; 

function getDistance(pos1: { lat: number; lng: number }, pos2: { lat: number; lng: number }) {
  const phi1 = pos1.lat * Math.PI / 180;
  const phi2 = pos2.lat * Math.PI / 180;
  const deltaPhi = (pos2.lat - pos1.lat) * Math.PI / 180;
  const deltaLambda = (pos2.lng - pos1.lng) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
}

export function CampusDiscoveryChallenge() {
  const { toast } = useToast();
  const { setFocusedVenueName } = useMap();
  const [visitedStatus, setVisitedStatus] = useState<Record<string, boolean>>({});
  const [isCheckingIn, setIsCheckingIn] = useState<string | null>(null);

  const handleCheckIn = (location: MapLocation) => {
    setIsCheckingIn(location.id);

    if (!navigator.geolocation) {
      toast({ title: 'Geolocation is not supported by your browser.', variant: 'destructive' });
      setIsCheckingIn(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        const distance = getDistance(userPosition, location.position);

        if (distance <= CHECK_IN_THRESHOLD_METERS) {
          setVisitedStatus(prev => ({ ...prev, [location.id]: true }));
          toast({ title: 'Check-in successful!', description: `You've earned the ${challengeLocations.find(l => l.id === location.id)?.badge} badge!` });
        } else {
          toast({ title: 'Not quite there yet!', description: `You need to be within ${CHECK_IN_THRESHOLD_METERS} meters of ${location.name}. You are ~${Math.round(distance)}m away.`, variant: 'destructive' });
        }
        setIsCheckingIn(null);
      },
      () => {
        toast({ title: 'Unable to retrieve your location.', description: 'Please ensure you have enabled location services for your browser.', variant: 'destructive' });
        setIsCheckingIn(null);
      }
    );
  };
  
  const allVisited = challengeLocations.every(loc => visitedStatus[loc.id]);

  return (
    <div className="space-y-4">
      {allVisited ? (
         <div className="flex flex-col items-center justify-center text-center p-8 bg-accent/20 rounded-lg">
            <Trophy className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="font-bold text-lg">Challenge Complete!</h3>
            <p className="text-muted-foreground text-sm">You've visited all locations. Congratulations, explorer!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {challengeLocations.map(location => {
            const isVisited = !!visitedStatus[location.id];
            return (
              <li key={location.id}>
                <Card className={cn("transition-all", isVisited ? "bg-muted/50 opacity-70" : "hover:bg-muted")}>
                  <CardContent className="p-3 flex items-center gap-4">
                     <div className="flex-grow">
                        <p className="font-semibold flex items-center gap-2">
                           {isVisited ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <HelpCircle className="h-5 w-5 text-primary" />}
                           {location.name}
                        </p>
                        <p className="text-xs text-muted-foreground ml-7">Badge reward: <span className="font-bold">{location.badge}</span></p>
                     </div>
                     <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" onClick={() => setFocusedVenueName(location.name)}>
                           <MapPin className="h-4 w-4"/>
                           <span className="sr-only">Show on map</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleCheckIn(location)}
                          disabled={isVisited || isCheckingIn !== null}
                        >
                          {isCheckingIn === location.id ? <Loader2 className="h-4 w-4 animate-spin"/> : (isVisited ? 'Visited' : 'Check In')}
                        </Button>
                     </div>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  );
}
