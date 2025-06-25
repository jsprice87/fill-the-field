import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@mantine/core';
import { Card } from '@mantine/core';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, Clock, MessageSquare, Archive, ArchiveRestore } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

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

const LeadDetail: React.FC = () => {
  const { leadId, franchiseeSlug } = useParams<{ leadId: string; franchiseeSlug: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);

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

  const handleArchive = async () => {
    if (!leadId) {
      toast.error("Lead ID is missing");
      return;
    }

    setIsArchiving(true);
    try {
      const newArchivedAt = lead?.archived_at ? null : new Date().toISOString();
      
      const { error } = await supabase
        .from('leads')
        .update({ archived_at: newArchivedAt })
        .eq('id', leadId);

      if (error) {
        console.error("Error archiving lead:", error);
        toast.error("Failed to archive lead");
      } else {
        toast.success(`Lead ${lead?.archived_at ? 'restored' : 'archived'} successfully`);
        navigate(`/${franchiseeSlug}/portal/leads`);
      }
    } catch (error) {
      console.error("Error archiving lead:", error);
      toast.error("Failed to archive lead");
    } finally {
      setIsArchiving(false);
    }
  };

  const leadAge = lead ? formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }) : 'Loading...';

  if (isLoading) {
    return <div className="text-center">Loading lead details...</div>;
  }

  if (!lead) {
    return <div className="text-center">Lead not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/${franchiseeSlug}/portal/leads`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Lead Details</h1>
        </div>
        <Button
          variant="outline"
          onClick={handleArchive}
          disabled={isArchiving}
        >
          {isArchiving ? (
            <span className="animate-pulse">Updating...</span>
          ) : lead.archived_at ? (
            <>
              <ArchiveRestore className="h-4 w-4 mr-2" />
              Restore Lead
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 mr-2" />
              Archive Lead
            </>
          )}
        </Button>
      </div>

      <Card>
        <Card.Section>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Personal Information</h3>
          </Card.Section>
        </Card.Section>
        <Card.Section className="space-y-4 p-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">First Name</div>
              <div className="text-gray-900">{lead.first_name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Last Name</div>
              <div className="text-gray-900">{lead.last_name}</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Email</div>
              <div className="text-gray-900">
                <a href={`mailto:${lead.email}`} className="text-blue-500 hover:underline">
                  {lead.email}
                </a>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Phone</div>
              <div className="text-gray-900">
                <a href={`tel:${lead.phone}`} className="text-blue-500 hover:underline">
                  {lead.phone}
                </a>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700">Zip Code</div>
              <div className="text-gray-900">{lead.zip}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700">Source</div>
              <div className="text-gray-900">{lead.source}</div>
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Lead Age</div>
            <div className="text-gray-900">{leadAge}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-700">Status</div>
            <div className="text-gray-900">
              <Badge variant="secondary">{lead.status}</Badge>
            </div>
          </div>
        </Card.Section>
      </Card>

      <Card>
        <Card.Section>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <MessageSquare className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Notes</h3>
          </Card.Section>
        </Card.Section>
        <Card.Section className="p-4">
          {lead.notes ? (
            <div className="text-gray-900">{lead.notes}</div>
          ) : (
            <div className="text-gray-500">No notes available.</div>
          )}
        </Card.Section>
      </Card>
    </div>
  );
};

export default LeadDetail;
