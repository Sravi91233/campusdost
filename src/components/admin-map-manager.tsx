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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Edit, Trash2, Loader2, MapPin } from "lucide-react";
import { addLocation, deleteLocation, getLocations, updateLocation } from "@/services/locationService";
import type { MapLocation } from "@/types";

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().min(10, "Description must be at least 10 characters."),
  icon: z.string({ required_error: "Please select an icon." }),
  position: z.object({
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
  }),
});

type LocationFormValues = z.infer<typeof formSchema>;

const availableIcons = ["BedDouble", "Utensils", "Library", "Building2", "School", "Landmark"];

export function AdminMapManager() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLocation, setEditingLocation] = useState<MapLocation | null>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "Landmark",
      position: { lat: 31.2550, lng: 75.7056 },
    },
  });

  useEffect(() => {
    async function fetchLocations() {
      setIsLoading(true);
      const data = await getLocations();
      setLocations(data);
      setIsLoading(false);
    }
    fetchLocations();
  }, []);

  useEffect(() => {
    if (editingLocation) {
      form.reset(editingLocation);
    } else {
      form.reset({
        name: "", description: "", icon: "Landmark", position: { lat: 31.2550, lng: 75.7056 },
      });
    }
  }, [editingLocation, form]);


  const handleAddNew = () => {
    setEditingLocation(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const handleEdit = (location: MapLocation) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteLocation(id);
    if (result.success) {
      setLocations(locations.filter(l => l.id !== id));
      toast({ title: "Success", description: "Location deleted successfully." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
  };

  const onSubmit = async (values: LocationFormValues) => {
    setIsSubmitting(true);
    const result = editingLocation
      ? await updateLocation(editingLocation.id, values)
      : await addLocation(values);

    if (result.success) {
      const updatedLocations = await getLocations();
      setLocations(updatedLocations);
      toast({ title: "Success", description: `Location ${editingLocation ? 'updated' : 'added'} successfully.` });
      setIsDialogOpen(false);
      setEditingLocation(null);
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
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Location
        </Button>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLocation ? "Edit Location" : "Add New Location"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl><Input placeholder="e.g. Main Library" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField control={form.control} name="position.lat" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl><Input type="number" step="any" placeholder="e.g. 31.2550" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="position.lng" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl><Input type="number" step="any" placeholder="e.g. 75.7056" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an icon" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableIcons.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
               <FormField control={form.control} name="description" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="A brief description of the location..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingLocation ? "Save Changes" : "Create Location"}
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
              <TableHead>Name</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length > 0 ? locations.map(loc => (
              <TableRow key={loc.id}>
                <TableCell><div className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-muted-foreground"/>{loc.name}</div></TableCell>
                <TableCell className="font-mono text-xs">{loc.position.lat.toFixed(4)}, {loc.position.lng.toFixed(4)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(loc)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(loc.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No locations found. Add one to get started!</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
