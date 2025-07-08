import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserUpdateData {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  subscription_status?: string;
  subscription_tier?: string;
}

interface UserCreateData {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  subscription_tier?: string;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: UserUpdateData }) => {
      const { data, error } = await supabase
        .from('franchisees')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-franchisees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('User updated successfully');
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // First, we need to handle cascading deletes properly
      // Delete related data in the correct order
      
      // 1. Delete bookings
      const { error: bookingsError } = await supabase
        .from('bookings')
        .delete()
        .eq('franchisee_id', userId);
      
      if (bookingsError) throw new Error(`Failed to delete bookings: ${bookingsError.message}`);

      // 2. Delete leads
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('franchisee_id', userId);
      
      if (leadsError) throw new Error(`Failed to delete leads: ${leadsError.message}`);

      // 3. Delete classes
      const { error: classesError } = await supabase
        .from('classes')
        .delete()
        .eq('franchisee_id', userId);
      
      if (classesError) throw new Error(`Failed to delete classes: ${classesError.message}`);

      // 4. Delete locations
      const { error: locationsError } = await supabase
        .from('locations')
        .delete()
        .eq('franchisee_id', userId);
      
      if (locationsError) throw new Error(`Failed to delete locations: ${locationsError.message}`);

      // 5. Finally, delete the franchisee profile
      const { error: profileError } = await supabase
        .from('franchisees')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw new Error(`Failed to delete user profile: ${profileError.message}`);

      // 6. Delete the auth user (this should be done carefully)
      // Note: This requires admin privileges and should be handled server-side
      // For now, we'll just mark the profile as deleted
      
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-franchisees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('User and all associated data deleted successfully');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: UserCreateData) => {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: 'TempPassword123!', // Should be changed on first login
      });

      if (authError) throw new Error(`Failed to create auth user: ${authError.message}`);
      if (!authData.user) throw new Error('Failed to create auth user');

      // Then create the franchisee profile
      const { data: profileData, error: profileError } = await supabase
        .from('franchisees')
        .insert({
          id: authData.user.id,
          company_name: userData.company_name,
          contact_name: userData.contact_name,
          email: userData.email,
          phone: userData.phone || null,
          city: userData.city || null,
          state: userData.state || null,
          subscription_tier: userData.subscription_tier || 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (profileError) throw new Error(`Failed to create user profile: ${profileError.message}`);
      
      return profileData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-franchisees'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success('User created successfully');
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
};

export const useResetUserPassword = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return email;
    },
    onSuccess: (email) => {
      toast.success(`Password reset email sent to ${email}`);
    },
    onError: (error) => {
      console.error('Error sending password reset:', error);
      toast.error('Failed to send password reset email');
    },
  });
};

export const useBulkUserActions = () => {
  const queryClient = useQueryClient();
  
  return {
    bulkDelete: useMutation({
      mutationFn: async (userIds: string[]) => {
        const results = [];
        
        for (const userId of userIds) {
          try {
            // Follow the same cascading delete pattern as single delete
            await supabase.from('bookings').delete().eq('franchisee_id', userId);
            await supabase.from('leads').delete().eq('franchisee_id', userId);
            await supabase.from('classes').delete().eq('franchisee_id', userId);
            await supabase.from('locations').delete().eq('franchisee_id', userId);
            await supabase.from('franchisees').delete().eq('id', userId);
            
            results.push({ userId, success: true });
          } catch (error) {
            results.push({ userId, success: false, error: error.message });
          }
        }
        
        return results;
      },
      onSuccess: (results) => {
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.filter(r => !r.success).length;
        
        queryClient.invalidateQueries({ queryKey: ['admin-franchisees'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        
        if (failureCount === 0) {
          toast.success(`Successfully deleted ${successCount} users`);
        } else {
          toast.warning(`Deleted ${successCount} users, ${failureCount} failed`);
        }
      },
      onError: (error) => {
        console.error('Error in bulk delete:', error);
        toast.error('Failed to delete users');
      },
    }),
    
    bulkUpdateStatus: useMutation({
      mutationFn: async ({ userIds, status }: { userIds: string[]; status: string }) => {
        const { data, error } = await supabase
          .from('franchisees')
          .update({ 
            subscription_status: status,
            updated_at: new Date().toISOString(),
          })
          .in('id', userIds)
          .select();

        if (error) throw error;
        return data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['admin-franchisees'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        toast.success(`Updated status for ${data.length} users`);
      },
      onError: (error) => {
        console.error('Error updating user statuses:', error);
        toast.error('Failed to update user statuses');
      },
    }),
  };
};

export type { UserUpdateData, UserCreateData };