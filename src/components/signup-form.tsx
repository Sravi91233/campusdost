"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";
import { CalendarIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { SignUpSchema } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from "firebase/auth";

const streams = [
    "Computer Science and Engineering (CSE)",
    "Electronics and Communication Engineering (ECE)",
    "Electrical and Electronics Engineering (EEE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Artificial Intelligence & Machine Learning (AI/ML)",
    "Data Science",
    "Cybersecurity",
    "Information Technology (IT)",
    "Chemical Engineering",
    "Aerospace Engineering",
    "Robotics and Automation",
    "Biomedical Engineering",
    "Architecture (B.Arch)",
    "Interior and Furniture Design",
    "Urban Planning",
    "Fashion Design",
    "Product/Industrial Design",
    "Graphic Design",
    "Multimedia and Animation",
    "Fine Arts",
    "Photography",
    "Film and TV Production",
    "Music and Dance",
    "Theatre and Performing Arts",
    "Bachelor of Business Administration (BBA)",
    "Master of Business Administration (MBA)",
    "Bachelor of Commerce (B.Com)",
    "Master of Commerce (M.Com)",
    "International Business",
    "Entrepreneurship",
    "Law (BA LLB, BBA LLB, LLB, LLM)",
    "Physics",
    "Chemistry",
    "Mathematics",
    "Biotechnology",
    "Microbiology",
    "Biochemistry",
    "Environmental Science",
    "Food Technology",
    "Pharmacy (B.Pharm, M.Pharm)",
    "Physiotherapy (BPT, MPT)",
    "Medical Laboratory Sciences",
    "Clinical Research",
    "Psychology",
    "Sociology",
    "Political Science",
    "History",
    "English",
    "Hindi",
    "Punjabi",
    "Economics",
    "Education (B.Ed, M.Ed)",
    "Computer Applications (BCA, MCA)",
    "Cloud Computing",
    "Full Stack Development",
    "Hotel Management",
    "Travel and Tourism Management",
    "Agriculture (B.Sc Hons Agriculture)",
    "Horticulture",
    "Soil Science",
    "Plant Pathology"
];

const OtpSchema = z.object({
  otp: z.string().length(6, "Your OTP must be 6 characters."),
});

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export function SignUpForm() {
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [signUpData, setSignUpData] = useState<z.infer<typeof SignUpSchema> | null>(null);

  const form = useForm<z.infer<typeof SignUpSchema>>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      registrationNo: "",
      stream: "",
    },
  });

  const otpForm = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { otp: "" },
  });

  async function onDetailsSubmit(values: z.infer<typeof SignUpSchema>) {
    setIsLoading(true);
    setSignUpData(values); // Store form data
    
    // Clear any old verifier to avoid conflicts
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
    }
    
    // Create the verifier instance "just-in-time"
    const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
    window.recaptchaVerifier = appVerifier;

    try {
      const confirmationResult = await signInWithPhoneNumber(auth, values.phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setStep('otp');
      toast({ title: "Verification code sent", description: "Please check your phone for the OTP." });
    } catch (error: any) {
      console.error("SMS Error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/billing-not-enabled') {
        description = "Phone sign-in is a paid feature. Please ensure you have upgraded to the Blaze plan and linked a valid billing account in your Firebase console.";
      } else if (error.code === 'auth/invalid-phone-number') {
        description = "The phone number you entered is not valid. Please check it and include the country code (e.g., +1).";
      } else {
        description = "Could not send verification code. Please check the phone number and your network connection.";
      }
      toast({
        title: "Failed to send OTP",
        description: description,
        variant: "destructive",
      });
      appVerifier.clear(); // Clean up the verifier on failure
    } finally {
      setIsLoading(false);
    }
  }

  async function onOtpSubmit(values: z.infer<typeof OtpSchema>) {
    if (!signUpData || !window.confirmationResult) return;
    setIsLoading(true);

    try {
      // Confirm the OTP
      await window.confirmationResult.confirm(values.otp);
      
      // OTP is correct, now proceed with the original sign-up logic
      const result = await signUp(signUpData);
      
      if (result.success) {
        toast({
          title: "Account Created",
          description: "Welcome! Redirecting to your dashboard...",
        });
        // The redirect is now handled by the AuthRouter
      } else {
        toast({
          title: "Sign Up Failed",
          description: result.error || "An unexpected error occurred.",
          variant: "destructive",
        });
        setStep('details'); // Go back to details if email exists etc.
      }
    } catch (error) {
      console.error("OTP/SignUp Error:", error);
      toast({
        title: "Verification Failed",
        description: "The OTP you entered was incorrect. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (step === 'otp') {
    return (
       <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Verify Your Phone</CardTitle>
          <CardDescription>Enter the 6-digit code we sent to your number.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...otpForm}>
            <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
              <FormField control={otpForm.control} name="otp" render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="123456" {...field} autoComplete="one-time-code" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Create Account"}
              </Button>
            </form>
          </Form>
           <Button variant="link" onClick={() => setStep('details')} className="mt-4 w-full">Back to details</Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-md shadow-lg">
      <div id="recaptcha-container"></div>
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Create an Account</CardTitle>
        <CardDescription>Join our community to get started.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onDetailsSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} autoComplete="name"/></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input placeholder="student@university.edu" {...field} autoComplete="email"/></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} autoComplete="new-password"/></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="phoneNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (with country code)</FormLabel>
                <FormControl><Input placeholder="+1 123 456 7890" {...field} autoComplete="tel"/></FormControl>
                <FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="registrationNo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number</FormLabel>
                  <FormControl><Input placeholder="e.g. 1234567" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="stream" render={({ field }) => (
                <FormItem>
                  <FormLabel>Stream</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your stream of study" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {streams.map(stream => (
                        <SelectItem key={stream} value={stream}>{stream}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
            )}/>
            <FormField control={form.control} name="inductionDate" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Induction Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(new Date(field.value + 'T00:00:00'), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                      disabled={(date) => date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}/>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Send Verification Code"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
