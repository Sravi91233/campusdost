
import { CampusMap } from "@/components/campus-map";
import { Chatbot } from "@/components/chatbot";
import { Schedule } from "@/components/schedule";
import { BuddyMatcher } from "@/components/buddy-matcher";
import { FeedbackForm } from "@/components/feedback-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Map, MessageCircle, Users, FileText, CalendarDays } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-2 space-y-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-headline"><CalendarDays className="text-primary h-6 w-6"/> Your Induction Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <Schedule />
          </CardContent>
        </Card>
        
        {/* The Card wrapper has been temporarily removed for diagnostics */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
           <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl font-headline"><Map className="text-primary h-6 w-6"/> Interactive Campus Map</CardTitle>
          </CardHeader>
          <CardContent>
            <CampusMap />
          </CardContent>
        </div>

      </div>

      <div className="space-y-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline"><MessageCircle className="text-primary h-5 w-5"/> AI Chatbot Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <Chatbot />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline"><Users className="text-primary h-5 w-5"/> Find Your Buddy</CardTitle>
          </CardHeader>
          <CardContent>
            <BuddyMatcher />
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-headline"><FileText className="text-primary h-5 w-5"/> Session Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <FeedbackForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
