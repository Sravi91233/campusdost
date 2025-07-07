'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';

const protectedRoutes = ['/dashboard'];
const adminRoutes = ['/admin'];
const publicRoutes = ['/login', '/signup', '/'];

export function AuthRouter({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Do nothing until the initial auth state is resolved from localStorage.
    if (loading) {
      return;
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    // --- Logic for logged-out users ---
    if (!userProfile) {
      // If they are on a protected or admin route, redirect to the login page.
      if (isProtectedRoute || isAdminRoute) {
        router.replace('/login');
      }
      return; // End of logic for logged-out users.
    }

    // --- Logic for logged-in users ---
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
  }, [userProfile, loading, pathname, router]);

  return <>{children}</>;
}
