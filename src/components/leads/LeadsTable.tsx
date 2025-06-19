import React, { useState } from 'react';
import { ScrollArea, Text, Table } from '@mantine/core';
import { TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/mantine';
import { Button } from '@/components/mantine';
import { MoreHorizontal, Edit, Trash2, Archive, ArchiveRestore, Eye, Phone, Mail } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useArchiveLead, useUnarchiveLead } from '@/hooks/useArchiveActions';
import { useDeleteLead } from '@/hooks/useDeleteActions';
import { toast } from 'sonner';
import LeadContactCell from './LeadContactCell';
import LeadInfoCell from './LeadInfoCell';
import StatusBadge from './StatusBadge';
import StatusSelect from './StatusSelect';
import LeadsTableEmpty from './LeadsTableEmpty';
import type { Lead } from '@/types';

interface LeadsTableProps {
  leads: Lead[];
  searchQuery?: string;
  showArchived?: boolean;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, searchQuery, showArchived = false }) => {
  const archiveLead = useArchiveLead();
  const unarchiveLead = useUnarchiveLead();
  const deleteLead = useDeleteLead();
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
        showArchived ? unarchiveLead.mutateAsync(id) : archiveLead.mutateAsync(id)
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
        await unarchiveLead.mutateAsync(leadId);
        toast.success('Lead unarchived successfully');
      } else {
        await archiveLead.mutateAsync(leadId);
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
      await deleteLead.mutateAsync(leadId);
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
          <Text size="sm" fw={500}>
            {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
          </Text>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkArchive}
          >
            {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
            {showArchived ? 'Unarchive' : 'Archive'} Selected
          </Button>
        </div>
      )}

      <ScrollArea h="calc(100vh - 240px)">
        <Table.ScrollContainer minWidth={900}>
          <Table stickyHeader>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '48px' }}>
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
                <TableHead style={{ width: '48px' }}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow 
                  key={lead.id} 
                  interactive
                  style={{
                    backgroundColor: selectedLeads.has(lead.id) ? 'var(--mantine-color-primary-1)' : 
                                    hoveredRow === lead.id ? 'var(--mantine-color-gray-1)' : 'transparent',
                    opacity: lead.archived_at ? 0.6 : 1
                  }}
                  onMouseEnter={() => setHoveredRow(lead.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <TableCell style={{ padding: '12px 16px' }}>
                    <input
                      type="checkbox"
                      checked={selectedLeads.has(lead.id)}
                      onChange={(e) => handleLeadSelection(lead.id, e.target.checked)}
                      className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                    />
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <LeadInfoCell 
                      firstName={lead.first_name}
                      lastName={lead.last_name}
                      email={lead.email}
                      phone={lead.phone}
                      notes={lead.notes}
                      archivedAt={lead.archived_at}
                    />
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <LeadContactCell 
                      email={lead.email}
                      phone={lead.phone}
                    />
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <Text size="sm" c="dimmed">
                      {lead.locations?.name || 'Not selected'}
                    </Text>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <StatusSelect 
                      leadId={lead.id}
                      currentStatus={lead.status as any}
                    />
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <Text size="sm" style={{ textTransform: 'capitalize' }}>
                      {lead.source || 'Unknown'}
                    </Text>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <Text size="sm" c="dimmed">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </Text>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <div className="flex gap-2">
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => handleCallLead(lead.phone)}
                        title="Call lead"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="subtle"
                        size="sm"
                        onClick={() => handleEmailLead(lead.email)}
                        title="Email lead"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell style={{ padding: '12px 16px' }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="subtle" size="sm">
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
        </Table.ScrollContainer>
      </ScrollArea>
    </div>
  );
};

export default LeadsTable;
