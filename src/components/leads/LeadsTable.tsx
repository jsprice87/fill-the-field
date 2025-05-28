
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      <div className="text-center p-8">
        <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="font-agrandir text-xl text-brand-navy mb-2">No Leads Yet</h3>
        <p className="font-poppins text-gray-600 mb-6">
          When users sign up through your landing page, they'll appear here.
        </p>
        <Button className="bg-brand-blue hover:bg-brand-blue/90 text-white font-poppins">
          Share Your Landing Page
        </Button>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-agrandir">Lead</TableHead>
            <TableHead className="font-agrandir hidden md:table-cell">Contact</TableHead>
            <TableHead className="font-agrandir hidden lg:table-cell">ZIP</TableHead>
            <TableHead className="font-agrandir">Status</TableHead>
            <TableHead className="font-agrandir hidden md:table-cell">Source</TableHead>
            <TableHead className="font-agrandir hidden lg:table-cell">Created</TableHead>
            <TableHead className="font-agrandir">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-muted/50">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-agrandir font-medium text-brand-navy">
                    {lead.first_name} {lead.last_name}
                  </div>
                  <div className="md:hidden text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {lead.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {lead.phone}
                    </div>
                  </div>
                  {lead.notes && (
                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-1">
                      {lead.notes}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-3 w-3 mr-1" />
                    {lead.email}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-3 w-3 mr-1" />
                    {lead.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-3 w-3 mr-1" />
                  {lead.zip}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {getStatusBadge(lead.status)}
                  <div className="md:hidden text-xs text-gray-500">
                    from {lead.source?.replace('_', ' ') || 'unknown'}
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-gray-600">
                {lead.source?.replace('_', ' ') || 'unknown'}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(lead.created_at)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="text-xs">
                    Call
                  </Button>
                  <Button size="sm" className="bg-brand-red hover:bg-brand-red/90 text-white text-xs">
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
