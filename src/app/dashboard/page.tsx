import { getSchedule } from "@/services/scheduleService";
import { getVisibleLocations } from "@/services/locationService";
import { getMapCorners } from "@/services/mapConfigService";
import { Schedule } from "@/components/schedule";
import { CampusMap } from "@/components/campus-map";
import { Chatbot } from "@/components/chatbot";
import { BuddyMatcher } from "@/components/buddy-matcher";
import { FeedbackForm } from "@/components/feedback-form";
import { CampusDiscoveryChallenge } from "@/components/campus-discovery-challenge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, Users, Bot, MessageSquare, Compass, Handshake } from "lucide-react";

export default async function DashboardPage() {
  const scheduleData = await getSchedule();
  const mapLocations = await getVisibleLocations();
  const mapCorners = await getMapCorners();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your induction week hub!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar /> Induction Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <Schedule scheduleData={scheduleData} />
            </CardContent>
          </Card>
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
              <CardTitle className="flex items-center gap-2"><Bot /> AI Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <Chatbot />
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Handshake /> Find a Buddy</CardTitle>
            </CardHeader>
            <CardContent>
              <BuddyMatcher />
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
