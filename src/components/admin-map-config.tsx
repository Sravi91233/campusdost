"use client";

import React, { useState, useEffect, useMemo } from "react";
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

type Corners = {
  nw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
  sw: { lat: number; lng: number };
  se: { lat: number; lng: number };
};

export function AdminMapConfig() {
  const { toast } = useToast();
  const [corners, setCorners] = useState<Corners | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchBounds() {
      setIsLoading(true);
      try {
        const existingBounds = await getMapBounds();
        const initialBounds = existingBounds || { north: 31.2650, south: 31.2450, east: 75.7156, west: 75.6956 };
        setCorners({
          nw: { lat: initialBounds.north, lng: initialBounds.west },
          ne: { lat: initialBounds.north, lng: initialBounds.east },
          sw: { lat: initialBounds.south, lng: initialBounds.west },
          se: { lat: initialBounds.south, lng: initialBounds.east },
        });
      } catch (error) {
        toast({ title: "Error", description: "Failed to load map boundaries.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchBounds();
  }, [toast]);

  const handleMarkerDrag = (corner: keyof Corners, e: google.maps.MapMouseEvent) => {
    if (e.latLng && corners) {
      setCorners(prevCorners => ({
        ...prevCorners!,
        [corner]: { lat: e.latLng.lat(), lng: e.latLng.lng() },
      }));
    }
  };

  const handleSave = async () => {
    if (!corners) return;
    setIsSaving(true);
    
    const lats = [corners.nw.lat, corners.ne.lat, corners.sw.lat, corners.se.lat];
    const lngs = [corners.nw.lng, corners.ne.lng, corners.sw.lng, corners.se.lng];
    
    const newBounds: MapBounds = {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
    
    const result = await setMapBounds(newBounds);
    if (result.success) {
      toast({ title: "Success", description: "Map boundaries saved successfully." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSaving(false);
  };

  const displayBounds = useMemo(() => {
    if (!corners) return { north: 0, south: 0, east: 0, west: 0 };
    const lats = [corners.nw.lat, corners.ne.lat, corners.sw.lat, corners.se.lat];
    const lngs = [corners.nw.lng, corners.ne.lng, corners.sw.lng, corners.se.lng];
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [corners]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!corners) return null;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag the four corner markers to define the map area. The system will use the outermost points as the boundary.
      </p>
      <div style={mapContainerStyle} className="relative">
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} id="admin-map-bounds-script">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={LPU_COORDS}
            zoom={15}
          >
            <MarkerF
              position={corners.nw}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('nw', e)}
              label="NW"
            />
             <MarkerF
              position={corners.ne}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('ne', e)}
              label="NE"
            />
            <MarkerF
              position={corners.sw}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('sw', e)}
              label="SW"
            />
            <MarkerF
              position={corners.se}
              draggable={true}
              onDrag={(e) => handleMarkerDrag('se', e)}
              label="SE"
            />
          </GoogleMap>
        </LoadScript>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-xs">
         <div className="p-2 bg-muted rounded">North: {displayBounds.north.toFixed(6)}</div>
         <div className="p-2 bg-muted rounded">West: {displayBounds.west.toFixed(6)}</div>
         <div className="p-2 bg-muted rounded">South: {displayBounds.south.toFixed(6)}</div>
         <div className="p-2 bg-muted rounded">East: {displayBounds.east.toFixed(6)}</div>
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Boundaries
      </Button>
    </div>
  );
}
