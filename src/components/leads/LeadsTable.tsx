
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Calendar, User } from 'lucide-react';
import { Lead } from '@/hooks/useLeads';

interface LeadsTableProps {
  leads: Lead[];
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads }) => {
  const getStatusBadge = (status: string) => {
    const variants = {
      'new': 'bg-blue-100 text-blue-800',
      'contacted': 'bg-yellow-100 text-yellow-800',
      'interested': 'bg-green-100 text-green-800',
      'converted': 'bg-purple-100 text-purple-800',
      'not_interested': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.new}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (leads.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="font-agrandir text-xl text-brand-navy mb-2">No Leads Yet</h3>
          <p className="font-poppins text-gray-600 mb-6">
            When users sign up through your landing page, they'll appear here.
          </p>
          <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins">
            Share Your Landing Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="font-agrandir text-lg text-brand-navy">
                    {lead.first_name} {lead.last_name}
                  </h3>
                  {getStatusBadge(lead.status)}
                  <span className="text-sm text-gray-500 font-poppins">
                    from {lead.source?.replace('_', ' ') || 'unknown'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-4 w-4 mr-2 text-brand-blue" />
                    <span className="font-poppins">{lead.email}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2 text-brand-blue" />
                    <span className="font-poppins">{lead.phone}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-brand-blue" />
                    <span className="font-poppins">ZIP: {lead.zip}</span>
                  </div>
                </div>

                {lead.notes && (
                  <div className="mt-3 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700 font-poppins">{lead.notes}</p>
                  </div>
                )}
                
                <div className="flex items-center mt-3 text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span className="font-poppins">Created: {formatDate(lead.created_at)}</span>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" className="font-poppins">
                  Contact
                </Button>
                <Button size="sm" className="bg-brand-red hover:bg-brand-red/90 text-white font-poppins">
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadsTable;
