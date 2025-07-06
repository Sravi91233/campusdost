"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GoogleMap, useJsApiLoader, InfoWindowF, DirectionsRenderer, MarkerF } from "@react-google-maps/api";
import { getLocations } from "@/services/locationService";
import type { MapLocation } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import { Loader2, AlertTriangle } from "lucide-react";

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  borderRadius: '0.5rem',
};

const libraries = ['places'] as const;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};


const DynamicIcon = React.memo(({ name, ...props }: { name: string } & LucideIcons.LucideProps) => {
    const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ElementType;
    if (!IconComponent) {
      return <LucideIcons.MapPin {...props} />;
    }
    return <IconComponent {...props} />;
});
DynamicIcon.displayName = "DynamicIcon";

export function CampusMap() {
  const { toast } = useToast();
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: libraries,
  });

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
        toast({
          variant: "destructive",
          title: "Error Loading Map Pins",
          description: "Could not load locations from the database. Please check Firestore rules.",
        });
      } finally {
        setIsLoading(false);
      }
    };
    if(GOOGLE_MAPS_API_KEY) {
      fetchLocations();
    } else {
        setIsLoading(false);
    }
  }, [toast]);

  const mapCenter = useMemo(() => {
    if (locations.length > 0) {
      return locations[0].position;
    }
    return { lat: 31.2550, lng: 75.7056 }; // Default to LPU campus if no locations
  }, [locations]);

  const handleMarkerClick = useCallback((location: MapLocation) => {
    setActiveLocation(location);
    setDirections(null);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setActiveLocation(null);
  }, []);

  const handleGetDirections = useCallback((destination: { lat: number, lng: number }) => {
    setIsRouting(true);
    setDirections(null);
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Geolocation not supported", description: "Your browser does not support geolocation." });
      setIsRouting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route(
          {
            origin,
            destination,
            travelMode: window.google.maps.TravelMode.WALKING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              toast({ variant: "destructive", title: "Directions failed", description: "Could not find a route." });
            }
            setIsRouting(false);
          }
        );
      },
      () => {
        toast({ variant: "destructive", title: "Geolocation failed", description: "Could not get your location. Please enable location services." });
        setIsRouting(false);
      }
    );
  }, [toast]);
  
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex flex-col h-[500px] w-full items-center justify-center rounded-lg bg-destructive/10 text-center border border-destructive/20" style={mapContainerStyle}>
        <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
        <h3 className="text-lg font-bold text-destructive">Google Maps API Key is Missing</h3>
        <p className="text-muted-foreground mt-2 max-w-md">
          The interactive map cannot be loaded. Please add your <code className="font-mono text-xs bg-muted p-1 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="font-mono text-xs bg-muted p-1 rounded-sm">.env</code> file and restart the development server.
        </p>
      </div>
    );
  }
  
  if (loadError) {
    return <div className="text-destructive-foreground bg-destructive p-4 rounded-md">Error loading map. Please check your API key settings in the Google Cloud Console.</div>;
  }
  if (!isLoaded) {
    return <Skeleton style={mapContainerStyle} />;
  }

  return (
    <div className="w-full h-full relative" style={mapContainerStyle}>
       {isLoading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={mapCenter}
        zoom={16}
        options={mapOptions}
      >
        {!isLoading && locations.map(loc => (
          <MarkerF
            key={loc.id}
            position={loc.position}
            onClick={() => handleMarkerClick(loc)}
          />
        ))}

        {activeLocation && (
          <InfoWindowF
            position={activeLocation.position}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="space-y-2 p-1 max-w-xs">
              <div className="flex items-center gap-2">
                <DynamicIcon name={activeLocation.icon} className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-md text-primary">{activeLocation.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{activeLocation.description}</p>
              <Button size="sm" className="w-full" onClick={() => handleGetDirections(activeLocation.position)} disabled={isRouting}>
                {isRouting ? "Getting Route..." : "Get Directions"}
              </Button>
            </div>
          </InfoWindowF>
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: 'hsl(var(--primary))',
                strokeWeight: 5,
                strokeOpacity: 0.8,
              },
            }}
          />
        )}
      </GoogleMap>
      {!isLoading && locations.length === 0 && (
         <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-background p-3 rounded-lg shadow-lg text-sm text-muted-foreground z-10">
           No locations found. Add some in the admin panel!
         </div>
      )}
    </div>
  );
}
