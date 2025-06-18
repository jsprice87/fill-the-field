
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { BookingFlowData } from '@/hooks/useBookingFlow';

interface FranchiseeData {
  id: string;
  company_name: string;
  [key: string]: any;
}

export const useFranchiseeWaiver = (flowData: BookingFlowData) => {
  const [customWaiver, setCustomWaiver] = useState<string>('');
  const [franchiseeData, setFranchiseeData] = useState<FranchiseeData | null>(null);

  useEffect(() => {
    const loadFranchiseeData = async () => {
      console.log('Loading franchisee data, flowData:', flowData);
      
      const selectedLocation = flowData.selectedLocation;
      let franchiseeId = null;
      
      if (selectedLocation) {
        console.log('Selected location:', selectedLocation);
        const { data: location, error: locationError } = await supabase
          .from('locations')
          .select('franchisee_id')
          .eq('id', selectedLocation.id)
          .single();
          
        if (!locationError && location) {
          franchiseeId = location.franchisee_id;
          console.log('Got franchisee ID from location:', franchiseeId);
        } else {
          console.error('Error getting franchisee from location:', locationError);
        }
      }
      
      if (!franchiseeId) {
        console.log('No franchisee ID from location, checking URL...');
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1) {
          const slug = pathParts[1];
          console.log('Trying to get franchisee by slug:', slug);
          
          const { data: franchisee, error: franchiseeError } = await supabase
            .from('franchisees')
            .select('id')
            .eq('slug', slug)
            .single();
            
          if (!franchiseeError && franchisee) {
            franchiseeId = franchisee.id;
            console.log('Got franchisee ID from slug:', franchiseeId);
          } else {
            console.error('Error getting franchisee by slug:', franchiseeError);
          }
        }
      }
      
      if (!franchiseeId) {
        console.log('No franchisee ID found, cannot load custom waiver');
        return;
      }
      
      try {
        const { data: franchisee, error: franchiseeError } = await supabase
          .from('franchisees')
          .select('*')
          .eq('id', franchiseeId)
          .single();

        if (franchiseeError) {
          console.error('Error loading franchisee:', franchiseeError);
          return;
        }

        console.log('Loaded franchisee data:', franchisee);
        setFranchiseeData(franchisee);

        const { data: settings, error: settingsError } = await supabase
          .from('franchisee_settings')
          .select('setting_value')
          .eq('franchisee_id', franchisee.id)
          .eq('setting_key', 'waiver_text')
          .single();

        if (!settingsError && settings?.setting_value) {
          console.log('Loaded custom waiver text:', settings.setting_value.substring(0, 100) + '...');
          setCustomWaiver(settings.setting_value);
        } else {
          console.log('No custom waiver found or error:', settingsError);
        }
      } catch (error) {
        console.error('Error loading franchisee data:', error);
      }
    };

    loadFranchiseeData();
  }, [flowData.selectedLocation]);

  const defaultWaiver = `
    ASSUMPTION OF RISK, WAIVER OF CLAIMS & INDEMNIFICATION AGREEMENT

    In consideration for being permitted to participate in soccer activities, programs, and/or use facilities 
    owned or operated by Soccer Stars, I acknowledge, understand, and agree to the following:

    1. ASSUMPTION OF RISK: I understand that participation in soccer activities involves 
    inherent risks including but not limited to: physical injury, property damage, and other unforeseen 
    circumstances. I voluntarily assume all risks associated with participation.

    2. WAIVER OF CLAIMS: I hereby waive, release, and discharge Soccer Stars, its owners, 
    employees, coaches, and affiliates from any and all claims, demands, or causes of action arising from 
    participation in soccer activities.

    3. INDEMNIFICATION: I agree to indemnify and hold harmless Soccer Stars from any 
    claims brought by third parties arising from my child's participation in soccer activities.

    4. MEDICAL TREATMENT: I authorize Soccer Stars staff to secure emergency medical 
    treatment if needed and agree to be responsible for any associated costs.

    5. MEDIA RELEASE: I grant permission for Soccer Stars to use photographs and videos 
    of participants for promotional purposes.

    I acknowledge that I have read this agreement, understand its contents, and sign it voluntarily.
  `;

  const waiverText = customWaiver || defaultWaiver;

  return {
    franchiseeData,
    waiverText
  };
};
