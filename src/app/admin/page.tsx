import { ScheduleManager } from "@/components/admin-schedule-manager";
import { AdminMapManager } from "@/components/admin-map-manager";
import { AdminMapConfig } from "@/components/admin-map-config";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CalendarDays, MapPin, BoxSelect } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-headline">
            <CalendarDays className="text-primary h-6 w-6" /> Manage Induction Schedule
          </CardTitle>
          <CardDescription>
            Add, edit, or delete sessions for the student induction. Changes will be reflected on the dashboard immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleManager />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-headline">
            <MapPin className="text-primary h-6 w-6" /> Manage Map Locations
          </CardTitle>
          <CardDescription>
            Add, edit, or delete interactive map markers. You can use an online tool to find the latitude and longitude for each location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminMapManager />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-headline">
            <BoxSelect className="text-primary h-6 w-6" /> Configure Map Boundaries
          </CardTitle>
          <CardDescription>
            Set the draggable boundaries for the campus map to control the visible area for users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminMapConfig />
        </CardContent>
      </Card>
    </div>
  );
}
