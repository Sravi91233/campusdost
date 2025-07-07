"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect them to the login page.
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  // While the authentication state is loading, or if there is no user,
  // show a loading spinner. This prevents a flash of the dashboard content.
  if (loading || !user) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is complete and we have a user, render the protected content.
  return <>{children}</>;
}
