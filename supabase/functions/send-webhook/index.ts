
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WebhookPayload {
  franchiseeId: string
  eventType: string
  data: any
}

// Sleep function for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

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

    console.log('Processing unified webhook delivery for franchisee:', franchiseeId, 'event:', eventType)

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

    console.log('Sending unified webhook to:', webhookUrl)
    console.log('Unified webhook payload:', JSON.stringify(data, null, 2))

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SoccerStars-Webhook/2.0'
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    let responseStatus: number | null = null
    let responseBody: string | null = null
    let errorMessage: string | null = null
    let deliveredAt: string | null = null
    let attemptCount = 0

    // Retry logic with exponential backoff: 200ms, 400ms, 800ms
    for (let attempt = 1; attempt <= 3; attempt++) {
      attemptCount = attempt
      
      try {
        console.log(`Webhook delivery attempt ${attempt}/3`)
        
        // Apply timeout of 5 seconds per attempt
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(data),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        responseStatus = response.status
        responseBody = await response.text()

        if (response.ok) {
          deliveredAt = new Date().toISOString()
          console.log(`Webhook delivered successfully on attempt ${attempt}, status:`, responseStatus)
          break
        } else {
          errorMessage = `HTTP ${responseStatus}: ${responseBody}`
          console.error(`Webhook delivery failed on attempt ${attempt}:`, errorMessage)
        }

      } catch (error) {
        if (error.name === 'AbortError') {
          errorMessage = `Webhook delivery timed out after 5 seconds (attempt ${attempt})`
        } else {
          errorMessage = `Network error (attempt ${attempt}): ${error.message}`
        }
        console.error(errorMessage)
      }

      // Wait before next attempt (except on last attempt)
      if (attempt < 3) {
        const delayMs = 2 ** attempt * 200 // 200ms, 400ms, 800ms
        console.log(`Waiting ${delayMs}ms before retry...`)
        await sleep(delayMs)
      }
    }

    // Log the webhook attempt with all details
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        franchisee_id: franchiseeId,
        event_type: eventType,
        webhook_url: webhookUrl,
        payload: data,
        response_status: responseStatus,
        response_body: responseBody,
        error_message: errorMessage,
        delivered_at: deliveredAt,
        attempt_count: attemptCount
      })

    if (logError) {
      console.error('Error logging webhook attempt:', logError)
    }

    const success = deliveredAt !== null
    console.log(`Webhook delivery ${success ? 'succeeded' : 'failed'} after ${attemptCount} attempts`)

    return new Response(JSON.stringify({
      success,
      delivered_at: deliveredAt,
      response_status: responseStatus,
      error_message: errorMessage,
      attempt_count: attemptCount
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
