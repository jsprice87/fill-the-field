
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface PayloadRequest {
  leadId: string
  bookingId?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { leadId, bookingId }: PayloadRequest = await req.json()

    console.log('Building unified webhook payload for leadId:', leadId, 'bookingId:', bookingId)

    // Query lead and franchisee data (always required)
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        zip,
        franchisees!inner (
          id,
          company_name,
          sender_name,
          business_email
        )
      `)
      .eq('id', leadId)
      .single()

    if (leadError || !leadData) {
      console.error('Error fetching lead data:', leadError)
      throw new Error(`Lead not found: ${leadId}`)
    }

    const franchisee = leadData.franchisees
    const eventType = bookingId ? 'newBooking' : 'newLead'

    // Base payload structure
    const payload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      franchisee_id: franchisee.id,
      franchisee_name: franchisee.company_name,
      sender_name: franchisee.sender_name || franchisee.company_name,
      business_email: franchisee.business_email || '',
      lead: {
        id: leadData.id,
        first_name: leadData.first_name,
        last_name: leadData.last_name,
        email: leadData.email,
        phone: leadData.phone,
        zip: leadData.zip
      },
      booking: {
        id: '',
        booking_reference: '',
        class_name: '',
        class_date: '',
        class_time: '',
        location_name: '',
        location_address: '',
        participants: [],
        parent_first: '',
        parent_last: ''
      }
    }

    // If booking data is requested, fetch and populate booking block
    if (bookingId) {
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_reference,
          parent_first_name,
          parent_last_name,
          class_schedules!inner (
            id,
            start_time,
            classes!inner (
              class_name,
              locations!inner (
                name,
                address,
                city,
                state
              )
            )
          ),
          appointments (
            participant_name,
            participant_age,
            participant_birth_date,
            selected_date,
            created_at
          )
        `)
        .eq('id', bookingId)
        .single()

      if (bookingError || !bookingData) {
        console.error('Error fetching booking data:', bookingError)
        throw new Error(`Booking not found: ${bookingId}`)
      }

      const classSchedule = bookingData.class_schedules
      const classInfo = classSchedule.classes
      const location = classInfo.locations

      // Build location address
      const locationAddress = `${location.address}, ${location.city} ${location.state}`

      // Format class time (convert from time format to display format)
      const classTime = classSchedule.start_time

      // Get class date from first appointment
      const firstAppointment = bookingData.appointments?.[0]
      const classDate = firstAppointment?.selected_date || ''

      // Build participants array, ordered by created_at
      const participants = (bookingData.appointments || [])
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(apt => ({
          name: apt.participant_name,
          age: apt.participant_age,
          dob: apt.participant_birth_date || ''
        }))

      // Populate booking block
      payload.booking = {
        id: bookingData.id,
        booking_reference: bookingData.booking_reference || '',
        class_name: classInfo.class_name,
        class_date: classDate,
        class_time: classTime,
        location_name: location.name,
        location_address: locationAddress,
        participants: participants,
        parent_first: bookingData.parent_first_name || '',
        parent_last: bookingData.parent_last_name || ''
      }
    }

    console.log('Generated unified webhook payload:', JSON.stringify(payload, null, 2))

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error building unified webhook payload:', error)
    
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
