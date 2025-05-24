
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
  participants?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    age: number;
    classScheduleId: string;
    className: string;
    classTime: string;
    healthConditions?: string;
    ageOverride?: boolean;
  }>;
  parentGuardianInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    relationship: string;
  };
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

  const addParticipant = (participant: Omit<BookingSessionData['participants'][0], 'id'>) => {
    const newParticipant = {
      ...participant,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const currentParticipants = sessionData.participants || [];
    updateSession({
      participants: [...currentParticipants, newParticipant]
    });
  };

  const removeParticipant = (participantId: string) => {
    const currentParticipants = sessionData.participants || [];
    updateSession({
      participants: currentParticipants.filter(p => p.id !== participantId)
    });
  };

  const updateParentGuardianInfo = (info: BookingSessionData['parentGuardianInfo']) => {
    updateSession({ parentGuardianInfo: info });
  };

  const updateWaiverAccepted = (accepted: boolean) => {
    updateSession({ waiverAccepted: accepted });
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

  const getParticipantCountForClass = (classScheduleId: string) => {
    return (sessionData.participants || []).filter(p => p.classScheduleId === classScheduleId).length;
  };

  return {
    sessionData,
    updateSession,
    addParticipant,
    removeParticipant,
    updateParentGuardianInfo,
    updateWaiverAccepted,
    clearSession,
    getLeadData,
    getLeadId,
    getParticipantCountForClass,
    isLoading
  };
};
