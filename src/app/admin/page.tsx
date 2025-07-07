import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CalendarDays, MapPin } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the admin panel. Here you can manage the application's content.
      </p>
      
      <div className="grid gap-6 md:grid-cols-2">
         <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CalendarDays className="text-primary h-5 w-5" /> Manage Schedule
              </CardTitle>
              <CardDescription>
                Add, edit, or remove induction schedule sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Content management UI will be implemented here in Phase 2.</p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <MapPin className="text-primary h-5 w-5" /> Manage Map Locations
              </CardTitle>
              <CardDescription>
                Add or delete points of interest on the campus map.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Content management UI will be implemented here in Phase 2.</p>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
