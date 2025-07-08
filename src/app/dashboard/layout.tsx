import { ProtectedRoute } from "@/components/protected-route";
import { BookOpenCheck, LayoutGrid, Calendar, Map, Handshake, Bot, Trophy, MessageSquare } from "lucide-react";
import Link from "next/link";
import { MapProvider } from "@/context/MapContext";
import { UserNav } from "@/components/user-nav";
import { NotificationProvider } from "@/context/NotificationContext";
import { NotificationBell } from "@/components/notification-bell";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <NotificationProvider>
        <MapProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarHeader>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <BookOpenCheck className="h-7 w-7 text-primary" />
                  <span className="font-bold text-xl font-headline">Campus Compass</span>
                </Link>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard">
                        <LayoutGrid />
                        Dashboard
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard#schedule">
                        <Calendar />
                        Schedule
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard#map">
                        <Map />
                        Map
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard#buddy-feature-card">
                        <Handshake />
                        Find a Buddy
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard#ai-assistant">
                        <Bot />
                        AI Assistant
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                   <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard#discovery-challenge">
                        <Trophy />
                        Challenge
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/dashboard#feedback">
                        <MessageSquare />
                        Feedback
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>

            <SidebarInset>
              <div className="min-h-screen bg-background font-body">
                <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <SidebarTrigger className="md:hidden"/>
                      <div className="hidden md:block font-bold text-xl font-headline">Student Dashboard</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <NotificationBell />
                      <UserNav />
                    </div>
                  </div>
                </header>
                <main className="container py-8">{children}</main>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </MapProvider>
      </NotificationProvider>
    </ProtectedRoute>
  );
}
