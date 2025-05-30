
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting automatic lead status update...');

    // Update leads with past bookings from 'booked_upcoming' to 'booked_complete'
    // Only update if status was not manually set
    const { error: updateCompletedError } = await supabase.rpc('sql', {
      query: `
        UPDATE public.leads 
        SET status = 'booked_complete',
            updated_at = now()
        WHERE status = 'booked_upcoming'
        AND status_manually_set = false
        AND EXISTS (
          SELECT 1 FROM public.bookings b
          JOIN public.appointments a ON b.id = a.booking_id
          WHERE b.lead_id = leads.id
          AND a.selected_date < CURRENT_DATE
        );
      `
    });

    if (updateCompletedError) {
      console.error('Error updating completed bookings:', updateCompletedError);
    } else {
      console.log('Updated completed bookings successfully');
    }

    // Update leads with future bookings from 'new' to 'booked_upcoming'
    // Only update if status was not manually set
    const { error: updateUpcomingError } = await supabase.rpc('sql', {
      query: `
        UPDATE public.leads 
        SET status = 'booked_upcoming',
            updated_at = now()
        WHERE status = 'new'
        AND status_manually_set = false
        AND EXISTS (
          SELECT 1 FROM public.bookings b
          JOIN public.appointments a ON b.id = a.booking_id
          WHERE b.lead_id = leads.id
          AND a.selected_date >= CURRENT_DATE
        );
      `
    });

    if (updateUpcomingError) {
      console.error('Error updating upcoming bookings:', updateUpcomingError);
    } else {
      console.log('Updated upcoming bookings successfully');
    }

    console.log('Lead statuses updated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Lead statuses updated successfully (respecting manual overrides)',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
