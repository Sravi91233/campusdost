"use client"

import React, { useState, useEffect, useRef, useMemo } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { getLocations } from "@/services/locationService";
import type { MapLocation, MapBounds } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Loader2, Search, BedDouble, Utensils, Library, Building2, School, Landmark } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useMap } from "@/context/MapContext";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '0.5rem',
};

const libraries = ['places'] as const;
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const LPU_COORDS = { lat: 31.2550, lng: 75.7056 };

const getMarkerIcon = (iconName: string): string => {
  const baseUrl = "http://maps.google.com/mapfiles/ms/icons/";
  switch (iconName) {
    case "BedDouble": return baseUrl + "blue-dot.png";
    case "Utensils": return baseUrl + "orange-dot.png";
    case "Library": case "School": case "Building2": return baseUrl + "purple-dot.png";
    case "Landmark": return baseUrl + "green-dot.png";
    default: return baseUrl + "red-dot.png";
  }
};

const iconMap: { [key: string]: React.ElementType } = {
  BedDouble,
  Utensils,
  Library,
  Building2,
  School,
  Landmark,
};

const availableIcons = Object.keys(iconMap);

export function CampusMap({ initialBounds }: { initialBounds: MapBounds | null }) {
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const { focusedVenueName, setFocusedVenueName } = useMap();
  const mapRef = useRef<google.maps.Map | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    restriction: initialBounds ? {
      latLngBounds: initialBounds,
      strictBounds: false,
    } : {
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
  }), [initialBounds]);


  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

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

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      // Bounds check
      if (initialBounds) {
        if (
          loc.position.lat > initialBounds.north ||
          loc.position.lat < initialBounds.south ||
          loc.position.lng > initialBounds.east ||
          loc.position.lng < initialBounds.west
        ) {
          return false;
        }
      }
      
      // Filter check
      if (activeFilters.length > 0 && !activeFilters.includes(loc.icon)) {
        return false;
      }
      
      // Search term check
      if (searchTerm.trim() !== "" && !loc.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [locations, searchTerm, activeFilters, initialBounds]);

  useEffect(() => {
    if (focusedVenueName && locations.length > 0) {
      const venueLocation = locations.find(loc => loc.name === focusedVenueName);
      if (venueLocation) {
        setSearchTerm(venueLocation.name);
        setActiveFilters([]); 
        setSelectedLocation(venueLocation);
      }
      setFocusedVenueName(null);
    }
  }, [focusedVenueName, locations, setFocusedVenueName]);


  useEffect(() => {
    if (!mapRef.current || locations.length === 0) {
      return; 
    }

    if (selectedLocation && !filteredLocations.find(l => l.id === selectedLocation.id)) {
        setSelectedLocation(null);
    }
    
    if (filteredLocations.length === 0 && (searchTerm || activeFilters.length > 0)) {
      mapRef.current.panTo(LPU_COORDS);
      mapRef.current.setZoom(16);
      return;
    }
    
    if (filteredLocations.length === 1) {
      mapRef.current.panTo(filteredLocations[0].position);
      mapRef.current.setZoom(17);
      return;
    }
    
    if (filteredLocations.length > 1) {
        const bounds = new window.google.maps.LatLngBounds();
        filteredLocations.forEach(loc => {
            bounds.extend(loc.position);
        });
        mapRef.current.fitBounds(bounds);
    } else {
        // Default view when no filters/search
        if(mapRef.current) {
            mapRef.current.panTo(LPU_COORDS);
            const listener = google.maps.event.addListenerOnce(mapRef.current, 'idle', () => {
              if (mapRef.current?.getZoom() !== 16) mapRef.current?.setZoom(16);
            });
            // Cleanup listener
            return () => {
              google.maps.event.removeListener(listener);
            };
        }
    }

  }, [filteredLocations, locations.length, searchTerm, activeFilters]);


  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
    if(focusedVenueName) {
      setFocusedVenueName(null);
    }
  };
  
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ToggleGroup
            type="multiple"
            variant="outline"
            value={activeFilters}
            onValueChange={(value) => setActiveFilters(value)}
            className="flex-wrap justify-start"
          >
            {availableIcons.map(iconName => {
                const IconComponent = iconMap[iconName];
                return (
                    <ToggleGroupItem key={iconName} value={iconName} aria-label={iconName}>
                        <IconComponent className="h-4 w-4" />
                    </ToggleGroupItem>
                )
            })}
        </ToggleGroup>
      </div>
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
            onLoad={handleMapLoad}
            onClick={() => setSelectedLocation(null)}
          >
            {!isLoading && filteredLocations.map(loc => (
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
                onCloseClick={handleInfoWindowClose}
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
    </div>
  );
}
