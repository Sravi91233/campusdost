
'use client';

import React, { createContext, useState, useContext, useMemo, ReactNode, Dispatch, SetStateAction } from 'react';

type NotificationContextType = {
  unreadConnectionCount: number;
  setUnreadConnectionCount: Dispatch<SetStateAction<number>>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [unreadConnectionCount, setUnreadConnectionCount] = useState<number>(0);

  const value = useMemo(() => ({
    unreadConnectionCount,
    setUnreadConnectionCount,
  }), [unreadConnectionCount]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
