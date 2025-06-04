
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create INSERT policy for anonymous users
    const { error: anonError } = await supabaseAdmin.rpc('sql', {
      query: `
        CREATE POLICY IF NOT EXISTS "Anonymous users can insert leads" 
        ON public.leads 
        FOR INSERT 
        TO anon
        WITH CHECK (true);
      `
    })

    if (anonError) {
      throw anonError
    }

    // Create INSERT policy for authenticated users  
    const { error: authError } = await supabaseAdmin.rpc('sql', {
      query: `
        CREATE POLICY IF NOT EXISTS "Authenticated users can insert leads" 
        ON public.leads 
        FOR INSERT 
        TO authenticated
        WITH CHECK (true);
      `
    })

    if (authError) {
      throw authError
    }

    return new Response(
      JSON.stringify({ message: 'Lead policies created successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
