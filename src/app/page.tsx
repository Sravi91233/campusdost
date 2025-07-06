import { Button } from "@/components/ui/button";
import { QrCode } from "lucide-react";
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
          This experience is designed for your mobile device. Scan the QR code on your wristband to begin your personalized journey.
        </p>
        <div className="flex justify-center pt-8">
          <Button asChild size="lg" className="text-lg px-10 py-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 bg-gradient-to-r from-primary to-accent text-primary-foreground">
            <Link href="/dashboard">
              <QrCode className="mr-3 h-6 w-6" />
              Begin Your Journey
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

