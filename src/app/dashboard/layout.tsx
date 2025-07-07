import { ProtectedRoute } from "@/components/protected-route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpenCheck, User } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { MapProvider } from "@/context/MapContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MapProvider>
        <div className="min-h-screen bg-background font-body">
          <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <BookOpenCheck className="h-7 w-7 text-primary" />
                <span className="font-bold text-xl font-headline">Campus Compass</span>
              </Link>
              <div className="flex items-center gap-4">
                <LogoutButton />
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" alt="Student" />
                  <AvatarFallback>
                    <User />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="container py-8">{children}</main>
        </div>
      </MapProvider>
    </ProtectedRoute>
  );
}
