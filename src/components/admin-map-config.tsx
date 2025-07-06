"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, Polygon } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getMapCorners, setMapCorners } from "@/services/mapConfigService";
import type { MapCorners } from "@/types";
import { Loader2, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const LPU_COORDS = { lat: 31.2550, lng: 75.7056 };

export function AdminMapConfig() {
  const { toast } = useToast();
  const [corners, setCorners] = useState<MapCorners | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    id: 'admin-map-bounds-script'
  });


  useEffect(() => {
    async function fetchCorners() {
      setIsLoading(true);
      try {
        const existingCorners = await getMapCorners();
        const initialCorners = existingCorners || {
          nw: { lat: 31.260, lng: 75.700 },
          ne: { lat: 31.260, lng: 75.710 },
          sw: { lat: 31.250, lng: 75.700 },
          se: { lat: 31.250, lng: 75.710 },
        };
        setCorners(initialCorners);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load map boundaries.", variant: "destructive" });
      }
      setIsLoading(false);
    }
    fetchCorners();
  }, [toast]);

  const handleMarkerDrag = (corner: keyof MapCorners, e: google.maps.MapMouseEvent) => {
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
    
    const result = await setMapCorners(corners);
    if (result.success) {
      toast({ title: "Success", description: "Map boundaries saved successfully." });
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsSaving(false);
  };

  if (loadError) {
    return (
       <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Could not load map</AlertTitle>
        <AlertDescription>
          There was an error loading the Google Maps script. Please check your API key and network connection.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLoading || !isLoaded) {
    return <Skeleton style={mapContainerStyle} />;
  }
  
  if (!corners) return null;

  const polygonPath = [corners.nw, corners.sw, corners.se, corners.ne];

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Drag the four corner markers to define the campus area. The map will show a polygon of this shape, and only markers inside it will be visible.
      </p>
      <div style={mapContainerStyle} className="relative">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={LPU_COORDS}
            zoom={15}
          >
            <Polygon
                paths={polygonPath}
                options={{
                  fillColor: "hsl(var(--primary))",
                  fillOpacity: 0.2,
                  strokeColor: "hsl(var(--primary))",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: false,
                }}
              />
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
      </div>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Boundaries
      </Button>
    </div>
  );
}
