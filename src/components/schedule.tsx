
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

/**
 * Takes a date string (either 'YYYY-MM-DD' or a full ISO string like '...Z')
 * and returns the UTC calendar date in 'YYYY-MM-DD' format.
 * This is crucial for correctly identifying the date regardless of time or timezone.
 * e.g., '2025-07-20T23:59:59Z' (almost July 21st) correctly returns '2025-07-20'.
 */
function getUTCDateString(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    // For 'YYYY-MM-DD', new Date() parses it as UTC midnight.
    // For '...Z', new Date() parses it as the correct moment in time.
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return null;
  }
}

/**
 * Takes a 'YYYY-MM-DD' string and returns a Date object suitable for display
 * in the user's local timezone without shifting the calendar day.
 */
function getDisplayDate(utcDateString: string | null): Date | null {
    if (!utcDateString) return null;
    // By splitting and creating a new date, we force it to be interpreted in local time.
    // E.g., '2025-07-20' -> new Date(2025, 6, 20) -> July 20th local time.
    const parts = utcDateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

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

  const userInductionDateString = useMemo(() => getUTCDateString(userProfile?.inductionDate), [userProfile]);

  const studentSchedule = useMemo(() => {
    if (!userInductionDateString) return [];
    return scheduleData.filter(session => session.date === userInductionDateString);
  }, [scheduleData, userInductionDateString]);
  
  const formattedInductionDate = useMemo(() => {
    const displayDate = getDisplayDate(userInductionDateString);
    if (!displayDate) return userInductionDateString ? "Invalid Date" : null;
    return format(displayDate, "PPP");
  }, [userInductionDateString]);


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
  const todayString = format(now, 'yyyy-MM-dd');

  const updatedSchedule = studentSchedule.map(session => {
    let isPast = false;
    // Only determine past status if we are viewing today's schedule
    if (session.date === todayString) {
      const [hours, minutes] = session.time.split(':').map(Number);
      const sessionTime = new Date(now);
      sessionTime.setHours(hours, minutes, 0, 0);
      isPast = now.getTime() > sessionTime.getTime();
      if (!isPast && !nextSession) {
        nextSession = session;
      }
    }
    return { ...session, isPast };
  });

  // If today's local date doesn't match the user's induction date, there is no "next" session.
  if (userInductionDateString !== todayString) {
    nextSession = null;
  }


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
            {/* Only show the NextSessionCard if today is the induction day */}
            {userInductionDateString === todayString && <NextSessionCard session={nextSession} />}
            
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
