
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

// Helper function to trigger unified webhook
const triggerUnifiedWebhook = async (leadId: string, bookingId?: string) => {
  try {
    console.log('Triggering unified webhook for leadId:', leadId, 'bookingId:', bookingId)
    
    // Build unified payload
    const payloadResponse = await fetch(`${supabaseUrl.replace('/rest/v1', '')}/functions/v1/build-unified-webhook-payload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({ leadId, bookingId })
    })

    if (!payloadResponse.ok) {
      throw new Error(`Failed to build payload: ${await payloadResponse.text()}`)
    }

    const payload = await payloadResponse.json()

    // Send webhook
    const webhookResponse = await fetch(`${supabaseUrl.replace('/rest/v1', '')}/functions/v1/send-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        franchiseeId: payload.franchisee_id,
        eventType: payload.event_type,
        data: payload
      })
    })

    if (!webhookResponse.ok) {
      console.error('Failed to send unified webhook:', await webhookResponse.text())
    } else {
      console.log('Unified webhook sent successfully')
    }

  } catch (error) {
    console.error('Error triggering unified webhook:', error)
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

    // Step 2: Create booking if bookingData is provided
    let bookingId = null
    let actualBookingReference = null
    
    if (bookingData) {
      // Generate secure booking reference as fallback
      const fallbackBookingReference = generateBookingReference()
      
      // Ensure we have a class_schedule_id from the appointments or the booking data
      let classScheduleId = bookingData.class_schedule_id;
      
      // If not in main booking data, try to get it from first appointment
      if (!classScheduleId && bookingData.appointments && bookingData.appointments.length > 0) {
        classScheduleId = bookingData.appointments[0].class_schedule_id;
      }
      
      if (!classScheduleId) {
        throw new Error('class_schedule_id is required but not provided in booking data or appointments')
      }
      
      // Ensure the booking uses the real lead ID and generated reference
      const bookingPayload = {
        ...bookingData,
        lead_id: leadId,
        class_schedule_id: classScheduleId,
        booking_reference: fallbackBookingReference
      }

      // Remove appointments from booking payload as they'll be inserted separately
      const { appointments, ...bookingDataWithoutAppointments } = bookingPayload

      console.log('Creating booking with payload:', bookingDataWithoutAppointments)

      const { data: bookingInsertData, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingDataWithoutAppointments)
        .select('id, booking_reference')
        .single()

      if (bookingError) {
        console.error('Error creating booking:', bookingError)
        throw new Error(`Failed to create booking: ${bookingError.message}`)
      }

      bookingId = bookingInsertData.id
      actualBookingReference = bookingInsertData.booking_reference
      
      console.log('Booking created successfully with ID:', bookingId, 'and reference:', actualBookingReference)

      // Step 3: Create appointment records if appointments are provided
      if (appointments && appointments.length > 0) {
        const appointmentPayloads = appointments.map((appointment: any) => ({
          ...appointment,
          booking_id: bookingId
        }))

        console.log('Creating appointments:', appointmentPayloads)

        const { error: appointmentsError } = await supabase
          .from('appointments')
          .insert(appointmentPayloads)

        if (appointmentsError) {
          console.error('Error creating appointments:', appointmentsError)
          throw new Error(`Failed to create appointments: ${appointmentsError.message}`)
        }

        console.log('All appointments created successfully')
      }

      // Only update lead status to booked_upcoming if it hasn't been manually set
      const { data: leadDataCheck, error: leadFetchError } = await supabase
        .from('leads')
        .select('status_manually_set')
        .eq('id', leadId)
        .single()

      if (leadFetchError) {
        console.error('Error fetching lead data:', leadFetchError)
      } else if (!leadDataCheck.status_manually_set) {
        // Only update status if it hasn't been manually set
        await supabase
          .from('leads')
          .update({ status: 'booked_upcoming' })
          .eq('id', leadId)
        
        console.log('Lead status updated to booked_upcoming (automatic)')
      } else {
        console.log('Lead status not updated - was manually set by user')
      }
    }

    // Return success response immediately (webhooks run in background)
    const response = {
      success: true,
      leadId,
      bookingId,
      bookingReference: actualBookingReference,
      message: 'Lead and booking created successfully'
    }

    console.log('Operation completed successfully:', response)

    // Trigger unified webhook in background
    // For leads only: event_type = "newLead", booking block empty
    // For bookings: event_type = "newBooking", full booking block
    triggerUnifiedWebhook(leadId, bookingId || undefined).catch(error => {
      console.error('Background webhook error:', error)
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
