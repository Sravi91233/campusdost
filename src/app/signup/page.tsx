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
    // This effect handles the case where a user is ALREADY logged in
    // and navigates to the signup page. It should redirect them away.
    if (!loading && user && userProfile) {
      if (userProfile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, userProfile, loading, router]);
  
  // Show a loader while the initial auth check is running,
  // or if we have a user and are about to redirect.
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
