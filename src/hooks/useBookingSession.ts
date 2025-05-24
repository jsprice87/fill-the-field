
import { useState, useEffect } from 'react';

interface BookingSessionData {
  leadId?: string;
  leadData?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    zip: string;
  };
  selectedLocation?: {
    id: string;
    name: string;
    address: string;
  };
  selectedClasses?: Array<{
    id: string;
    name: string;
    date: string;
    time: string;
  }>;
  participants?: Array<{
    firstName: string;
    birthDate: string;
    age: string;
    ageOverride?: boolean;
  }>;
  waiverAccepted?: boolean;
  childSpeaksEnglish?: boolean;
}

export const useBookingSession = () => {
  const [sessionData, setSessionData] = useState<BookingSessionData>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('booking-session');
    if (saved) {
      try {
        setSessionData(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading booking session:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateSession = (data: Partial<BookingSessionData>) => {
    const newData = { ...sessionData, ...data };
    setSessionData(newData);
    localStorage.setItem('booking-session', JSON.stringify(newData));
  };

  const clearSession = () => {
    setSessionData({});
    localStorage.removeItem('booking-session');
  };

  const getLeadData = () => {
    return sessionData.leadData;
  };

  const getLeadId = () => {
    return sessionData.leadId;
  };

  return {
    sessionData,
    updateSession,
    clearSession,
    getLeadData,
    getLeadId,
    isLoading
  };
};
