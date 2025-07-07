import { Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AdminProtectedRoute } from "@/components/admin-protected-route";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50 font-body">
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl font-headline">Admin Panel</span>
            </Link>
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </header>
        <main className="container py-8">{children}</main>
      </div>
    </AdminProtectedRoute>
  );
}
