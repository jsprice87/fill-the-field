
import { corsHeaders } from '../_shared/cors.ts'

interface TestWebhookRequest {
  type: 'newLead' | 'newBooking'
  url: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { type, url }: TestWebhookRequest = await req.json()

    console.log('Processing test webhook request:', { type, url })

    // Validate URL
    try {
      new URL(url)
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid URL provided'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Generate mock unified webhook payload
    const mockPayload = {
      event_type: type,
      timestamp: new Date().toISOString(),
      franchisee_id: "test-franchisee-id",
      franchisee_name: "Test Soccer Stars",
      sender_name: "Test Soccer Stars",
      business_email: "test@soccerstars.com",
      lead: {
        id: "test-lead-id",
        first_name: "John",
        last_name: "Doe",
        email: "john.doe@example.com",
        phone: "555-123-4567",
        zip: "12345"
      },
      booking: type === 'newBooking' ? {
        id: "test-booking-id",
        booking_reference: "TEST123",
        class_name: "Soccer Stars - Minis",
        class_date: "2025-06-15",
        class_time: "10:00",
        location_name: "Test Soccer Field",
        location_address: "123 Soccer St, Test City, CO",
        participants: [
          { name: "Emma Doe", age: 4, dob: "2021-02-15" }
        ],
        parent_first: "John",
        parent_last: "Doe"
      } : {
        id: "",
        booking_reference: "",
        class_name: "",
        class_date: "",
        class_time: "",
        location_name: "",
        location_address: "",
        participants: [],
        parent_first: "",
        parent_last: ""
      }
    }

    console.log('Sending test webhook payload to:', url)
    console.log('Test payload:', JSON.stringify(mockPayload, null, 2))

    // Send the webhook
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SoccerStars-Test-Webhook/1.0'
      },
      body: JSON.stringify(mockPayload)
    })

    const responseText = await response.text()
    console.log('Test webhook response status:', response.status)
    console.log('Test webhook response body:', responseText)

    if (response.ok) {
      return new Response(JSON.stringify({
        success: true,
        status: response.status,
        response: responseText
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: `HTTP ${response.status}: ${responseText}`,
        status: response.status
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('Error in send-test-webhook function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
