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
    if (loading) {
      return; // Wait for the auth state to be confirmed
    }

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

    if (!user) {
      // If the user is not logged in, they should be redirected to login
      // unless they are already on a public page.
      if (isProtectedRoute || isAdminRoute) {
        router.replace('/login');
      }
    } else {
      // User is logged in
      if (userProfile) {
        if (userProfile.role === 'admin') {
          // Admin specific logic
          if (pathname === '/dashboard') {
             router.replace('/admin'); // An admin on user dashboard should be redirected
          }
        } else {
          // Regular user specific logic
          if (isAdminRoute) {
            router.replace('/dashboard'); // A user on an admin route should be redirected
          }
        }
        
        // If logged in user is on a public route, redirect them to their dashboard
        if(publicRoutes.includes(pathname)) {
            if (userProfile.role === 'admin') {
                router.replace('/admin');
            } else {
                router.replace('/dashboard');
            }
        }
      }
    }
  }, [user, userProfile, loading, pathname, router]);

  return <>{children}</>;
}
