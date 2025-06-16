
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash2, Archive, ArchiveRestore, Eye, Phone, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useArchiveActions } from '@/hooks/useArchiveActions';
import { useDeleteActions } from '@/hooks/useDeleteActions';
import { toast } from 'sonner';
import LeadContactCell from './LeadContactCell';
import LeadInfoCell from './LeadInfoCell';
import StatusBadge from './StatusBadge';
import StatusSelect from './StatusSelect';
import LeadsTableEmpty from './LeadsTableEmpty';

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  zip: string;
  source: string | null;
  status: string;
  created_at: string;
  archived_at: string | null;
  notes: string | null;
  selected_location_id: string | null;
  locations?: {
    name: string;
  };
}

interface LeadsTableProps {
  leads: Lead[];
  searchQuery?: string;
  showArchived?: boolean;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, searchQuery, showArchived = false }) => {
  const { archiveLead, unarchiveLead } = useArchiveActions();
  const { deleteLead } = useDeleteActions();
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  if (!leads || leads.length === 0) {
    return <LeadsTableEmpty searchQuery={searchQuery} showArchived={showArchived} />;
  }

  const handleLeadSelection = (leadId: string, selected: boolean) => {
    const newSelection = new Set(selectedLeads);
    if (selected) {
      newSelection.add(leadId);
    } else {
      newSelection.delete(leadId);
    }
    setSelectedLeads(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedLeads.size === leads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(leads.map(lead => lead.id)));
    }
  };

  const handleBulkArchive = async () => {
    if (selectedLeads.size === 0) return;
    
    try {
      const promises = Array.from(selectedLeads).map(id => 
        showArchived ? unarchiveLead(id) : archiveLead(id)
      );
      await Promise.all(promises);
      
      toast.success(`${selectedLeads.size} lead${selectedLeads.size > 1 ? 's' : ''} ${showArchived ? 'unarchived' : 'archived'} successfully`);
      setSelectedLeads(new Set());
    } catch (error) {
      console.error('Error in bulk archive operation:', error);
      toast.error(`Failed to ${showArchived ? 'unarchive' : 'archive'} leads`);
    }
  };

  const handleArchiveToggle = async (leadId: string) => {
    try {
      const lead = leads.find(l => l.id === leadId);
      if (!lead) return;

      if (lead.archived_at) {
        await unarchiveLead(leadId);
        toast.success('Lead unarchived successfully');
      } else {
        await archiveLead(leadId);
        toast.success('Lead archived successfully');
      }
    } catch (error) {
      console.error('Error toggling archive status:', error);
      toast.error('Failed to update lead');
    }
  };

  const handleDelete = async (leadId: string) => {
    if (!confirm('Are you sure you want to permanently delete this lead? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteLead(leadId);
      toast.success('Lead deleted successfully');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const handleCallLead = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleEmailLead = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <div className="space-y-4">
      {selectedLeads.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <span className="text-body-sm font-medium">
            {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
            className="ui-hover"
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Unarchive' : 'Archive'} Selected
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={selectedLeads.size === leads.length && leads.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </TableHead>
            <TableHead>Lead Info</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Quick Actions</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow 
              key={lead.id} 
              interactive
              className={`
                ${selectedLeads.has(lead.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                ${hoveredRow === lead.id ? 'bg-gray-50 dark:bg-gray-800' : ''}
                ${lead.archived_at ? 'opacity-60' : ''}
              `}
              onMouseEnter={() => setHoveredRow(lead.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedLeads.has(lead.id)}
                  onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
              </TableCell>
              <TableCell>
                <LeadInfoCell 
                  firstName={lead.first_name}
                  lastName={lead.last_name}
                  zip={lead.zip}
                  notes={lead.notes}
                />
              </TableCell>
              <TableCell>
                <LeadContactCell 
                  email={lead.email}
                  phone={lead.phone}
                />
              </TableCell>
              <TableCell>
                <span className="text-body-sm text-muted-foreground">
                  {lead.locations?.name || 'Not selected'}
                </span>
              </TableCell>
              <TableCell>
                <StatusSelect 
                  leadId={lead.id}
                  currentStatus={lead.status}
                />
              </TableCell>
              <TableCell>
                <span className="text-body-sm capitalize">
                  {lead.source || 'Unknown'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-body-sm text-muted-foreground">
                  {new Date(lead.created_at).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCallLead(lead.phone)}
                    className="ui-hover"
                    title="Call lead"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEmailLead(lead.email)}
                    className="ui-hover"
                    title="Email lead"
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="ui-hover">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Lead
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleArchiveToggle(lead.id)}>
                      {lead.archived_at ? (
                        <>
                          <ArchiveRestore className="h-4 w-4 mr-2" />
                          Unarchive
                        </>
                      ) : (
                        <>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(lead.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
