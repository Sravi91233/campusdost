"use client";

import { Button } from "./ui/button";
import { logoutUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        const result = await logoutUser();
        if (result.success) {
            toast({ title: "Logged Out", description: "You have been successfully logged out." });
            router.push("/login");
        } else {
            toast({ title: "Logout Failed", description: result.error, variant: "destructive" });
        }
    };

    return (
        <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
}
