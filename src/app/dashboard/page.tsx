
"use client";

import { useEffect, useState } from "react";
import { getSchedule } from "@/services/scheduleService";
import { getVisibleLocations } from "@/services/locationService";
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
