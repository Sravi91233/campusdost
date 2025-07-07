
"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/services/scheduleService";
import { getVisibleLocations } from "@/services/locationService";
import { getMapCorners } from "@/services/mapConfigService";
import { Schedule } from "@/components/schedule";
import { CampusMap } from "@/components/campus-map";
import { Chatbot } from "@/components/chatbot";
import { BuddyMatcher } from "@/components/buddy-matcher";
import { FeedbackForm } from "@/components/feedback-form";
import { CampusDiscoveryChallenge } from "@/components/campus-discovery-challenge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, Bot, MessageSquare, Compass, Handshake, Loader2, BellRinging } from "lucide-react";
import type { ScheduleSession, MapLocation, MapCorners, UserProfile, Connection } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getUsersByStream } from "@/services/userService";
import { getConnectionsForUser } from "@/services/connectionService";
import { ConnectionRequests } from "@/components/ConnectionRequests";


// Wrapper component to handle client-side data fetching for buddy-related features
function BuddyFeatureWrapper() {
  const { userProfile } = useAuth();
  const [buddies, setBuddies] = useState<UserProfile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) {
    return (
       <div className="flex flex-col items-center justify-center h-40 gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Finding students in your stream...</p>
      </div>
    );
  }
  
  const potentialBuddies = buddies.filter(b => {
    const conn = connections.find(c => c.participants.includes(b.uid));
    return !conn || conn.status === 'pending';
  });

  return (
    <div className='space-y-4'>
      <ConnectionRequests 
        initialConnections={connections} 
        potentialBuddies={[...buddies, userProfile!]} // Pass all potential users for profile lookups
        onUpdate={(updatedConnections) => setConnections(updatedConnections)}
      />
      <BuddyMatcher 
        initialBuddies={potentialBuddies} 
        initialConnections={connections}
        onUpdate={(updatedConnections) => setConnections(updatedConnections)}
      />
    </div>
  )
}


export default function DashboardPage() {
  // Data fetching for non-user-specific content can remain here.
  const [scheduleData, setScheduleData] = useState<ScheduleSession[]>([]);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [mapCorners, setMapCorners] = useState<MapCorners | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      const [schedule, locations, corners] = await Promise.all([
        getSchedule(),
        getVisibleLocations(),
        getMapCorners()
      ]);
      setScheduleData(schedule);
      setMapLocations(locations);
      setMapCorners(corners);
      setIsLoading(false);
    }
    fetchInitialData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your induction week hub!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          <Schedule scheduleData={scheduleData} />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Compass /> Interactive Campus Map</CardTitle>
            </CardHeader>
            <CardContent>
              <CampusMap initialLocations={mapLocations} initialCorners={mapCorners} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Handshake /> Find a Buddy</CardTitle>
            </CardHeader>
            <CardContent>
              <BuddyFeatureWrapper />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Chatbot />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users /> Campus Discovery Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <CampusDiscoveryChallenge />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquare/> Session Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <FeedbackForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
