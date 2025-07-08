import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  franchisee_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  description?: string;
  metadata?: any;
  billing_email?: string;
  billing_name?: string;
  billing_address?: any;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  franchisee?: {
    id: string;
    company_name: string;
    contact_name: string;
    email: string;
    slug: string;
  };
}

export interface TransactionFilters {
  search?: string;
  status?: string;
  type?: string;
  franchisee_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
}

export interface TransactionStats {
  total_transactions: number;
  total_amount: number;
  successful_transactions: number;
  successful_amount: number;
  pending_transactions: number;
  pending_amount: number;
  failed_transactions: number;
  refunded_amount: number;
}

export const useAdminTransactions = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['admin-transactions', filters],
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          franchisee:franchisees!inner (
            id,
            company_name,
            contact_name,
            email,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.search) {
        query = query.or(`
          description.ilike.%${filters.search}%,
          billing_name.ilike.%${filters.search}%,
          billing_email.ilike.%${filters.search}%,
          stripe_payment_intent_id.ilike.%${filters.search}%
        `);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.franchisee_id) {
        query = query.eq('franchisee_id', filters.franchisee_id);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }

      if (filters.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }

      return data || [];
    },
    enabled: true,
  });
};

export const useTransactionStats = (filters: TransactionFilters = {}) => {
  return useQuery({
    queryKey: ['transaction-stats', filters],
    queryFn: async (): Promise<TransactionStats> => {
      let query = supabase
        .from('transactions')
        .select('amount, status, type, created_at');

      // Apply same filters as main query
      if (filters.franchisee_id) {
        query = query.eq('franchisee_id', filters.franchisee_id);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transaction stats:', error);
        throw error;
      }

      // Calculate stats
      const stats: TransactionStats = {
        total_transactions: data.length,
        total_amount: 0,
        successful_transactions: 0,
        successful_amount: 0,
        pending_transactions: 0,
        pending_amount: 0,
        failed_transactions: 0,
        refunded_amount: 0,
      };

      data.forEach(transaction => {
        stats.total_amount += transaction.amount;

        switch (transaction.status) {
          case 'succeeded':
            stats.successful_transactions++;
            stats.successful_amount += transaction.amount;
            break;
          case 'pending':
            stats.pending_transactions++;
            stats.pending_amount += transaction.amount;
            break;
          case 'failed':
            stats.failed_transactions++;
            break;
        }

        if (transaction.type === 'refund') {
          stats.refunded_amount += Math.abs(transaction.amount);
        }
      });

      return stats;
    },
    enabled: true,
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string; updates: Partial<Transaction> }) => {
      const { id, updates } = params;
      
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating transaction:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      toast.success('Transaction updated successfully');
    },
    onError: (error) => {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        console.error('Error creating transaction:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      toast.success('Transaction created successfully');
    },
    onError: (error) => {
      console.error('Error creating transaction:', error);
      toast.error('Failed to create transaction');
    },
  });
};

export const useRefundTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { transactionId: string; amount?: number; reason?: string }) => {
      const { transactionId, amount, reason } = params;
      
      // Get original transaction
      const { data: originalTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Create refund transaction
      const refundAmount = amount || originalTransaction.amount;
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          franchisee_id: originalTransaction.franchisee_id,
          user_id: originalTransaction.user_id,
          amount: -Math.abs(refundAmount),
          currency: originalTransaction.currency,
          status: 'succeeded',
          type: 'refund',
          description: reason || `Refund for transaction ${transactionId}`,
          stripe_payment_intent_id: originalTransaction.stripe_payment_intent_id,
          billing_email: originalTransaction.billing_email,
          billing_name: originalTransaction.billing_name,
          processed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating refund:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] });
      toast.success('Refund processed successfully');
    },
    onError: (error) => {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund');
    },
  });
};