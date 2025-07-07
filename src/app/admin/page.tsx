import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ScheduleManager } from "@/components/admin-schedule-manager";
import { AdminMapManager } from "@/components/admin-map-manager";
import { AdminMapConfig } from "@/components/admin-map-config";
import { CalendarDays, MapPin, Map } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-headline">Content Management</h1>
        <p className="text-muted-foreground">
          Manage the application's content for the student dashboard.
        </p>
      </div>
      
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 md:w-auto md:grid-cols-3">
          <TabsTrigger value="schedule"><CalendarDays className="mr-2"/>Schedule</TabsTrigger>
          <TabsTrigger value="locations"><MapPin className="mr-2"/>Map Locations</TabsTrigger>
          <TabsTrigger value="boundaries"><Map className="mr-2"/>Map Boundaries</TabsTrigger>
        </TabsList>
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Manage Schedule</CardTitle>
              <CardDescription>Add, edit, or remove induction schedule sessions.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScheduleManager />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="locations">
          <Card>
            <CardHeader>
              <CardTitle>Manage Map Locations</CardTitle>
              <CardDescription>Add, edit, or remove points of interest on the campus map.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminMapManager />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="boundaries">
          <Card>
            <CardHeader>
              <CardTitle>Configure Map Boundaries</CardTitle>
              <CardDescription>Define the visible and interactive area of the campus map. Ensure your Google Maps API key is set in your environment variables.</CardDescription>
            </CardHeader>
            <CardContent>
              <AdminMapConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
