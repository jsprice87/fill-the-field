
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'soccer_stars_booking_session';

export interface ParticipantData {
  firstName: string;
  lastName: string;
  age: number;
  birthDate: string;
  classScheduleId: string;
  className: string;
  classTime: string;
  selectedDate: string;
  healthConditions?: string;
  ageOverride?: boolean;
}

export interface LocationData {
  id: string;
  name: string;
  address: string;
}

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  zip: string;
}

export interface BookingSessionData {
  leadId?: string;
  leadData?: LeadData;
  selectedLocation?: LocationData;
  participants?: ParticipantData[];
  parentGuardianInfo?: any;
  waiverAccepted?: boolean;
  communicationPermission?: boolean;
  marketingPermission?: boolean;
  childSpeaksEnglish?: boolean;
}

export const useBookingSession = () => {
  const [sessionData, setSessionData] = useState<BookingSessionData>({});

  // Load session data from localStorage on hook initialization
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        setSessionData(parsedData);
      } catch (error) {
        console.error('Failed to parse stored session data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save session data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
  }, [sessionData]);

  const updateSession = useCallback((updates: Partial<BookingSessionData>) => {
    setSessionData(prev => {
      const newData = { ...prev, ...updates };
      console.log('Session updated:', newData);
      return newData;
    });
  }, []);

  const clearSession = useCallback(() => {
    console.log('Clearing session data');
    setSessionData({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const addParticipant = useCallback((participant: ParticipantData) => {
    setSessionData(prev => ({
      ...prev,
      participants: [...(prev.participants || []), participant]
    }));
  }, []);

  const removeParticipant = useCallback((index: number) => {
    setSessionData(prev => ({
      ...prev,
      participants: prev.participants?.filter((_, i) => i !== index) || []
    }));
  }, []);

  const getLeadData = useCallback(() => {
    return sessionData.leadData;
  }, [sessionData.leadData]);

  const getLeadId = useCallback(() => {
    return sessionData.leadId;
  }, [sessionData.leadId]);

  const getParticipantCountForClass = useCallback((classScheduleId: string) => {
    return sessionData.participants?.filter(p => p.classScheduleId === classScheduleId).length || 0;
  }, [sessionData.participants]);

  return {
    sessionData,
    updateSession,
    clearSession,
    addParticipant,
    removeParticipant,
    getLeadData,
    getLeadId,
    getParticipantCountForClass
  };
};
