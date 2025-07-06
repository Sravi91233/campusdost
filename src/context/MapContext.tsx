'use client';

import React, { createContext, useState, useContext, useMemo } from 'react';

type MapContextType = {
  focusedVenueName: string | null;
  setFocusedVenueName: (name: string | null) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const [focusedVenueName, setFocusedVenueName] = useState<string | null>(null);

  const value = useMemo(() => ({
    focusedVenueName,
    setFocusedVenueName,
  }), [focusedVenueName]);

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
