import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center animate-fade-in">
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary">
          Campus Compass
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Your smart university induction starts here.
        </p>
        <p className="text-md text-foreground/80">
          Log in or create an account to access your personalized schedule, campus map, and connect with other students.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
           <Button asChild size="lg" className="w-full sm:w-auto text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Link href="/login">
              <LogIn className="mr-3 h-6 w-6" />
              Login
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Link href="/signup">
              <UserPlus className="mr-3 h-6 w-6" />
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
