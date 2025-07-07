"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Loader2, Clock, CalendarIcon } from "lucide-react";
import { addScheduleSession, deleteScheduleSession, getSchedule, updateScheduleSession } from "@/services/scheduleService";
import type { ScheduleSession } from "@/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const formSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Please select a valid date."}),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please use HH:MM format."),
  title: z.string().min(3, "Title must be at least 3 characters."),
  speaker: z.string().optional(),
  venue: z.string().min(3, "Venue must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  type: z.enum(["talk", "workshop", "tour", "social"]),
  badge: z.string().optional(),
});

type SessionFormValues = z.infer<typeof formSchema>;

export function ScheduleManager() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ScheduleSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSession, setEditingSession] = useState<ScheduleSession | null>(null);

  const form = useForm<SessionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date().toISOString(),
      time: "",
      title: "",
      speaker: "",
      venue: "",
      description: "",
      type: "talk",
      badge: "",
    },
  });

  useEffect(() => {
    async function fetchSchedule() {
      setIsLoading(true);
      const data = await getSchedule();
      setSessions(data);
      setIsLoading(false);
    }
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (editingSession) {
      form.reset(editingSession);
    } else {
      form.reset({
        date: new Date().toISOString(),
        time: "", title: "", speaker: "", venue: "", description: "", type: "talk", badge: "",
      });
    }
  }, [editingSession, form]);


  const handleAddNew = () => {
    setEditingSession(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEdit = (session: ScheduleSession) => {
    setEditingSession(session);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteScheduleSession(id);
    if (result.success) {
      setSessions(sessions.filter(s => s.id !== id));
      toast({ title: "Success", description: "Session deleted successfully." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const onSubmit = async (values: SessionFormValues) => {
    setIsSubmitting(true);
    const result = editingSession
      ? await updateScheduleSession(editingSession.id, values)
      : await addScheduleSession(values);

    if (result.success) {
      const updatedSessions = await getSchedule();
      setSessions(updatedSessions);
      toast({ title: "Success", description: `Session ${editingSession ? 'updated' : 'added'} successfully.` });
      setIsDialogOpen(false);
      setEditingSession(null);
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSubmitting(false);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Button onClick={handleAddNew}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Session
        </Button>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSession ? "Edit Session" : "Add New Session"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                              format(new Date(field.value), "PPP")
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
                          selected={field.value ? new Date(field.value) : undefined}
                          onSelect={(date) => field.onChange(date?.toISOString())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}/>
                <FormField control={form.control} name="time" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (HH:MM)</FormLabel>
                    <FormControl><Input placeholder="e.g. 09:30" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl><Input placeholder="Dean's Address" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="speaker" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speaker (Optional)</FormLabel>
                    <FormControl><Input placeholder="Dr. Evelyn Reed" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="venue" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl><Input placeholder="Main Auditorium" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                 <FormField control={form.control} name="type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session Type</FormLabel>
                       <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="talk">Talk</SelectItem>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="tour">Tour</SelectItem>
                          <SelectItem value="social">Social</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="badge" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge to Unlock (Optional)</FormLabel>
                    <FormControl><Input placeholder="Explorer" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
               <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="A brief description of the session..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSession ? "Save Changes" : "Create Session"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Venue</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.length > 0 ? sessions.map(session => (
              <TableRow key={session.id}>
                <TableCell className="font-medium">{format(new Date(session.date), "PPP")}</TableCell>
                <TableCell><div className="flex items-center gap-2 font-medium"><Clock className="h-4 w-4 text-muted-foreground"/>{session.time}</div></TableCell>
                <TableCell>{session.title}</TableCell>
                <TableCell>{session.venue}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(session)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(session.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No sessions found. Add one to get started!</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
