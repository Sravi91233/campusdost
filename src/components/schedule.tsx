"use client";

import { useState, useEffect, useMemo } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Mic, Users, Award, Bell, CheckCircle } from "lucide-react";

type Session = {
  time: string;
  title: string;
  speaker?: string;
  venue: string;
  description: string;
  type: "talk" | "workshop" | "tour" | "social";
  badge?: string;
  isPast?: boolean;
};

const scheduleData: Session[] = [
  { time: "09:00", title: "Welcome & Registration", venue: "Main Auditorium", description: "Collect your student kit and kick off the day.", type: "social" },
  { time: "10:00", title: "Dean's Inaugural Address", speaker: "Dr. Evelyn Reed", venue: "Main Auditorium", description: "An opening address from the Dean of Academics.", type: "talk", badge: "Initiate" },
  { time: "11:30", title: "Campus Discovery Tour", venue: "Starts at Admin Block", description: "A guided tour of all the important locations on campus.", type: "tour", badge: "Explorer" },
  { time: "13:00", title: "Lunch Break", venue: "Central Canteen", description: "Enjoy a delicious lunch and mingle with fellow students.", type: "social" },
  { time: "14:30", title: "Intro to University Systems", speaker: "Mr. Alan Grant", venue: "Library Seminar Hall", description: "Learn how to use the library, WiFi, and other university digital resources.", type: "workshop", badge: "Tech Savvy" },
  { time: "16:00", title: "Meet Your Department", venue: "Respective Department Blocks", description: "An ice-breaking session with your faculty and classmates.", type: "workshop" },
  { time: "17:30", title: "Student Club Fair", venue: "Sports Complex", description: "Explore various student clubs and find your passion.", type: "social", badge: "Community Builder" },
];

const SessionIcon = ({ type }: { type: Session["type"] }) => {
  switch (type) {
    case "talk": return <Mic className="h-5 w-5 text-accent-foreground" />;
    case "workshop": return <Users className="h-5 w-5 text-accent-foreground" />;
    case "tour": return <MapPin className="h-5 w-5 text-accent-foreground" />;
    case "social": return <Users className="h-5 w-5 text-accent-foreground" />;
    default: return <Clock className="h-5 w-5 text-accent-foreground" />;
  }
};

const NextSessionCard = ({ session }: { session: Session | null }) => {
  if (!session) return null;

  return (
    <Card className="bg-primary/10 border-primary/50 shadow-lg animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-primary">
          <Bell className="animate-pulse" />
          Next Up: {session.title}
        </CardTitle>
        <CardDescription>Happening at {session.time} in {session.venue}</CardDescription>
      </CardHeader>
    </Card>
  );
};


export function Schedule() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const { updatedSchedule, nextSession } = useMemo(() => {
    const now = currentTime;
    let nextSession: Session | null = null;
    const updatedSchedule = scheduleData.map(session => {
      const [hours, minutes] = session.time.split(':').map(Number);
      const sessionTime = new Date(now);
      sessionTime.setHours(hours, minutes, 0, 0);

      const isPast = now > sessionTime;
      if (!isPast && !nextSession) {
        nextSession = session;
      }
      return { ...session, isPast };
    });
    return { updatedSchedule, nextSession };
  }, [currentTime]);

  return (
    <div className="space-y-6">
      <NextSessionCard session={nextSession} />
      <Accordion type="single" collapsible className="w-full">
        {updatedSchedule.map((session, index) => (
          <AccordionItem key={index} value={`item-${index}`} className={session.isPast ? "opacity-60" : ""}>
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-4 w-full">
                <div className={`p-2 rounded-full ${session.isPast ? 'bg-muted' : 'bg-accent'}`}>
                  <SessionIcon type={session.type} />
                </div>
                <div className="flex-grow text-left">
                  <p className="font-bold">{session.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> {session.time}
                  </p>
                </div>
                {session.isPast && <CheckCircle className="h-5 w-5 text-green-500" />}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-16">
              <div className="space-y-3">
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> <strong>Venue:</strong> {session.venue}</p>
                {session.speaker && <p className="flex items-center gap-2"><Mic className="h-4 w-4 text-primary" /> <strong>Speaker:</strong> {session.speaker}</p>}
                <p>{session.description}</p>
                {session.badge && (
                  <Badge variant="secondary" className="mt-2">
                    <Award className="mr-2 h-4 w-4" />
                    Badge Unlocked: {session.badge}
                  </Badge>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
