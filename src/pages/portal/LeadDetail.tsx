import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Stack, Group } from '@mantine/core';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import LeadDetailsHeader from '@/components/leads/LeadDetailsHeader';
import LeadBookingsSection from '@/components/leads/LeadBookingsSection';
import LeadNotesSection from '@/components/leads/LeadNotesSection';
import { useUpdateLeadStatus } from '@/hooks/useLeadStatus';

interface Lead {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  source: string;
  status: string;
  notes: string | null;
  archived_at: string | null;
  franchisee_id: string;
  selected_location_id: string | null;
  booking_session_data: any;
  child_speaks_english: boolean | null;
  status_manually_set: boolean | null;
  updated_at: string;
}

interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
}

const LeadDetail: React.FC = () => {
  const { leadId, franchiseeSlug } = useParams<{ leadId: string; franchiseeSlug: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const updateLeadStatus = useUpdateLeadStatus();

  useEffect(() => {
    const fetchLead = async () => {
      setIsLoading(true);
      try {
        // First get the current user to find their franchisee
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in to view lead details");
          navigate(`/${franchiseeSlug}/portal/leads`);
          return;
        }

        // Get the user's franchisee ID
        const { data: franchisee, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (franchiseeError || !franchisee) {
          console.error("Error fetching franchisee:", franchiseeError);
          toast.error("Unable to verify account access");
          return;
        }

        // Now fetch the lead with franchisee filtering
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .eq('id', leadId)
          .eq('franchisee_id', franchisee.id)
          .single();

        if (error) {
          console.error("Error fetching lead:", error);
          if (error.code === 'PGRST116') {
            toast.error("Lead not found or you don't have permission to view it");
          } else {
            toast.error("Failed to load lead details");
          }
          setLead(null);
        } else {
          console.log("Lead data fetched successfully:", data);
          setLead(data as Lead);

          // Fetch location data if selected_location_id exists
          if (data.selected_location_id) {
            const { data: locationData, error: locationError } = await supabase
              .from('locations')
              .select('id, name, city, state')
              .eq('id', data.selected_location_id)
              .single();

            if (!locationError && locationData) {
              setLocation(locationData as Location);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching lead:", error);
        toast.error("Failed to load lead details");
        setLead(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (leadId && franchiseeSlug) {
      fetchLead();
    }
  }, [leadId, franchiseeSlug, navigate]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    await updateLeadStatus.mutateAsync({ leadId, status: newStatus });
    // Refresh lead data to show updated status
    if (lead) {
      setLead({ ...lead, status: newStatus, status_manually_set: true });
    }
  };

  const handleCallLead = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailLead = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  if (isLoading) {
    return <div className="text-center">Loading lead details...</div>;
  }

  if (!lead) {
    return <div className="text-center">Lead not found.</div>;
  }

  return (
    <Stack gap="lg">
      {/* Header with Back Button */}
      <Group>
        <Button 
          variant="outline" 
          leftSection={<ArrowLeft size={16} />}
          onClick={() => navigate(`/${franchiseeSlug}/portal/leads`)}
        >
          Back to Leads
        </Button>
      </Group>

      {/* Lead Details Header Section */}
      <LeadDetailsHeader
        lead={lead}
        location={location}
        onStatusChange={handleStatusChange}
        onCallLead={handleCallLead}
        onEmailLead={handleEmailLead}
        isUpdatingStatus={updateLeadStatus.isPending}
      />

      {/* Bookings Management Section */}
      <LeadBookingsSection leadId={lead.id} />

      {/* Notes Management Section */}
      <LeadNotesSection leadId={lead.id} />
    </Stack>
  );
};

export default LeadDetail;
