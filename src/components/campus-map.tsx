"use client"

import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { getLocations } from "@/services/locationService";
import type { MapLocation } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem',
};

const libraries = ['places'] as const;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const LPU_COORDS = { lat: 31.2550, lng: 75.7056 };

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  restriction: {
    latLngBounds: {
      north: 31.2650,
      south: 31.2450,
      west: 75.6956,
      east: 75.7156,
    },
    strictBounds: false,
  },
  minZoom: 15,
  maxZoom: 18,
};

const getMarkerIcon = (iconName: string): string => {
  const baseUrl = "http://maps.google.com/mapfiles/ms/icons/";
  switch (iconName) {
    case "BedDouble": // Hostels
      return baseUrl + "blue-dot.png";
    case "Utensils": // Food
      return baseUrl + "orange-dot.png";
    case "Library":
    case "School":
    case "Building2": // Academic
      return baseUrl + "purple-dot.png";
    case "Landmark":
      return baseUrl + "green-dot.png"; // General
    default:
      return baseUrl + "red-dot.png"; // Default
  }
};

export function CampusMap() {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      try {
        const data = await getLocations();
        setLocations(data);
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (GOOGLE_MAPS_API_KEY) {
      fetchLocations();
    } else {
      setIsLoading(false);
    }
  }, []);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Google Maps API Key is Missing</AlertTitle>
        <AlertDescription>
          Please add your <code className="font-mono text-xs bg-muted p-1 rounded-sm">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your <code className="font-mono text-xs bg-muted p-1 rounded-sm">.env</code> file.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full relative" style={mapContainerStyle}>
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        loadingElement={<Skeleton className="w-full h-full" />}
        id="google-map-script-loader"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={LPU_COORDS}
          zoom={16}
          options={mapOptions}
          onClick={() => setSelectedLocation(null)}
        >
          {!isLoading && locations.map(loc => (
            <MarkerF
              key={loc.id}
              position={loc.position}
              icon={getMarkerIcon(loc.icon)}
              onClick={() => setSelectedLocation(loc)}
            />
          ))}

          {selectedLocation && (
            <InfoWindowF
              position={selectedLocation.position}
              onCloseClick={() => setSelectedLocation(null)}
            >
              <div className="p-1 max-w-xs">
                <h3 className="font-bold text-md mb-1">{selectedLocation.name}</h3>
                <p className="text-sm">{selectedLocation.description}</p>
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
