
"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/services/scheduleService";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getMapCorners } from "@/services/mapConfigService";
import { Schedule } from "@/components/schedule";
import { CampusMap } from "@/components/campus-map";
import { Chatbot } from "@/components/chatbot";
import { BuddyFeatureWrapper } from "@/components/buddy-feature-wrapper";
import { FeedbackForm } from "@/components/feedback-form";
import { CampusDiscoveryChallenge } from "@/components/campus-discovery-challenge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Bot, MessageSquare, Compass, Handshake } from "lucide-react";
import type { ScheduleSession, MapLocation, MapCorners } from "@/types";

export default function DashboardPage() {
  const [scheduleData, setScheduleData] = useState<ScheduleSession[]>([]);
  const [mapLocations, setMapLocations] = useState<MapLocation[]>([]);
  const [mapCorners, setMapCorners] = useState<MapCorners | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      // Fetch static data once
      const [schedule, corners] = await Promise.all([
        getSchedule(),
        getMapCorners()
      ]);
      setScheduleData(schedule);
      setMapCorners(corners);
      setIsLoading(false);
    }
    fetchInitialData();

    // Set up a real-time listener for map locations directly in the component.
    const visibleLocationsDocRef = doc(db, 'map-data', 'visible');
    const unsubscribe = onSnapshot(visibleLocationsDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMapLocations(Array.isArray(data.locations) ? data.locations : []);
      } else {
        setMapLocations([]);
      }
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
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
          <div id="schedule" className="scroll-mt-24">
            <Schedule scheduleData={scheduleData} />
          </div>
          <Card id="map" className="scroll-mt-24">
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
           <Card id="buddy-feature-card" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Handshake /> Find a Buddy</CardTitle>
            </CardHeader>
            <CardContent>
              <BuddyFeatureWrapper />
            </CardContent>
          </Card>
          <Card id="ai-assistant" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Chatbot />
            </CardContent>
          </Card>
          <Card id="discovery-challenge" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users /> Campus Discovery Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <CampusDiscoveryChallenge />
            </CardContent>
          </Card>
           <Card id="feedback" className="scroll-mt-24">
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
