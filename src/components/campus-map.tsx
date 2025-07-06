"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { GoogleMap, useJsApiLoader, InfoWindowF, DirectionsRenderer } from "@react-google-maps/api";
import { getLocations } from "@/services/locationService";
import type { MapLocation } from "@/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import * as LucideIcons from "lucide-react";
import { Loader2 } from "lucide-react";

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '500px',
  borderRadius: '0.5rem',
};

const libraries = ['places', 'marker'] as const;

// A simple, clean map style to focus on the campus
const mapOptions = {
  styles: [
    { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
    { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
    { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
    { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#808080" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
    { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
    { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
    { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
    { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
    { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
    { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  ],
  disableDefaultUI: true,
  zoomControl: true,
  mapId: "campus_map" // Required for Advanced Markers
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
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [currentUserLocation, setCurrentUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [isRouting, setIsRouting] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
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
    fetchLocations();
  }, [toast]);

  const mapCenter = useMemo(() => {
    if (locations.length > 0) {
      return locations[0].position;
    }
    return { lat: 31.2550, lng: 75.7056 }; // Default to LPU campus if no locations
  }, [locations]);

  const handleMarkerClick = useCallback((location: MapLocation) => {
    setActiveLocation(location);
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
        setCurrentUserLocation(origin);

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

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);
  
  useEffect(() => {
    if (!map) return;
  
    const markers: google.maps.marker.AdvancedMarkerElement[] = [];
  
    // Create location markers
    locations.forEach(loc => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: loc.position,
        map,
        title: loc.name,
      });
      marker.addListener('gmp-click', () => handleMarkerClick(loc));
      markers.push(marker);
    });
  
    // Create user location marker
    if (currentUserLocation) {
      const userMarker = new google.maps.marker.AdvancedMarkerElement({
        position: currentUserLocation,
        map,
        title: "Your Location",
      });
      markers.push(userMarker);
    }
  
    // Cleanup function to remove markers
    return () => {
      markers.forEach(marker => {
        marker.map = null;
      });
    };
  }, [map, locations, currentUserLocation, handleMarkerClick]);

  if (loadError) {
    return <div className="text-destructive-foreground bg-destructive p-4 rounded-md">Error loading map. Please check your API key and network connection.</div>;
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
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Markers are now managed by useEffect, no longer rendered as children */}
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
