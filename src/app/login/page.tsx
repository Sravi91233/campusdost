"use client";

import { useAuth } from "@/context/AuthContext";
import { LoginForm } from "@/components/login-form";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { user, loading } = useAuth();

  // Show a loader while the initial auth check is running, or if a user is
  // logged in (the AuthRouter will be redirecting them away shortly).
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
