"use client";

import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function LogoutButton() {
    const router = useRouter();
    const { toast } = useToast();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
        // Use router.replace to prevent going back to the dashboard via browser history.
        router.replace("/login");
    };

    return (
        <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
}
