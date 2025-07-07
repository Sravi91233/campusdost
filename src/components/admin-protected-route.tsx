"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until loading is finished

    if (!user) {
      // If not logged in, redirect to the main login page.
      router.replace("/login");
      return;
    }
    
    // If the user profile is loaded and the role is not admin,
    // redirect them to the regular user dashboard.
    if (userProfile && userProfile.role !== 'admin') {
      router.replace("/dashboard");
    }

  }, [user, userProfile, loading, router]);

  // While auth state is loading OR if the user profile is still loading, show a spinner.
  if (loading || !userProfile) {
     return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If the user's role is admin, render the admin content.
  // Otherwise, return null because the useEffect will handle the redirect.
  if (userProfile.role === 'admin') {
    return <>{children}</>;
  }

  return null;
}
