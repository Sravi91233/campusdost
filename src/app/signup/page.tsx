"use client";

import { useAuth } from "@/context/AuthContext";
import { SignUpForm } from "@/components/signup-form";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const { userProfile, loading } = useAuth();
  
  // Show a loader while the initial auth check is running,
  // or if we have a user and are about to be redirected by the AuthRouter.
  if (loading || userProfile) {
     return (
      <main className="flex items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }
  
  // If not loading and no user exists, show the sign-up form.
  return (
    <main className="flex items-center justify-center min-h-screen bg-background p-4">
      <SignUpForm />
    </main>
  );
}
