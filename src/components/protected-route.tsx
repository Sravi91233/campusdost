"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // While the initial auth check is happening, show a loader.
  // The AuthRouter will handle redirection if the user is not authenticated.
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
