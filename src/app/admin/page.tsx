import { ScheduleManager } from "@/components/admin-schedule-manager";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

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
    </div>
  );
}
