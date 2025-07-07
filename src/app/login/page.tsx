"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/login-form";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait until the initial loading is done, and we have a user and their profile.
    if (!loading && user && userProfile) {
      if (userProfile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  // If the auth state is loading, or if a user is logged in but we are waiting
  // for the redirect to happen, show a loading spinner. This prevents the form from
  // flashing briefly for an already-logged-in user.
  if (loading || user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  // If not loading and no user exists, show the login form.
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <LoginForm />
    </main>
  );
}
