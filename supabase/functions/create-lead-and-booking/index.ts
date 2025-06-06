
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Helper function to generate secure booking reference (10 random alphanumeric chars)
const generateBookingReference = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to trigger webhook in background
const triggerWebhook = async (franchiseeId: string, eventType: string, data: any) => {
  try {
    const response = await fetch(`${supabaseUrl.replace('/rest/v1', '')}/functions/v1/send-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        franchiseeId,
        eventType,
        data
      })
    })

    if (!response.ok) {
      console.error('Failed to trigger webhook:', await response.text())
    }
  } catch (error) {
    console.error('Error triggering webhook:', error)
  }
}

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

    // Trigger lead_created webhook in background
    const leadWebhookData = {
      ...leadData,
      id: leadId
    }
    
    // Use background task to avoid blocking the response
    const leadWebhookPromise = triggerWebhook(franchiseeId, 'lead_created', leadWebhookData)

    // Step 2: Create booking if bookingData is provided
    let bookingId = null
    let bookingWebhookPromise = null
    
    if (bookingData) {
      // Generate secure booking reference
      const bookingReference = generateBookingReference()
      
      // Ensure the booking uses the real lead ID and generated reference
      const bookingPayload = {
        ...bookingData,
        lead_id: leadId,
        booking_reference: bookingReference
      }

      console.log('Creating booking with payload:', bookingPayload)

      const { data: bookingInsertData, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingPayload)
        .select('id, booking_reference')
        .single()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        throw new Error(`Failed to create booking: ${bookingError.message}`)
      }

      bookingId = bookingInsertData.id
      console.log('Booking created successfully with ID:', bookingId, 'and reference:', bookingInsertData.booking_reference)

      // Trigger booking_created webhook in background
      const bookingWebhookData = {
        ...bookingPayload,
        id: bookingId,
        lead: leadWebhookData
      }
      
      bookingWebhookPromise = triggerWebhook(franchiseeId, 'booking_created', bookingWebhookData)
    }

    // Return success response immediately (webhooks run in background)
    const response = {
      success: true,
      leadId,
      bookingId,
      message: 'Lead and booking created successfully'
    }

    console.log('Operation completed successfully:', response)

    // Wait for webhook delivery attempts to complete in background
    // This won't block the response but ensures webhooks are triggered
    Promise.all([
      leadWebhookPromise,
      bookingWebhookPromise
    ].filter(Boolean)).catch(error => {
      console.error('Webhook delivery error:', error)
    })

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
