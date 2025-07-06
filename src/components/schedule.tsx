import { getSchedule } from "@/services/scheduleService";
import type { ScheduleSession as Session } from "@/types";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Mic, Users, Award, Bell, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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


export async function Schedule() {
  let scheduleData: Session[];
  try {
    scheduleData = await getSchedule();
  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Schedule</AlertTitle>
        <AlertDescription>
          Could not connect to the database. This is likely due to Firestore security rules.
          Please check your Firebase project configuration.
        </AlertDescription>
      </Alert>
    );
  }

  const now = new Date();

  let nextSession: Session | null = null;
  const updatedSchedule = scheduleData.map(session => {
    const [hours, minutes] = session.time.split(':').map(Number);
    const sessionTime = new Date(now);
    sessionTime.setHours(hours, minutes, 0, 0);

    const isPast = now.getTime() > sessionTime.getTime();
    if (!isPast && !nextSession) {
      nextSession = session;
    }
    return { ...session, isPast };
  });

  if (scheduleData.length === 0) {
    return <p className="text-muted-foreground text-center">No schedule has been set up yet. Please check back later.</p>
  }

  return (
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
