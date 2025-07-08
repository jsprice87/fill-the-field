import React, { useState, useMemo } from 'react';
import { 
  Container, 
  Paper, 
  Title, 
  Text, 
  Stack, 
  Group, 
  Button,
  Badge,
  ActionIcon,
  Menu,
  ScrollArea,
  Table,
  TextInput,
  Select,
  NumberInput,
  Grid,
  Card,
  Loader,
  Modal,
  Textarea
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/mantine/Table';
import { 
  MoreVertical, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Eye, 
  RotateCcw,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAdminTransactions, useTransactionStats, useRefundTransaction, Transaction } from '@/hooks/useAdminTransactions';
import { useAdminFranchisees } from '@/hooks/useAdminFranchisees';
import { useDisclosure } from '@mantine/hooks';
import { toast } from 'sonner';

const AdminTransactions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [franchiseeFilter, setFranchiseeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [amountMin, setAmountMin] = useState<number | string>('');
  const [amountMax, setAmountMax] = useState<number | string>('');
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [refundModalOpen, { open: openRefundModal, close: closeRefundModal }] = useDisclosure(false);
  const [refundAmount, setRefundAmount] = useState<number | string>('');
  const [refundReason, setRefundReason] = useState('');

  const { data: franchisees = [] } = useAdminFranchisees();
  const refundTransaction = useRefundTransaction();

  const filters = useMemo(() => ({
    search: searchTerm || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    franchisee_id: franchiseeFilter || undefined,
    date_from: dateFrom?.toISOString() || undefined,
    date_to: dateTo?.toISOString() || undefined,
    amount_min: typeof amountMin === 'number' ? amountMin : undefined,
    amount_max: typeof amountMax === 'number' ? amountMax : undefined,
  }), [searchTerm, statusFilter, typeFilter, franchiseeFilter, dateFrom, dateTo, amountMin, amountMax]);

  const { data: transactions = [], isLoading, error, refetch } = useAdminTransactions(filters);
  const { data: stats } = useTransactionStats(filters);

  const handleRefund = async () => {
    if (!selectedTransaction) return;

    try {
      await refundTransaction.mutateAsync({
        transactionId: selectedTransaction.id,
        amount: typeof refundAmount === 'number' ? refundAmount : undefined,
        reason: refundReason || undefined,
      });
      closeRefundModal();
      setRefundAmount('');
      setRefundReason('');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Franchisee', 'Amount', 'Status', 'Type', 'Description', 'Stripe ID'].join(','),
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        t.franchisee?.company_name || 'N/A',
        t.amount,
        t.status,
        t.type,
        t.description || '',
        t.stripe_payment_intent_id || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Transactions exported successfully!');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setFranchiseeFilter('');
    setDateFrom(null);
    setDateTo(null);
    setAmountMin('');
    setAmountMax('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      case 'canceled': return 'gray';
      default: return 'gray';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'blue';
      case 'refund': return 'orange';
      case 'adjustment': return 'violet';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  if (error) {
    return (
      <Container size="xl" py="lg">
        <Paper p="xl" withBorder>
          <Text c="red.6">Error loading transactions: {error.message}</Text>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={1}>Transaction Management</Title>
            <Text c="dimmed">
              Monitor and manage all payment transactions
            </Text>
          </div>
          <Group>
            <Button 
              leftSection={<RefreshCw size={16} />}
              variant="outline"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
            <Button 
              leftSection={<Download size={16} />}
              variant="outline"
              onClick={handleExport}
            >
              Export
            </Button>
          </Group>
        </Group>

        {/* Stats Cards */}
        {stats && (
          <Grid>
            <Grid.Col span={3}>
              <Card withBorder>
                <Group>
                  <DollarSign size={20} style={{ color: 'var(--mantine-color-blue-6)' }} />
                  <div>
                    <Text size="sm" c="dimmed">Total Revenue</Text>
                    <Text size="xl" fw={700}>{formatCurrency(stats.successful_amount)}</Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder>
                <Group>
                  <TrendingUp size={20} style={{ color: 'var(--mantine-color-green-6)' }} />
                  <div>
                    <Text size="sm" c="dimmed">Successful</Text>
                    <Text size="xl" fw={700}>{stats.successful_transactions}</Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder>
                <Group>
                  <Clock size={20} style={{ color: 'var(--mantine-color-yellow-6)' }} />
                  <div>
                    <Text size="sm" c="dimmed">Pending</Text>
                    <Text size="xl" fw={700}>{stats.pending_transactions}</Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
            <Grid.Col span={3}>
              <Card withBorder>
                <Group>
                  <AlertCircle size={20} style={{ color: 'var(--mantine-color-red-6)' }} />
                  <div>
                    <Text size="sm" c="dimmed">Failed</Text>
                    <Text size="xl" fw={700}>{stats.failed_transactions}</Text>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          </Grid>
        )}

        {/* Filters */}
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Filters</Text>
              <Button variant="subtle" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            </Group>
            
            <Grid>
              <Grid.Col span={4}>
                <TextInput
                  placeholder="Search transactions..."
                  leftSection={<Search size={16} />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <Select
                  placeholder="Status"
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value || '')}
                  data={[
                    { value: '', label: 'All Statuses' },
                    { value: 'succeeded', label: 'Succeeded' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'canceled', label: 'Canceled' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={2}>
                <Select
                  placeholder="Type"
                  value={typeFilter}
                  onChange={(value) => setTypeFilter(value || '')}
                  data={[
                    { value: '', label: 'All Types' },
                    { value: 'payment', label: 'Payment' },
                    { value: 'refund', label: 'Refund' },
                    { value: 'adjustment', label: 'Adjustment' },
                  ]}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <Select
                  placeholder="Franchisee"
                  value={franchiseeFilter}
                  onChange={(value) => setFranchiseeFilter(value || '')}
                  data={[
                    { value: '', label: 'All Franchisees' },
                    ...franchisees.map(f => ({ value: f.id, label: f.company_name }))
                  ]}
                  searchable
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <DateInput
                  placeholder="From date"
                  value={dateFrom}
                  onChange={setDateFrom}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <DateInput
                  placeholder="To date"
                  value={dateTo}
                  onChange={setDateTo}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <NumberInput
                  placeholder="Min amount"
                  value={amountMin}
                  onChange={setAmountMin}
                  leftSection="$"
                  decimalScale={2}
                />
              </Grid.Col>
              <Grid.Col span={3}>
                <NumberInput
                  placeholder="Max amount"
                  value={amountMax}
                  onChange={setAmountMax}
                  leftSection="$"
                  decimalScale={2}
                />
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>

        {/* Transactions Table */}
        <Paper p="lg" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Title order={3}>Transactions ({transactions.length})</Title>
            </Group>

            {isLoading ? (
              <Group justify="center" py="xl">
                <Loader size="md" />
                <Text c="dimmed">Loading transactions...</Text>
              </Group>
            ) : (
              <ScrollArea h="600px">
                <Table.ScrollContainer minWidth={1200}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Franchisee</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Stripe ID</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Text size="sm">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {new Date(transaction.created_at).toLocaleTimeString()}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Text fw={500}>{transaction.franchisee?.company_name || 'N/A'}</Text>
                            <Text size="sm" c="dimmed">{transaction.billing_email}</Text>
                          </TableCell>
                          <TableCell>
                            <Text fw={500} c={transaction.amount < 0 ? 'red' : 'green'}>
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Badge color={getStatusColor(transaction.status)} variant="light">
                              {transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge color={getTypeColor(transaction.type)} variant="light">
                              {transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Text size="sm">{transaction.description || 'N/A'}</Text>
                          </TableCell>
                          <TableCell>
                            <Text size="sm" c="dimmed">
                              {transaction.stripe_payment_intent_id || 'N/A'}
                            </Text>
                          </TableCell>
                          <TableCell>
                            <Menu shadow="md" width={200}>
                              <Menu.Target>
                                <ActionIcon variant="subtle" size="sm">
                                  <MoreVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  leftSection={<Eye size={14} />}
                                  onClick={() => console.log('View transaction details:', transaction.id)}
                                >
                                  View Details
                                </Menu.Item>
                                {transaction.type === 'payment' && transaction.status === 'succeeded' && (
                                  <Menu.Item
                                    leftSection={<RotateCcw size={14} />}
                                    onClick={() => {
                                      setSelectedTransaction(transaction);
                                      setRefundAmount(transaction.amount);
                                      openRefundModal();
                                    }}
                                  >
                                    Issue Refund
                                  </Menu.Item>
                                )}
                              </Menu.Dropdown>
                            </Menu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Table.ScrollContainer>
              </ScrollArea>
            )}
          </Stack>
        </Paper>

        {/* Refund Modal */}
        <Modal
          opened={refundModalOpen}
          onClose={closeRefundModal}
          title="Issue Refund"
          size="md"
        >
          <Stack gap="md">
            <Text size="sm">
              Issue a refund for transaction: {selectedTransaction?.id}
            </Text>
            
            <NumberInput
              label="Refund Amount"
              value={refundAmount}
              onChange={setRefundAmount}
              leftSection="$"
              decimalScale={2}
              max={selectedTransaction?.amount || 0}
            />
            
            <Textarea
              label="Reason (Optional)"
              placeholder="Enter reason for refund..."
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
            />
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={closeRefundModal}>
                Cancel
              </Button>
              <Button 
                onClick={handleRefund}
                loading={refundTransaction.isPending}
                color="orange"
              >
                Issue Refund
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
};

export default AdminTransactions;