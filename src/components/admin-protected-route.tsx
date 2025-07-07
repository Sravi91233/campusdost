"use client";

import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();

  // While auth state is loading OR if the user profile is still loading, show a spinner.
  // The AuthRouter will handle redirection if the user is not authenticated or not an admin.
  if (loading || !userProfile) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If the user's role is admin, render the admin content.
  // Otherwise, render a loader, as AuthRouter is handling the redirect.
  if (userProfile.role === 'admin') {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
