
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  sourcePath?: string;
}

const generateSlugFromEmail = (email: string): string => {
  // Extract domain or use email prefix, make it URL-friendly
  const emailPrefix = email.split('@')[0];
  return emailPrefix
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const generateUniqueSlug = async (supabase: any, baseSlug: string): Promise<string> => {
  let slug = baseSlug;
  let counter = 0;
  
  while (true) {
    const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
    
    // Check if this slug already exists
    const { data: existing } = await supabase
      .from('franchisees')
      .select('id')
      .eq('slug', testSlug)
      .maybeSingle();
    
    if (!existing) {
      return testSlug;
    }
    
    counter++;
    
    // After 10 attempts, append a random suffix
    if (counter > 10) {
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      return `${slug}-${randomSuffix}`;
    }
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the user from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create client with user's token for auth context
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { sourcePath = 'unknown' }: RequestBody = req.method === 'POST' 
      ? await req.json().catch(() => ({}))
      : {};

    console.log(`Ensuring franchisee profile for user ${user.id} from ${sourcePath}`);

    // FAST-RETURN GUARD: Quick check if franchisee already exists (< 10ms)
    const startTime = Date.now();
    const { data: existingFranchisee, error: quickCheckError } = await supabaseAdmin
      .from('franchisees')
      .select('id, slug, company_name, contact_name, email')
      .eq('user_id', user.id)
      .maybeSingle();

    const quickCheckTime = Date.now() - startTime;
    console.log(`Quick franchisee check took ${quickCheckTime}ms`);

    if (quickCheckError) {
      throw quickCheckError;
    }

    // If franchisee already exists, return immediately
    if (existingFranchisee) {
      console.log(`Franchisee profile already exists for user ${user.id} (fast return in ${quickCheckTime}ms)`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          franchisee: existingFranchisee,
          created: false,
          fastReturn: true,
          checkTime: quickCheckTime
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Generate a unique slug for the new franchisee
    const baseSlug = generateSlugFromEmail(user.email || '');
    const uniqueSlug = await generateUniqueSlug(supabaseAdmin, baseSlug);

    // Prepare franchisee data with defaults
    const franchiseeData = {
      user_id: user.id,
      email: user.email || '',
      contact_name: user.user_metadata?.contact_name || 
                   user.user_metadata?.full_name || 
                   user.email?.split('@')[0] || 
                   'User',
      company_name: user.user_metadata?.company_name || 
                   `${user.email?.split('@')[0] || 'User'} Company`,
      slug: uniqueSlug,
      subscription_status: 'active',
      subscription_tier: 'free'
    };

    // Use UPSERT with ON CONFLICT to handle race conditions
    const { data: newFranchisee, error: insertError } = await supabaseAdmin
      .from('franchisees')
      .upsert(franchiseeData, { 
        onConflict: 'user_id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (insertError) {
      // If there's a slug conflict, retry with a new unique slug
      if (insertError.message?.includes('franchisees_slug_unique')) {
        const retrySlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;
        const retryData = { ...franchiseeData, slug: retrySlug };
        
        const { data: retryFranchisee, error: retryError } = await supabaseAdmin
          .from('franchisees')
          .upsert(retryData, { 
            onConflict: 'user_id',
            ignoreDuplicates: false 
          })
          .select()
          .single();

        if (retryError) {
          throw retryError;
        }

        newFranchisee = retryFranchisee;
      } else {
        throw insertError;
      }
    }

    // Log the auto-creation for audit purposes
    await supabaseAdmin
      .from('profile_creation_audit')
      .insert({
        user_id: user.id,
        franchisee_id: newFranchisee.id,
        source_path: sourcePath,
        user_email: user.email,
        generated_slug: newFranchisee.slug,
        success: true
      });

    const totalTime = Date.now() - startTime;
    console.log(`Created franchisee profile for user ${user.id} with slug ${newFranchisee.slug} in ${totalTime}ms`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        franchisee: newFranchisee,
        created: true,
        totalTime
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in ensure-franchisee-profile function:', error);

    // Try to log the failure if we have user context
    try {
      const authHeader = req.headers.get('Authorization');
      if (authHeader) {
        const supabaseUser = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        
        const { data: { user } } = await supabaseUser.auth.getUser();
        if (user) {
          const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          );
          
          await supabaseAdmin
            .from('profile_creation_audit')
            .insert({
              user_id: user.id,
              source_path: 'error',
              user_email: user.email,
              success: false,
              error_message: error.message
            });
        }
      }
    } catch (auditError) {
      console.error('Failed to log audit error:', auditError);
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
});
