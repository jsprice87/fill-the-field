
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { leadData, bookingData, franchiseeId } = await req.json()

    console.log('Creating lead and booking for franchisee:', franchiseeId)
    console.log('Lead data:', leadData)
    console.log('Booking data:', bookingData)

    // Step 1: Insert the lead with service role privileges
    const { data: leadInsertData, error: leadError } = await supabase
      .from('leads')
      .insert(leadData)
      .select('id')
      .single()

    if (leadError) {
      console.error('Error creating lead:', leadError)
      throw new Error(`Failed to create lead: ${leadError.message}`)
    }

    const leadId = leadInsertData.id
    console.log('Lead created successfully with ID:', leadId)

    // Step 2: Create booking if bookingData is provided
    let bookingId = null
    if (bookingData) {
      // Ensure the booking uses the real lead ID
      const bookingPayload = {
        ...bookingData,
        lead_id: leadId
      }

      console.log('Creating booking with payload:', bookingPayload)

      const { data: bookingInsertData, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select('id')
        .single()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        throw new Error(`Failed to create booking: ${bookingError.message}`)
      }

      bookingId = bookingInsertData.id
      console.log('Booking created successfully with ID:', bookingId)
    }

    // Return success response with both IDs
    const response = {
      success: true,
      leadId,
      bookingId,
      message: 'Lead and booking created successfully'
    }

    console.log('Operation completed successfully:', response)

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in create-lead-and-booking function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
