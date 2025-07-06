"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Star } from "lucide-react";

const formSchema = z.object({
  session: z.string({
    required_error: "Please select a session to give feedback on.",
  }),
  rating: z.string({
    required_error: "Please provide a rating.",
  }),
  comments: z.string().max(500, "Comments must be 500 characters or less.").optional(),
});

const sessions = [
  "Dean's Inaugural Address",
  "Campus Discovery Tour",
  "Intro to University Systems",
  "Meet Your Department",
  "Student Club Fair",
];

export function FeedbackForm() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comments: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "Feedback Submitted!",
      description: "Thank you for helping us improve.",
    });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-accent/20 rounded-lg">
        <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
        <h3 className="font-bold text-lg">Thank You!</h3>
        <p className="text-muted-foreground text-sm">Your feedback has been recorded.</p>
        <Button variant="link" onClick={() => { setSubmitted(false); form.reset(); }}>Submit another</Button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="session"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Session Title</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a session..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sessions.map(session => (
                    <SelectItem key={session} value={session}>{session}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Your Rating</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex"
                >
                  {[1, 2, 3, 4, 5].map(rating => (
                    <FormItem key={rating} className="flex items-center space-x-1 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={String(rating)} className="sr-only" />
                      </FormControl>
                      <FormLabel className="cursor-pointer">
                        <Star className={`h-6 w-6 transition-colors ${Number(field.value) >= rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}/>
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Comments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us more about your experience..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Submit Feedback</Button>
      </form>
    </Form>
  );
}
