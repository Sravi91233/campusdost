"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { SignUpForm } from "@/components/signup-form";
import { Loader2 } from "lucide-react";

export default function SignUpPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial loading is done, and we have a user and their profile.
    if (!loading && user && userProfile) {
      // New users are always 'user' role, so redirect to dashboard.
      // An admin might be viewing this page while logged in, so handle that case.
      if (userProfile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);
  
  // If the auth state is loading, or if a user is logged in but we are waiting
  // for the redirect to happen, show a loading spinner.
  if (loading || user) {
     return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }
  
  // If not loading and no user exists, show the sign-up form.
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <SignUpForm />
    </main>
  );
}
