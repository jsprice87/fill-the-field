
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WebhookPayload {
  franchiseeId: string
  eventType: string
  data: any
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

    const { franchiseeId, eventType, data }: WebhookPayload = await req.json()

    console.log('Processing webhook delivery for franchisee:', franchiseeId, 'event:', eventType)

    // Get franchisee details including company name
    const { data: franchisee, error: franchiseeError } = await supabase
      .from('franchisees')
      .select('company_name')
      .eq('id', franchiseeId)
      .single()

    if (franchiseeError) {
      console.error('Error fetching franchisee details:', franchiseeError)
      throw new Error(`Failed to fetch franchisee details: ${franchiseeError.message}`)
    }

    // Get webhook settings for the franchisee
    const { data: settings, error: settingsError } = await supabase
      .from('franchisee_settings')
      .select('setting_key, setting_value')
      .eq('franchisee_id', franchiseeId)
      .in('setting_key', ['webhook_url', 'webhook_auth_header'])

    if (settingsError) {
      console.error('Error fetching webhook settings:', settingsError)
      throw new Error(`Failed to fetch webhook settings: ${settingsError.message}`)
    }

    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value
      return acc
    }, {} as Record<string, string>)

    const webhookUrl = settingsMap.webhook_url
    const authHeader = settingsMap.webhook_auth_header

    if (!webhookUrl) {
      console.log('No webhook URL configured for franchisee:', franchiseeId)
      return new Response(JSON.stringify({
        success: true,
        message: 'No webhook URL configured'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Prepare the webhook payload in the exact required format
    const webhookPayload = {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      franchisee_id: franchiseeId,
      franchisee_name: franchisee.company_name,
      data: data
    }

    console.log('Sending webhook to:', webhookUrl)
    console.log('Webhook payload:', JSON.stringify(webhookPayload, null, 2))

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SoccerStars-Webhook/1.0'
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    let responseStatus: number | null = null
    let responseBody: string | null = null
    let errorMessage: string | null = null
    let deliveredAt: string | null = null

    try {
      // Send webhook with 5-second timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(webhookPayload),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      responseStatus = response.status
      responseBody = await response.text()

      if (response.ok) {
        deliveredAt = new Date().toISOString()
        console.log('Webhook delivered successfully:', responseStatus)
      } else {
        errorMessage = `HTTP ${responseStatus}: ${responseBody}`
        console.error('Webhook delivery failed:', errorMessage)
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Webhook delivery timed out after 5 seconds'
      } else {
        errorMessage = `Network error: ${error.message}`
      }
      console.error('Webhook delivery error:', errorMessage)
    }

    // Log the webhook attempt
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        franchisee_id: franchiseeId,
        event_type: eventType,
        webhook_url: webhookUrl,
        payload: webhookPayload,
        response_status: responseStatus,
        response_body: responseBody,
        error_message: errorMessage,
        delivered_at: deliveredAt
      })

    if (logError) {
      console.error('Error logging webhook attempt:', logError)
    }

    return new Response(JSON.stringify({
      success: deliveredAt !== null,
      delivered_at: deliveredAt,
      response_status: responseStatus,
      error_message: errorMessage
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-webhook function:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
