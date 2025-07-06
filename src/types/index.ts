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
