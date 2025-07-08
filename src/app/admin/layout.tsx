import { Shield, CalendarDays, MapPin, Map } from "lucide-react";
import Link from "next/link";
import { AdminProtectedRoute } from "@/components/admin-protected-route";
import { UserNav } from "@/components/user-nav";
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl font-headline">Admin Panel</span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin?tab=schedule">
                    <CalendarDays />
                    Schedule
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin?tab=locations">
                    <MapPin />
                    Map Locations
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin?tab=boundaries">
                    <Map />
                    Map Boundaries
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
                  <div className="hidden md:block font-bold text-xl font-headline">Content Management</div>
                </div>
                <div className="flex items-center gap-4">
                  <UserNav />
                </div>
              </div>
            </header>
            <main className="container py-8">{children}</main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </AdminProtectedRoute>
  );
}
