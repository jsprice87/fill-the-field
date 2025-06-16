
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedTextarea } from '@/components/ui/enhanced-textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, Baby, User, Plus, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import StatusSelect from '@/components/leads/StatusSelect';

interface LeadDetailData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  status: string;
  source: string;
  notes?: string;
  child_speaks_english?: boolean;
  created_at: string;
  updated_at: string;
}

interface BookingData {
  id: string;
  selected_date: string;
  class_time: string;
  class_name: string;
  participant_name: string;
  participant_age: number;
  participant_birth_date: string;
  location_name: string;
  created_at: string;
}

interface NoteData {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
}

const LeadDetail: React.FC = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  // Fetch lead details
  const { data: lead, isLoading: leadLoading } = useQuery({
    queryKey: ['lead-detail', leadId],
    queryFn: async () => {
      if (!leadId) throw new Error('No lead ID provided');
      
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (error) throw error;
      return data as LeadDetailData;
    },
    enabled: !!leadId
  });

  // Fetch bookings for this lead
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['lead-bookings', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          selected_date,
          class_time,
          class_name,
          participant_name,
          participant_age,
          participant_birth_date,
          created_at,
          bookings!inner(
            lead_id,
            class_schedules!inner(
              classes!inner(
                locations!inner(name)
              )
            )
          )
        `)
        .eq('bookings.lead_id', leadId)
        .order('selected_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(appointment => ({
        id: appointment.id,
        selected_date: appointment.selected_date,
        class_time: appointment.class_time,
        class_name: appointment.class_name,
        participant_name: appointment.participant_name,
        participant_age: appointment.participant_age,
        participant_birth_date: appointment.participant_birth_date,
        location_name: appointment.bookings?.class_schedules?.classes?.locations?.name || 'Unknown Location',
        created_at: appointment.created_at
      })) as BookingData[];
    },
    enabled: !!leadId
  });

  // Fetch notes for this lead
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['lead-notes', leadId],
    queryFn: async () => {
      if (!leadId) return [];
      
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NoteData[];
    },
    enabled: !!leadId
  });

  // Mutation to add a new note
  const addNoteMutation = useMutation({
    mutationFn: async (noteBody: string) => {
      if (!leadId) throw new Error('No lead ID');
      
      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          body: noteBody,
          author_id: 'system' // In a real app, this would be the current user ID
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-notes', leadId] });
      setNewNote('');
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAge = (birthDateString: string, ageNumber: number) => {
    if (birthDateString) {
      const birthDate = new Date(birthDateString);
      const today = new Date();
      
      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      if (years > 0) {
        return months > 0 ? `${years}Y ${months}M` : `${years}Y`;
      } else {
        return `${months}M`;
      }
    }
    return `${ageNumber}Y`;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'new': 'bg-blue-100 text-blue-800',
      'booked_upcoming': 'bg-green-100 text-green-800',
      'booked_complete': 'bg-purple-100 text-purple-800',
      'no_show': 'bg-red-100 text-red-800',
      'follow_up': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-gray-100 text-gray-800',
      'closed_lost': 'bg-red-100 text-red-800',
      'closed_won': 'bg-emerald-100 text-emerald-800'
    };

    const labels = {
      'new': 'NEW',
      'booked_upcoming': 'BOOKED UPCOMING',
      'booked_complete': 'BOOKED COMPLETE',
      'no_show': 'NO SHOW',
      'follow_up': 'FOLLOW UP',
      'canceled': 'CANCELED',
      'closed_lost': 'CLOSED LOST',
      'closed_won': 'CLOSED WON'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.new}>
        {labels[status as keyof typeof labels] || status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('Please enter a note');
      return;
    }
    addNoteMutation.mutate(newNote.trim());
  };

  if (leadLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center p-8">
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">Lead Not Found</h3>
        <p className="font-poppins text-gray-600 mb-4">The lead you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/portal/leads')} className="bg-brand-blue hover:bg-brand-blue/90">
          Back to Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/portal/leads')}
          className="p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {lead.first_name} {lead.last_name}
          </h1>
          <p className="text-gray-600">Lead Details</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{lead.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{lead.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>ZIP: {lead.zip}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Created: {formatDate(lead.created_at)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">Source: {lead.source?.replace('_', ' ') || 'Unknown'}</p>
                {lead.child_speaks_english !== null && (
                  <p className="text-sm text-gray-600">
                    Child speaks English: {lead.child_speaks_english ? 'Yes' : 'No'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Bookings ({bookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-navy"></div>
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{booking.class_name}</h4>
                          <p className="text-sm text-gray-600">{booking.location_name}</p>
                        </div>
                        <Badge variant="outline">
                          {new Date(booking.selected_date).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Baby className="h-4 w-4" />
                          <span>{booking.participant_name} ({formatAge(booking.participant_birth_date, booking.participant_age)})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{booking.class_time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No bookings yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {getStatusBadge(lead.status)}
              <StatusSelect 
                leadId={lead.id}
                currentStatus={lead.status as any}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note with Enhanced Textarea */}
              <div className="space-y-4">
                <EnhancedTextarea
                  label="Add a note"
                  placeholder="Enter your note here..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  maxLength={500}
                  showCharacterCount
                  hint="Add important details about this lead"
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addNoteMutation.isPending}
                  className="w-full bg-brand-blue hover:bg-brand-blue/90"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                </Button>
              </div>

              {/* Notes List */}
              <div className="border-t pt-4">
                {notesLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-navy"></div>
                  </div>
                ) : notes.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notes.map((note) => (
                      <div key={note.id} className="bg-gray-50 rounded p-3">
                        <p className="text-sm mb-1">{note.body}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm text-center py-4">No notes yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeadDetail;
