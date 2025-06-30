import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScrollArea, Text, Table, Menu, ActionIcon, Select } from '@mantine/core';
import { TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/mantine';
import { Button } from '@/components/mantine';
import { IconDotsVertical, IconPencil, IconTrash, IconArchive, IconRestore, IconEye, IconPhone, IconMail } from '@tabler/icons-react';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { useArchiveLead, useUnarchiveLead } from '@/hooks/useArchiveActions';
import { useDeleteLead } from '@/hooks/useDeleteActions';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import LeadContactCell from './LeadContactCell';
import LeadInfoCell from './LeadInfoCell';
import StatusBadge from './StatusBadge';
import LeadsTableEmpty from './LeadsTableEmpty';
import type { Lead } from '@/types';

interface LeadsTableProps {
  leads: Lead[];
  searchQuery?: string;
  showArchived?: boolean;
}

const LeadsTable: React.FC<LeadsTableProps> = ({ leads, searchQuery, showArchived = false }) => {
  const navigate = useNavigate();
  const { franchiseeSlug } = useParams<{ franchiseeSlug: string }>();
  const queryClient = useQueryClient();
  const archiveLead = useArchiveLead();
  const unarchiveLead = useUnarchiveLead();
  const deleteLead = useDeleteLead();
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [bulkStatusValue, setBulkStatusValue] = useState<string>('');

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
    
    const selectedCount = selectedLeads.size;
    const selectedIds = new Set(selectedLeads);
    
    // Immediately clear selection for instant feedback
    setSelectedLeads(new Set());
    
    try {
      const promises = Array.from(selectedIds).map(id => 
        showArchived ? unarchiveLead.mutateAsync(id) : archiveLead.mutateAsync(id)
      );
      await Promise.all(promises);
      
      toast.success(`${selectedCount} lead${selectedCount > 1 ? 's' : ''} ${showArchived ? 'unarchived' : 'archived'} successfully`);
    } catch (error) {
      console.error('Error in bulk archive operation:', error);
      toast.error(`Failed to ${showArchived ? 'unarchive' : 'archive'} leads`);
      // Re-select leads on error
      setSelectedLeads(selectedIds);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedLeads.size === 0) return;
    
    const selectedCount = selectedLeads.size;
    const selectedIds = new Set(selectedLeads);
    
    const confirmMessage = `Are you sure you want to permanently delete ${selectedCount} lead${selectedCount > 1 ? 's' : ''}? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    // Immediately clear selection for instant feedback
    setSelectedLeads(new Set());
    
    try {
      const promises = Array.from(selectedIds).map(id => deleteLead.mutateAsync(id));
      await Promise.all(promises);
      
      toast.success(`${selectedCount} lead${selectedCount > 1 ? 's' : ''} deleted successfully`);
    } catch (error) {
      console.error('Error in bulk delete operation:', error);
      toast.error('Failed to delete leads');
      // Re-select leads on error
      setSelectedLeads(selectedIds);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedLeads.size === 0 || !newStatus) return;
    
    const selectedCount = selectedLeads.size;
    const selectedIds = new Set(selectedLeads);
    
    // Immediately clear selection and reset dropdown for instant feedback
    setSelectedLeads(new Set());
    setBulkStatusValue('');
    
    try {
      const promises = Array.from(selectedIds).map(async (leadId) => {
        const { error } = await supabase
          .from('leads')
          .update({ status: newStatus as any })
          .eq('id', leadId);
        
        if (error) throw error;
      });
      
      await Promise.all(promises);
      
      // Force immediate data refresh
      await queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      const statusLabel = {
        'new': 'New',
        'booked_upcoming': 'Booked Upcoming',
        'booked_complete': 'Booked Complete',
        'no_show': 'No Show',
        'follow_up': 'Follow-up',
        'canceled': 'Canceled',
        'closed_lost': 'Closed Lost',
        'closed_won': 'Closed Won'
      }[newStatus] || newStatus;
      
      toast.success(`${selectedCount} lead${selectedCount > 1 ? 's' : ''} updated to ${statusLabel} successfully`);
    } catch (error) {
      console.error('Error in bulk status update:', error);
      toast.error('Failed to update lead status');
      // Re-select leads on error
      setSelectedLeads(selectedIds);
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

  const handleViewDetails = (leadId: string) => {
    if (franchiseeSlug) {
      navigate(`/${franchiseeSlug}/portal/leads/${leadId}`);
    } else {
      console.error('Missing franchiseeSlug for navigation');
      toast.error('Unable to navigate to lead details');
    }
  };

  return (
    <div className="space-y-4">
      {selectedLeads.size > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Text size="sm" fw={500}>
            {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
          </Text>
          <div className="flex gap-2 items-center">
            <Select
              placeholder="Update status..."
              value={bulkStatusValue}
              onChange={(value) => {
                setBulkStatusValue(value || '');
                if (value) {
                  handleBulkStatusUpdate(value);
                }
              }}
              data={[
                { value: 'new', label: 'New' },
                { value: 'booked_upcoming', label: 'Booked Upcoming' },
                { value: 'booked_complete', label: 'Booked Complete' },
                { value: 'no_show', label: 'No Show' },
                { value: 'follow_up', label: 'Follow-up' },
                { value: 'canceled', label: 'Canceled' },
                { value: 'closed_lost', label: 'Closed Lost' },
                { value: 'closed_won', label: 'Closed Won' }
              ]}
              size="sm"
              w={200}
              withinPortal
              clearable
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkArchive}
            >
              {showArchived ? <ArchiveRestore className="h-4 w-4 mr-2" /> : <Archive className="h-4 w-4 mr-2" />}
              {showArchived ? 'Unarchive' : 'Archive'} Selected
            </Button>
            <Button
              variant="outline"
              size="sm"
              color="red"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <Table stickyHeader id="leads-table">
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
                <StatusBadge 
                  leadId={lead.id}
                  currentStatus={lead.status as any}
                  interactive={true}
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
                    <IconPhone size={16} />
                  </Button>
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => handleEmailLead(lead.email)}
                    title="Email lead"
                  >
                    <IconMail size={16} />
                  </Button>
                </div>
              </TableCell>
              <TableCell style={{ padding: '12px 16px' }}>
                <Menu shadow="md" withinPortal position="bottom-end">
                  <Menu.Target>
                    <ActionIcon variant="subtle" size="sm">
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item 
                      leftSection={<IconEye size={14} />}
                      onClick={() => handleViewDetails(lead.id)}
                    >
                      View/Edit Lead
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={lead.archived_at ? <IconRestore size={14} /> : <IconArchive size={14} />}
                      onClick={() => handleArchiveToggle(lead.id)}
                    >
                      {lead.archived_at ? 'Unarchive' : 'Archive'}
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<IconTrash size={14} />}
                      color="red"
                      onClick={() => handleDelete(lead.id)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;
