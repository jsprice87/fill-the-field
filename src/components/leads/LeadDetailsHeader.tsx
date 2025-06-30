import React, { useState } from 'react';
import { Card, Text, Badge, Button, Group, Stack, Grid } from '@mantine/core';
import { Phone, Mail, User, Calendar, MapPin, Globe, FileCheck, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatusBadge from './StatusBadge';

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

interface LeadDetailsHeaderProps {
  lead: Lead;
  location?: Location | null;
  onStatusChange: (leadId: string, newStatus: string) => void;
  onCallLead: (phone: string) => void;
  onEmailLead: (email: string) => void;
  isUpdatingStatus?: boolean;
}

const LeadDetailsHeader: React.FC<LeadDetailsHeaderProps> = ({
  lead,
  location,
  onStatusChange,
  onCallLead,
  onEmailLead,
  isUpdatingStatus = false
}) => {
  const leadAge = formatDistanceToNow(new Date(lead.created_at), { addSuffix: true });

  return (
    <Card withBorder>
      <Card.Section p="md" withBorder>
        <Group justify="space-between" align="flex-start">
          <div>
            <Group gap="sm" align="center" mb="xs">
              <User size={20} />
              <Text size="xl" fw={600}>
                {lead.first_name} {lead.last_name}
              </Text>
              {lead.archived_at && (
                <Badge color="gray" variant="outline">Archived</Badge>
              )}
            </Group>
            
            <Stack gap="sm">
              <Group gap="md" align="center">
                <Text size="sm" fw={500} c="dimmed">Status:</Text>
                <StatusBadge 
                  leadId={lead.id}
                  currentStatus={lead.status as any}
                  interactive={true}
                  size="sm"
                />
              </Group>
              
              <Group gap="xs">
                <Button
                  variant="outline"
                  size="sm"
                  leftSection={<Phone size={16} />}
                  onClick={() => onCallLead(lead.phone)}
                >
                  Call
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  leftSection={<Mail size={16} />}
                  onClick={() => onEmailLead(lead.email)}
                >
                  Email
                </Button>
              </Group>
            </Stack>
          </div>
        </Group>
      </Card.Section>

      <Card.Section p="md">
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="sm">
              <Group gap="xs" align="flex-start">
                <Mail size={16} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" c="dimmed">Email</Text>
                  <Text size="sm" fw={500}>{lead.email}</Text>
                </div>
              </Group>

              <Group gap="xs" align="flex-start">
                <Phone size={16} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" c="dimmed">Phone</Text>
                  <Text size="sm" fw={500}>{lead.phone}</Text>
                </div>
              </Group>

              <Group gap="xs" align="flex-start">
                <MapPin size={16} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" c="dimmed">Location</Text>
                  <Text size="sm" fw={500}>
                    {location ? `${location.name} (${location.city}, ${location.state})` : 'Not selected'}
                  </Text>
                </div>
              </Group>

              <Group gap="xs" align="flex-start">
                <MapPin size={16} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" c="dimmed">Zip Code</Text>
                  <Text size="sm" fw={500}>{lead.zip}</Text>
                </div>
              </Group>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Stack gap="sm">
              <Group gap="xs" align="flex-start">
                <Calendar size={16} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" c="dimmed">Lead Age</Text>
                  <Text size="sm" fw={500}>{leadAge}</Text>
                </div>
              </Group>

              <Group gap="xs" align="flex-start">
                <Globe size={16} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" c="dimmed">Child Speaks English</Text>
                  <Text size="sm" fw={500}>
                    {lead.child_speaks_english === null ? 'Not specified' : 
                     lead.child_speaks_english ? 'Yes' : 'No'}
                  </Text>
                </div>
              </Group>

              <Group gap="xs" align="flex-start">
                <FileCheck size={16} style={{ marginTop: 2 }} />
                <div>
                  <Text size="sm" c="dimmed">Lead Source</Text>
                  <Text size="sm" fw={500} style={{ textTransform: 'capitalize' }}>
                    {lead.source || 'Unknown'}
                  </Text>
                </div>
              </Group>

              {lead.status_manually_set && (
                <Group gap="xs" align="flex-start">
                  <Bell size={16} style={{ marginTop: 2 }} />
                  <div>
                    <Text size="sm" c="dimmed">Status Override</Text>
                    <Text size="sm" fw={500} c="orange">Manual</Text>
                  </div>
                </Group>
              )}
            </Stack>
          </Grid.Col>
        </Grid>
      </Card.Section>
    </Card>
  );
};

export default LeadDetailsHeader;