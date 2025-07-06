"use client"

import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Building2, Utensils, Library, School, BedDouble } from "lucide-react";

type Location = {
  name: string;
  description: string;
  icon: React.ElementType;
  position: { top: string; left: string };
};

const locations: Location[] = [
  { name: "Hostel Block A", description: "Men's Hostel. Warden: Mr. John Doe", icon: BedDouble, position: { top: "25%", left: "20%" } },
  { name: "Hostel Block B", description: "Women's Hostel. Warden: Ms. Jane Smith", icon: BedDouble, position: { top: "30%", left: "75%" } },
  { name: "Central Canteen", description: "Open from 7 AM to 10 PM. Serves a variety of cuisines.", icon: Utensils, position: { top: "50%", left: "50%" } },
  { name: "Main Library", description: "Your hub for books, research, and quiet study.", icon: Library, position: { top: "70%", left: "30%" } },
  { name: "Admin Block", description: "For all administrative queries, fees, and documentation.", icon: Building2, position: { top: "10%", left: "50%" } },
  { name: "Engineering Dept.", description: "Classrooms and labs for all engineering disciplines.", icon: School, position: { top: "80%", left: "65%" } },
];


export function CampusMap() {
  return (
    <div className="relative w-full max-w-3xl mx-auto aspect-[4/3] rounded-lg overflow-hidden border shadow-inner">
      <Image
        src="https://placehold.co/800x600.png"
        alt="Campus Map"
        layout="fill"
        objectFit="cover"
        className="opacity-80"
        data-ai-hint="campus map sketch"
      />
      {locations.map((loc) => (
        <Popover key={loc.name}>
          <PopoverTrigger asChild style={{ top: loc.position.top, left: loc.position.left, position: 'absolute' }}>
            <Button size="icon" variant="secondary" className="rounded-full w-10 h-10 shadow-lg animate-pulse hover:animate-none">
              <loc.icon className="h-5 w-5 text-primary" />
              <span className="sr-only">{loc.name}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <div className="space-y-2">
              <h3 className="font-bold text-primary">{loc.name}</h3>
              <p className="text-sm text-muted-foreground">{loc.description}</p>
            </div>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  );
}
