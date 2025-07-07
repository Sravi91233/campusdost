'use client'
import { useAuth } from "@/context/AuthContext"

export default function DashboardPage() {
  const { userProfile } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome to your Dashboard, {userProfile?.name || 'Student'}!</h1>
      <p>This is your personalized space. More features coming soon!</p>
    </div>
  );
}
