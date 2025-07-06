"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, MarkerF } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getMapBounds, setMapBounds } from "@/services/mapConfigService";
import type { MapBounds } from "@/types";
import { Loader2 } from "lucide-react";

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const LPU_COORDS = { lat: 31.2550, lng: 75.7056 };

export function AdminMapConfig() {
  const { toast } = useToast();
  const [bounds, setBounds] = useState<MapBounds | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchBounds() {
      setIsLoading(true);
      const existingBounds = await getMapBounds();
      setBounds(existingBounds || { north: 31.2650, south: 31.2450, east: 75.7156, west: 75.6956 });
      setIsLoading(false);
    }
    fetchBounds();
  }, []);

  const handleMarkerDrag = (corner: 'nw' | 'ne' | 'sw' | 'se', e: google.maps.MapMouseEvent) => {
    if (e.latLng && bounds) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      const newBounds = { ...bounds };
      
      switch (corner) {
        case 'nw':
          newBounds.north = lat;
          newBounds.west = lng;
          break;
        case 'ne':
          newBounds.north = lat;
          newBounds.east = lng;
          break;
        case 'sw':
          newBounds.south = lat;
          newBounds.west = lng;
          break;
        case 'se':
          newBounds.south = lat;
          newBounds.east = lng;
          break;
      }
      setBounds(newBounds);
    }
  };

  const handleSave = async () => {
    if (!bounds) return;
    setIsSaving(true);
    const result = await setMapBounds(bounds);
    if (result.success) {
      toast({ title: "Success", description: "Map boundaries saved successfully." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!bounds) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag the four corner markers to define the visible map area for users.
      </p>
      <div style={mapContainerStyle} className="relative">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} id="admin-map-bounds-script">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={LPU_COORDS}
            zoom={15}
          >
            <MarkerF
              position={{ lat: bounds.north, lng: bounds.west }}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('nw', e)}
              label="NW"
            />
             <MarkerF
              position={{ lat: bounds.north, lng: bounds.east }}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('ne', e)}
              label="NE"
            />
            <MarkerF
              position={{ lat: bounds.south, lng: bounds.west }}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('sw', e)}
              label="SW"
            />
            <MarkerF
              position={{ lat: bounds.south, lng: bounds.east }}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('se', e)}
              label="SE"
            />
          </GoogleMap>
        </LoadScript>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
         <div className="p-2 bg-muted rounded">North: {bounds.north.toFixed(6)}</div>
         <div className="p-2 bg-muted rounded">West: {bounds.west.toFixed(6)}</div>
         <div className="p-2 bg-muted rounded">South: {bounds.south.toFixed(6)}</div>
         <div className="p-2 bg-muted rounded">East: {bounds.east.toFixed(6)}</div>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Boundaries
      </Button>
    </div>
  );
}
