import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Group, 
  Badge,
  Tabs,
  Loader,
  Breadcrumbs,
  Anchor,
  Divider
} from '@mantine/core';
import { ArrowLeft, Building, Mail, Phone, MapPin, Calendar, User } from 'lucide-react';
import { Button } from '@/components/mantine/Button';
import { useAdminFranchisees } from '@/hooks/useAdminFranchisees';
import { useLocations } from '@/hooks/useLocations';
import { useClasses } from '@/hooks/useClasses';
import { useLeads } from '@/hooks/useLeads';
import { useBookings } from '@/hooks/useBookings';
import LeadsTable from '@/components/leads/LeadsTable';
import BookingsTable from '@/components/bookings/BookingsTable';
import LocationsTable from '@/components/locations/LocationsTable';
import ClassesTable from '@/components/classes/ClassesTable';

const UserDetails: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('locations');

  // Get the specific user from the admin franchisees list
  const { data: franchisees = [], isLoading: isLoadingFranchisees } = useAdminFranchisees();
  const user = franchisees.find(f => f.id === userId);

  // Fetch user's data using existing hooks
  const { data: locations = [], isLoading: isLoadingLocations } = useLocations(userId);
  const { data: classes = [], isLoading: isLoadingClasses } = useClasses(userId);
  const { data: leads = [], isLoading: isLoadingLeads } = useLeads(userId);
  const { data: bookings = [], isLoading: isLoadingBookings } = useBookings(userId);

  const handleBackClick = () => {
    navigate('/admin/user-management');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'green';
      case 'inactive': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getTierColor = (tier?: string) => {
    switch (tier) {
      case 'premium': return 'blue';
      case 'pro': return 'purple';
      case 'free': return 'gray';
      default: return 'gray';
    }
  };

  if (isLoadingFranchisees) {
    return (
      <Container size="xl" py="xl">
        <div className="flex items-center justify-center py-8">
          <Loader size="lg" />
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container size="xl" py="xl">
        <Paper p="xl">
          <Text>User not found</Text>
          <Button onClick={handleBackClick} mt="md">
            Back to User Management
          </Button>
        </Paper>
      </Container>
    );
  }

  const isLoading = isLoadingLocations || isLoadingClasses || isLoadingLeads || isLoadingBookings;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs>
          <Anchor onClick={handleBackClick} style={{ cursor: 'pointer' }}>
            User Management
          </Anchor>
          <Text>{user.company_name}</Text>
        </Breadcrumbs>

        {/* Back Button */}
        <Button 
          leftSection={<ArrowLeft size={16} />} 
          variant="subtle" 
          onClick={handleBackClick}
          w="fit-content"
        >
          Back to User Management
        </Button>

        {/* User Details Header */}
        <Paper p="xl" shadow="sm">
          <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={2}>{user.company_name}</Title>
                <Text size="lg" c="dimmed" mt="xs">{user.contact_name}</Text>
              </div>
              <Group gap="sm">
                {user.subscription_tier && (
                  <Badge color={getTierColor(user.subscription_tier)} size="lg">
                    {user.subscription_tier.charAt(0).toUpperCase() + 
                     user.subscription_tier.slice(1)} Plan
                  </Badge>
                )}
                {user.subscription_status && (
                  <Badge color={getStatusColor(user.subscription_status)} size="lg">
                    {user.subscription_status.charAt(0).toUpperCase() + 
                     user.subscription_status.slice(1)}
                  </Badge>
                )}
              </Group>
            </Group>

            <Divider />

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Group gap="sm">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <Text size="sm" c="dimmed">Email</Text>
                  <Text size="sm">{user.email}</Text>
                </div>
              </Group>

              {user.phone && (
                <Group gap="sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <Text size="sm" c="dimmed">Phone</Text>
                    <Text size="sm">{user.phone}</Text>
                  </div>
                </Group>
              )}

              {(user.city || user.state) && (
                <Group gap="sm">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <Text size="sm" c="dimmed">Location</Text>
                    <Text size="sm">
                      {user.city && user.city}
                      {user.city && user.state && ', '}
                      {user.state && user.state}
                    </Text>
                  </div>
                </Group>
              )}

              <Group gap="sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <Text size="sm" c="dimmed">Created</Text>
                  <Text size="sm">{formatDate(user.created_at)}</Text>
                </div>
              </Group>

              <Group gap="sm">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <Text size="sm" c="dimmed">User ID</Text>
                  <Text size="sm" font="mono">{user.id}</Text>
                </div>
              </Group>

              {user.slug && (
                <Group gap="sm">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <Text size="sm" c="dimmed">Slug</Text>
                    <Text size="sm" font="mono">{user.slug}</Text>
                  </div>
                </Group>
              )}
            </div>
          </Stack>
        </Paper>

        {/* Tabbed Data Display */}
        <Paper p="xl" shadow="sm">
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="lg">
              <Tabs.Tab value="locations">
                Locations ({locations.length})
              </Tabs.Tab>
              <Tabs.Tab value="classes">
                Classes ({classes.length})
              </Tabs.Tab>
              <Tabs.Tab value="leads">
                Leads ({leads.length})
              </Tabs.Tab>
              <Tabs.Tab value="bookings">
                Bookings ({bookings.length})
              </Tabs.Tab>
            </Tabs.List>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="lg" />
              </div>
            ) : (
              <>
                <Tabs.Panel value="locations">
                  <LocationsTable 
                    locations={locations} 
                    hideInactive={false}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="classes">
                  <ClassesTable 
                    classes={classes}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="leads">
                  <LeadsTable 
                    leads={leads}
                  />
                </Tabs.Panel>

                <Tabs.Panel value="bookings">
                  <BookingsTable 
                    bookings={bookings}
                  />
                </Tabs.Panel>
              </>
            )}
          </Tabs>
        </Paper>
      </Stack>
    </Container>
  );
};

export default UserDetails;