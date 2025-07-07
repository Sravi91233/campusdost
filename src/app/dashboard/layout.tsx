import { ProtectedRoute } from "@/components/protected-route";
import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { MapProvider } from "@/context/MapContext";
import { UserNav } from "@/components/user-nav";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationBell } from "@/components/notification-bell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <MapProvider>
          <div className="min-h-screen bg-background font-body">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <BookOpenCheck className="h-7 w-7 text-primary" />
                  <span className="font-bold text-xl font-headline">Campus Compass</span>
                </Link>
                <div className="flex items-center gap-4">
                  <NotificationBell />
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="container py-8">{children}</main>
          </div>
        </MapProvider>
      </NotificationProvider>
    </ProtectedRoute>
  );
}
