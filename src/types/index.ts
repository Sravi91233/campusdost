
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
  stream: z.string({ required_error: 'Please select your stream.' }),
  inductionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Please select a valid date."}),
  autocomplete: z.string().optional(),
});

// This is the user profile shape used throughout the client-side of the app.
// It explicitly does NOT contain the password.
export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  registrationNo: string;
  inductionDate: string; // Stored as 'YYYY-MM-DD'
  role: 'user' | 'admin';
  stream: string;
};

export interface ScheduleSession {
  id: string;
  date: string; // Stored as 'YYYY-MM-DD'
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
  name:string;
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

export interface Connection {
  id: string;
  participants: [string, string];
  status: 'pending' | 'connected';
  requestedBy: string;
}
