
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ParticipantData {
  id?: string;
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

export interface BookingFlowData {
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

export const useBookingFlow = (flowId?: string, franchiseeId?: string) => {
  const [flowData, setFlowData] = useState<BookingFlowData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(flowId || null);

  // Create a new flow
  const createFlow = useCallback(async (franchiseeSlug: string, initialData: Partial<BookingFlowData> = {}) => {
    setIsLoading(true);
    try {
      // Get franchisee by slug
      const { data: franchisee, error: franchiseeError } = await supabase
        .from('franchisees')
        .select('id')
        .eq('slug', franchiseeSlug)
        .single();

      if (franchiseeError || !franchisee) {
        throw new Error('Franchisee not found');
      }

      // Generate flow ID
      const newFlowId = crypto.randomUUID();

      // Create flow record
      const { error: flowError } = await supabase
        .from('booking_flows')
        .insert({
          flow_id: newFlowId,
          franchisee_id: franchisee.id,
          state_data: initialData
        });

      if (flowError) {
        throw flowError;
      }

      setCurrentFlowId(newFlowId);
      setFlowData(initialData);
      
      return newFlowId;
    } catch (error) {
      console.error('Error creating flow:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load flow data
  const loadFlow = useCallback(async (flowIdToLoad: string) => {
    setIsLoading(true);
    try {
      const { data: flow, error } = await supabase
        .from('booking_flows')
        .select('state_data, expires_at')
        .eq('flow_id', flowIdToLoad)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !flow) {
        throw new Error('Flow not found or expired');
      }

      setCurrentFlowId(flowIdToLoad);
      setFlowData(flow.state_data || {});
      
      return flow.state_data;
    } catch (error) {
      console.error('Error loading flow:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update flow data
  const updateFlow = useCallback(async (updates: Partial<BookingFlowData>) => {
    if (!currentFlowId) {
      throw new Error('No flow ID available');
    }

    const newData = { ...flowData, ...updates };
    
    try {
      const { error } = await supabase
        .from('booking_flows')
        .update({ 
          state_data: newData,
          expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // Extend expiry by 2 hours
        })
        .eq('flow_id', currentFlowId);

      if (error) {
        throw error;
      }

      setFlowData(newData);
      console.log('Flow updated:', newData);
    } catch (error) {
      console.error('Error updating flow:', error);
      throw error;
    }
  }, [currentFlowId, flowData]);

  // Helper functions
  const addParticipant = useCallback(async (participant: ParticipantData) => {
    const participantWithId = {
      ...participant,
      id: participant.id || crypto.randomUUID()
    };
    
    const currentParticipants = flowData.participants || [];
    await updateFlow({
      participants: [...currentParticipants, participantWithId]
    });
  }, [flowData.participants, updateFlow]);

  const removeParticipant = useCallback(async (participantId: string) => {
    const currentParticipants = flowData.participants || [];
    await updateFlow({
      participants: currentParticipants.filter(p => p.id !== participantId)
    });
  }, [flowData.participants, updateFlow]);

  const getParticipantCountForClass = useCallback((classScheduleId: string) => {
    return flowData.participants?.filter(p => p.classScheduleId === classScheduleId).length || 0;
  }, [flowData.participants]);

  // Auto-load flow on mount if flowId is provided
  useEffect(() => {
    if (flowId && !currentFlowId) {
      loadFlow(flowId).catch(console.error);
    }
  }, [flowId, currentFlowId, loadFlow]);

  return {
    flowData,
    isLoading,
    currentFlowId,
    createFlow,
    loadFlow,
    updateFlow,
    addParticipant,
    removeParticipant,
    getParticipantCountForClass,
    
    // Compatibility functions with existing code
    getLeadData: () => flowData.leadData,
    getLeadId: () => flowData.leadId,
    updateParentGuardianInfo: (info: any) => updateFlow({ parentGuardianInfo: info }),
    updateWaiverAccepted: (accepted: boolean) => updateFlow({ waiverAccepted: accepted }),
    updateCommunicationPermission: (permission: boolean) => updateFlow({ communicationPermission: permission }),
    updateMarketingPermission: (permission: boolean) => updateFlow({ marketingPermission: permission })
  };
};
