
import React, { createContext, useContext } from 'react';
import { useMetaPixel } from '@/hooks/useMetaPixel';

interface MetaPixelContextType {
  trackEvent: (eventName: string, parameters?: Record<string, unknown>) => void;
}

const MetaPixelContext = createContext<MetaPixelContextType | null>(null);

export const useMetaPixelTracking = () => {
  const context = useContext(MetaPixelContext);
  if (!context) {
    throw new Error('useMetaPixelTracking must be used within MetaPixelProvider');
  }
  return context;
};

interface MetaPixelProviderProps {
  children: React.ReactNode;
  franchiseeId: string;
}

export const MetaPixelProvider: React.FC<MetaPixelProviderProps> = ({ 
  children, 
  franchiseeId 
}) => {
  const { trackEvent } = useMetaPixel();

  return (
    <MetaPixelContext.Provider value={{ trackEvent }}>
      {children}
    </MetaPixelContext.Provider>
  );
};
