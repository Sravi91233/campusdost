
"use client"

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useJsApiLoader, GoogleMap, MarkerF, InfoWindowF, Polygon, DirectionsRenderer } from "@react-google-maps/api";
import type { MapLocation, MapCorners } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Search, BedDouble, Utensils, Library, Building2, School, Landmark, Navigation, XCircle, Loader2 } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useMap } from "@/context/MapContext";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

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


export function CampusMap({ initialLocations, initialCorners }: { initialLocations: MapLocation[], initialCorners: MapCorners | null }) {
  // Use props to keep the component in sync with real-time updates from parent
  const locations = initialLocations;
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const { focusedVenueName, setFocusedVenueName } = useMap();
  const mapRef = useRef<google.maps.Map | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false);
  const { toast } = useToast();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    id: 'google-map-script'
  });

  const polygonPath = useMemo(() => {
    if (!initialCorners) return [];
    return [initialCorners.nw, initialCorners.sw, initialCorners.se, initialCorners.ne];
  }, [initialCorners]);

  const mapRestrictionBounds = useMemo(() => {
    if (!initialCorners) return null;
    const lats = Object.values(initialCorners).map(c => c.lat);
    const lngs = Object.values(initialCorners).map(c => c.lng);
    return {
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    };
  }, [initialCorners]);

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    zoomControl: true,
    restriction: mapRestrictionBounds ? {
      latLngBounds: mapRestrictionBounds,
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
  }), [mapRestrictionBounds]);


  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
  };

  const filteredLocations = useMemo(() => {
    let results = locations;

    if (searchTerm.trim() !== "") {
      results = results.filter(loc => 
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (activeFilters.length > 0) {
      results = results.filter(loc => activeFilters.includes(loc.icon));
    }
    
    return results;
  }, [locations, searchTerm, activeFilters]);

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
  
    // Case 1: No locations match the current filters.
    if (filteredLocations.length === 0 && (searchTerm || activeFilters.length > 0)) {
      setSelectedLocation(null);
      mapRef.current.panTo(LPU_COORDS);
      mapRef.current.setZoom(16);
      return;
    }
  
    // Case 2: Exactly one location matches. Point to it.
    if (filteredLocations.length === 1) {
      mapRef.current.panTo(filteredLocations[0].position);
      mapRef.current.setZoom(17);
      setSelectedLocation(filteredLocations[0]);
      return;
    }
  
    // Case 3: Multiple locations match. Fit them in view and close any info window.
    if (filteredLocations.length > 1) {
      setSelectedLocation(null);
      const bounds = new window.google.maps.LatLngBounds();
      filteredLocations.forEach(loc => {
        bounds.extend(loc.position);
      });
      mapRef.current.fitBounds(bounds);
    } else {
      // Case 4: Initial state with no filters. Reset view to overall bounds.
      setSelectedLocation(null);
      if (mapRef.current && mapRestrictionBounds) {
        const bounds = new window.google.maps.LatLngBounds(
          { lat: mapRestrictionBounds.south, lng: mapRestrictionBounds.west },
          { lat: mapRestrictionBounds.north, lng: mapRestrictionBounds.east }
        );
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [filteredLocations, locations.length, searchTerm, activeFilters, mapRestrictionBounds]);


  const handleInfoWindowClose = () => {
    setSelectedLocation(null);
    if(focusedVenueName) {
      setFocusedVenueName(null);
    }
  };

  const handleGetDirections = (destination: MapLocation) => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation is not supported by your browser.', variant: 'destructive' });
      return;
    }
    setIsDirectionsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = { lat: position.coords.latitude, lng: position.coords.longitude };
        const directionsService = new window.google.maps.DirectionsService();
        
        directionsService.route(
          {
            origin,
            destination: destination.position,
            travelMode: window.google.maps.TravelMode.WALKING,
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK && result) {
              setDirections(result);
              setSelectedLocation(null); // Close info window
            } else {
              toast({ title: 'Error fetching directions', description: 'Could not calculate the route. Please try again.', variant: 'destructive' });
            }
            setIsDirectionsLoading(false);
          }
        );
      },
      () => {
        toast({ title: 'Unable to retrieve your location', description: 'Please enable location services to get directions.', variant: 'destructive' });
        setIsDirectionsLoading(false);
      }
    );
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

  if (!isLoaded) {
    return (
      <div className="space-y-4">
         <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 flex-grow" />
            <Skeleton className="h-10 w-[196px]" />
         </div>
         <Skeleton className="w-full h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search location..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={!!directions}
          />
        </div>
        <div className="flex gap-2">
          <ToggleGroup
              type="multiple"
              variant="outline"
              value={activeFilters}
              onValueChange={(value) => setActiveFilters(value)}
              className="flex-wrap justify-start"
              aria-disabled={!!directions}
            >
              {availableIcons.map(iconName => {
                  const IconComponent = iconMap[iconName];
                  return (
                      <ToggleGroupItem key={iconName} value={iconName} aria-label={iconName} disabled={!!directions}>
                          <IconComponent className="h-4 w-4" />
                      </ToggleGroupItem>
                  )
              })}
          </ToggleGroup>
          {directions && (
            <Button variant="destructive" onClick={() => setDirections(null)}>
                <XCircle className="mr-2" />
                Clear Directions
            </Button>
          )}
        </div>
      </div>
      <div className="w-full relative" style={mapContainerStyle}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%' }}
            center={LPU_COORDS}
            zoom={16}
            options={mapOptions}
            onLoad={handleMapLoad}
            onClick={() => setSelectedLocation(null)}
          >
            {polygonPath.length > 0 && (
              <Polygon
                paths={polygonPath}
                options={{
                  fillColor: "hsl(var(--primary))",
                  fillOpacity: 0.1,
                  strokeColor: "hsl(var(--primary))",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                  clickable: false,
                  draggable: false,
                  editable: false,
                  geodesic: false,
                  zIndex: 1,
                }}
              />
            )}

            {!directions && filteredLocations.map(loc => (
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
                   <Button
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => handleGetDirections(selectedLocation)}
                      disabled={isDirectionsLoading}
                  >
                      {isDirectionsLoading ? <Loader2 className="mr-2 animate-spin" /> : <Navigation className="mr-2" />}
                      Get Directions
                  </Button>
                </div>
              </InfoWindowF>
            )}

            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
      </div>
    </div>
  );
}
