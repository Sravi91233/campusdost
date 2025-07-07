import * as z from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  autocomplete: z.string().optional(),
});

export const SignUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  registrationNo: z.string().min(5, { message: 'Registration number is required.' }),
  inductionDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Please select a valid date."}),
  autocomplete: z.string().optional(),
});

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  registrationNo: string;
  inductionDate: string;
  role: 'user' | 'admin';
};

export interface ScheduleSession {
  id: string;
  time: string;
  title: string;
  speaker?: string;
  venue: string;
  description: string;
  type: 'talk' | 'workshop' | 'tour' | 'social';
  badge?: string;
}

export interface MapLocation {
  id: string;
  name: string;
  description: string;
  icon: string;
  position: {
    lat: number;
    lng: number;
  };
}

export interface MapCorners {
  nw: { lat: number, lng: number };
  ne: { lat: number, lng: number };
  sw: { lat: number, lng: number };
  se: { lat: number, lng: number };
}
