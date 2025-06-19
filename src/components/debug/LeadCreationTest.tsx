
import React, { useState } from 'react';
import { Button } from '@mantine/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getFranchiseeIdFromSlug } from '@/utils/slugUtils';

interface LeadCreationTestProps {
  franchiseeSlug: string;
}

export const LeadCreationTest: React.FC<LeadCreationTestProps> = ({ franchiseeSlug }) => {
  const [isLoading, setIsLoading] = useState(false);

  const testLeadCreation = async () => {
    setIsLoading(true);
    try {
      console.log('Testing lead creation with slug:', franchiseeSlug);
      
      // Resolve franchisee ID
      const franchiseeId = await getFranchiseeIdFromSlug(franchiseeSlug);
      console.log('Resolved franchisee ID:', franchiseeId);
      
      if (!franchiseeId) {
        throw new Error('Could not resolve franchisee ID');
      }

      // Create test lead
      const testLead = {
        franchisee_id: franchiseeId, // Now using the correct franchisee table ID
        first_name: 'Test',
        last_name: 'User',
        email: `test+${Date.now()}@example.com`,
        phone: '555-123-4567',
        zip: '12345',
        source: 'test',
        status: 'new' as const
      };

      console.log('Creating test lead:', testLead);

      const { data, error } = await supabase
        .from('leads')
        .insert(testLead)
        .select()
        .single();

      if (error) {
        console.error('Error creating test lead:', error);
        throw error;
      }

      console.log('Test lead created successfully:', data);
      toast.success(`Test lead created successfully! ID: ${data.id}`);

    } catch (error) {
      console.error('Test failed:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-gray-50">
      <h3 className="font-bold mb-2">Lead Creation Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Test lead creation for slug: {franchiseeSlug}
      </p>
      <Button 
        onClick={testLeadCreation} 
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        {isLoading ? 'Testing...' : 'Test Lead Creation'}
      </Button>
    </div>
  );
};
