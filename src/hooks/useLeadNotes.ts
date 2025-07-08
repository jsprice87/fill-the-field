import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getEffectiveUserId } from '@/utils/impersonationHelpers';

export interface LeadNote {
  id: string;
  lead_id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export const useLeadNotes = (leadId: string) => {
  return useQuery({
    queryKey: ['leadNotes', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead notes:', error);
        throw error;
      }

      return data as LeadNote[];
    },
    enabled: !!leadId,
  });
};

export const useCreateLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, body }: { leadId: string; body: string }) => {
      const effectiveUserId = await getEffectiveUserId();
      if (!effectiveUserId) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('lead_notes')
        .insert({
          lead_id: leadId,
          author_id: effectiveUserId,
          body: body.trim(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating lead note:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leadNotes', data.lead_id] });
      toast.success('Note added successfully');
    },
    onError: (error) => {
      console.error('Failed to create note:', error);
      toast.error('Failed to add note');
    },
  });
};

export const useUpdateLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, body }: { noteId: string; body: string }) => {
      const { data, error } = await supabase
        .from('lead_notes')
        .update({ 
          body: body.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select()
        .single();

      if (error) {
        console.error('Error updating lead note:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['leadNotes', data.lead_id] });
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    },
  });
};

export const useDeleteLeadNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from('lead_notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting lead note:', error);
        throw error;
      }

      return noteId;
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({ queryKey: ['leadNotes'] });
      toast.success('Note deleted successfully');
    },
    onError: (error) => {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    },
  });
};