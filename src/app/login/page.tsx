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
    // This effect handles the case where a user is ALREADY logged in
    // and navigates to the login page. It should redirect them away.
    if (!loading && user && userProfile) {
      if (userProfile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);

  // While the initial auth check is running, or if a user is already
  // logged in and we are about to redirect, show a loader.
  if (loading || user) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </main>
    );
  }

  // If we're not loading and there's no user, it's safe to show the form.
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <LoginForm />
    </main>
  );
}
