export type ScheduleSession = {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  venue: string;
  description: string;
  type: "talk" | "workshop" | "tour" | "social";
  badge?: string;
};

export type MapLocation = {
  id:string;
  name: string;
  description: string;
  icon: string;
  position: {
    lat: number;
    lng: number;
  };
};

export type MapCorners = {
  nw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
  se: { lat: number; lng: number };
};
