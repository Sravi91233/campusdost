import * as z from 'zod';

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export const SignUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  registrationNo: z.string().min(5, { message: 'Registration number is required.' }),
  inductionDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Please select a valid date."}),
});

export type UserProfile = {
  uid: string;
  email: string;
  name: string;
  registrationNo: string;
  inductionDate: string;
  role: 'user' | 'admin';
};
