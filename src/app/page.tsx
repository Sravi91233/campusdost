import { Button } from "@/components/ui/button";
import { LogIn, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-background p-8 text-center animate-fade-in">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]"></div>
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 animate-fade-in">
          Campus Compass
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in [animation-delay:200ms]">
          Your smart university induction starts here.
        </p>
        <p className="text-md text-foreground/60 animate-fade-in [animation-delay:400ms]">
          Log in or create an account to access your personalized schedule, campus map, and connect with other students.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-fade-in [animation-delay:600ms]">
           <Button asChild size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Link href="/login">
              <LogIn className="mr-3 h-5 w-5" />
              Login
              <ArrowRight className="ml-2 h-5 w-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300"/>
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1">
            <Link href="/signup">
              <UserPlus className="mr-3 h-5 w-5" />
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
