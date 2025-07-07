
"use client";

import { useNotification } from '@/context/NotificationContext';
import { Bell } from 'lucide-react';
import { Button } from './ui/button';

export function NotificationBell() {
    const { unreadConnectionCount } = useNotification();

    const handleScrollToBuddySection = () => {
        // Find the "Find a Buddy" card and scroll to it.
        const buddySection = document.getElementById('buddy-feature-card');
        if (buddySection) {
            buddySection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return (
        <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            aria-label={`You have ${unreadConnectionCount} new connection requests`}
            onClick={handleScrollToBuddySection}
        >
            <Bell className="h-6 w-6" />
            {unreadConnectionCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
            )}
        </Button>
    )
}
