
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, User, MessageSquare, Baby } from 'lucide-react';
import { useLead, useLeadNotes, useAddLeadNote, useUpdateLeadStatus, LeadStatus } from '@/hooks/useLeads';

const LeadDetail: React.FC = () => {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const [noteText, setNoteText] = useState('');
  
  const { data: lead, isLoading: leadLoading } = useLead(leadId);
  const { data: notes = [], isLoading: notesLoading } = useLeadNotes(leadId);
  const addNoteMutation = useAddLeadNote();
  const updateStatusMutation = useUpdateLeadStatus();

  const getStatusBadge = (status: LeadStatus) => {
    const variants = {
      'new': 'bg-blue-100 text-blue-800',
      'booked_upcoming': 'bg-green-100 text-green-800',
      'booked_complete': 'bg-purple-100 text-purple-800',
      'no_show': 'bg-gray-100 text-gray-800',
      'follow_up': 'bg-yellow-100 text-yellow-800',
      'canceled': 'bg-red-100 text-red-800',
      'closed_lost': 'bg-red-100 text-red-800',
      'closed_won': 'bg-green-100 text-green-800'
    };
    
    const labels = {
      'new': 'New',
      'booked_upcoming': 'Booked, Upcoming',
      'booked_complete': 'Booked, Complete',
      'no_show': 'No-Show',
      'follow_up': 'Follow-Up',
      'canceled': 'Canceled',
      'closed_lost': 'Closed Lost',
      'closed_won': 'Closed Won'
    };
    
    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  const handleAddNote = async () => {
    if (!leadId || !noteText.trim()) return;
    
    try {
      await addNoteMutation.mutateAsync({
        leadId,
        body: noteText
      });
      setNoteText('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!leadId) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        leadId,
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (leadLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-navy"></div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/portal/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
        </div>
        <div className="text-center p-8">
          <h3 className="font-agrandir text-xl text-brand-navy mb-2">Lead Not Found</h3>
          <p className="font-poppins text-gray-600">The lead you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/portal/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-agrandir">
              {lead.first_name} {lead.last_name}
            </h1>
            <p className="text-gray-600 font-poppins">Lead Details</p>
          </div>
        </div>
        
        {/* Status Selector */}
        <div className="flex items-center gap-4">
          {getStatusBadge(lead.status)}
          <Select
            value={lead.status}
            onValueChange={handleStatusChange}
            disabled={updateStatusMutation.isPending}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="booked_upcoming">Booked, Upcoming</SelectItem>
              <SelectItem value="booked_complete">Booked, Complete</SelectItem>
              <SelectItem value="no_show">No-Show</SelectItem>
              <SelectItem value="follow_up">Follow-Up</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="font-agrandir">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{lead.first_name} {lead.last_name}</p>
                    <p className="text-sm text-gray-600">Parent/Guardian</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{lead.email}</p>
                    <p className="text-sm text-gray-600">Email</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{lead.phone}</p>
                    <p className="text-sm text-gray-600">Phone</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{lead.zip}</p>
                    <p className="text-sm text-gray-600">ZIP Code</p>
                  </div>
                </div>
              </div>
              
              {lead.source && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Lead Source</p>
                  <p className="font-medium capitalize">{lead.source.replace('_', ' ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="font-agrandir">Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.bookings && lead.bookings.length > 0 ? (
                <div className="space-y-4">
                  {lead.bookings.map((booking: any) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      {booking.appointments?.map((appointment: any) => (
                        <div key={appointment.id} className="space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{appointment.class_name}</h4>
                              <p className="text-sm text-gray-600">
                                {appointment.class_schedules?.classes?.locations?.name}
                              </p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="font-medium">{formatDate(appointment.selected_date)}</p>
                              <p className="text-gray-600">{formatTime(appointment.class_time)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Baby className="h-4 w-4" />
                            <span>{appointment.participant_name}</span>
                            <span>•</span>
                            <span>{formatAge(appointment.participant_birth_date, appointment.participant_age)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No bookings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Notes Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-agrandir flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Add a note about this lead..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-24"
                />
                <Button 
                  onClick={handleAddNote}
                  disabled={!noteText.trim() || addNoteMutation.isPending}
                  className="w-full"
                >
                  {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notesLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-navy mx-auto"></div>
                  </div>
                ) : notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm">{note.body}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(note.created_at)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No notes yet</p>
                  </div>
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
