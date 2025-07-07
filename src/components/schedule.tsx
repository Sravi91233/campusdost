
"use client";

import type { ScheduleSession as Session } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Mic, Users, Award, Bell, CheckCircle, Calendar } from "lucide-react";
import { useMap } from "@/context/MapContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

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
  if (!session) return (
     <Card className="bg-primary/10 border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-primary">
          <CheckCircle />
          Induction Complete!
        </CardTitle>
        <CardDescription>All sessions for today are over. Well done!</CardDescription>
      </CardHeader>
    </Card>
  );

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


export function Schedule({ scheduleData }: { scheduleData: Session[] }) {
  const { setFocusedVenueName } = useMap();
  const { userProfile, loading: authLoading } = useAuth();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const studentSchedule = useMemo(() => {
    if (!userProfile?.inductionDate) {
      return [];
    }

    const userInductionDateObj = new Date(userProfile.inductionDate);
    if (isNaN(userInductionDateObj.getTime())) {
      return []; // Invalid induction date on profile
    }
    
    // Get the UTC date string 'YYYY-MM-DD'
    const userInductionDateString = userInductionDateObj.toISOString().split('T')[0];

    return scheduleData.filter(session => {
      if (!session.date) {
        return false;
      }
      const sessionDateObj = new Date(session.date);
      if (isNaN(sessionDateObj.getTime())) {
        return false; // Skip sessions with invalid dates
      }
      
      const sessionDateString = sessionDateObj.toISOString().split('T')[0];
      
      return sessionDateString === userInductionDateString;
    });
  }, [scheduleData, userProfile]);
  
  const formattedInductionDate = useMemo(() => {
    if (userProfile?.inductionDate) {
      try {
        return format(new Date(userProfile.inductionDate), "PPP");
      } catch (error) {
        return "Invalid Date";
      }
    }
    return null;
  }, [userProfile]);

  if (authLoading || !now) {
    // Show a comprehensive skeleton UI while auth or date is loading
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <Skeleton className="h-[96px] w-full" />
            <div className="w-full space-y-2">
              <Skeleton className="h-[73px] w-full" />
              <Skeleton className="h-[73px] w-full" />
              <Skeleton className="h-[73px] w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  let nextSession: Session | null = null;
  const updatedSchedule = studentSchedule.map(session => {
    const [hours, minutes] = session.time.split(':').map(Number);
    const sessionTime = new Date(now);
    sessionTime.setHours(hours, minutes, 0, 0);

    const isPast = now.getTime() > sessionTime.getTime();
    if (!isPast && !nextSession) {
      nextSession = session;
    }
    return { ...session, isPast };
  });

  return (
     <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Calendar /> Induction Schedule</CardTitle>
        {formattedInductionDate && (
          <CardDescription>Your schedule for: {formattedInductionDate}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {studentSchedule.length === 0 ? (
          <p className="text-muted-foreground text-center p-8">No induction sessions scheduled for your selected date. Please check with the administration.</p>
        ) : (
          <div className="space-y-6">
            <NextSessionCard session={nextSession} />
            <Accordion type="single" collapsible className="w-full">
              {updatedSchedule.map((session, index) => (
                <AccordionItem key={session.id || index} value={`item-${index}`} className={session.isPast ? "opacity-60" : ""}>
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
                      <div className="flex items-center justify-between pt-2">
                          {session.badge ? (
                            <Badge variant="secondary">
                              <Award className="mr-2 h-4 w-4" />
                              Badge Unlocked: {session.badge}
                            </Badge>
                          ) : <div/>}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setFocusedVenueName(session.venue)}
                            className="ml-auto"
                          >
                            <MapPin className="mr-2 h-4 w-4" />
                            View on Map
                          </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
