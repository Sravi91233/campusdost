'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

const protectedRoutes = ['/dashboard'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/login', '/signup', '/'];

export function AuthRouter({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Do nothing until the initial auth state is resolved.
    if (loading) {
      return;
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // --- Logic for logged-out users ---
    if (!user) {
      // If they are on a protected or admin route, redirect to the login page.
      if (isProtectedRoute || isAdminRoute) {
        router.replace('/login');
      }
      return; // End of logic for logged-out users.
    }

    // --- Logic for logged-in users ---
    // We must have the user's profile to make role-based decisions.
    // If it's not available yet, wait for the next render.
    if (userProfile) {
      const isPublicRoute = publicRoutes.includes(pathname);
      
      // If a logged-in user is on a public page (login, signup, home),
      // redirect them to their correct dashboard.
      if (isPublicRoute) {
        if (userProfile.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/dashboard');
        }
        return;
      }
      
      // If a regular user tries to access an admin route, redirect them.
      if (userProfile.role !== 'admin' && isAdminRoute) {
        router.replace('/dashboard');
        return;
      }

      // If an admin tries to access the main user dashboard, redirect them.
      if (userProfile.role === 'admin' && pathname.startsWith('/dashboard')) {
        router.replace('/admin');
        return;
      }
    }
  }, [user, userProfile, loading, pathname, router]);

  return <>{children}</>;
}
