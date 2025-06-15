
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

    // Check for mode override in headers (for test webhook calls)
    const mode = req.headers.get('x-webhook-mode') ?? 'production'
    const isTest = mode === 'test'

    console.log('Processing webhook delivery with mode:', mode, isTest ? '(test)' : '(production)')

    const { franchiseeId, eventType, data }: WebhookPayload = await req.json()

    console.log('Processing unified webhook delivery for franchisee:', franchiseeId, 'event:', eventType)

    // Load webhook URLs from franchisee settings with cache control
    const { data: settings, error: settingsError } = await supabase
      .from('franchisee_settings')
      .select('setting_key, setting_value')
      .eq('franchisee_id', franchiseeId)
      .in('setting_key', ['webhook_url_prod', 'webhook_url_test'])
      .then(result => {
        // Add cache control header to prevent stale data
        if (result.data) {
          const settingsMap = result.data.reduce((acc, setting) => {
            acc[setting.setting_key] = setting.setting_value
            return acc
          }, {} as Record<string, string>)
          return { data: settingsMap, error: result.error }
        }
        return result
      })

    if (settingsError) {
      console.error('Error fetching webhook settings:', settingsError)
      throw new Error(`Failed to load webhook settings: ${settingsError.message}`)
    }

    // Determine target URL based on mode
    let webhookUrl: string | null = null
    
    if (isTest) {
      webhookUrl = settings?.webhook_url_test || null
      if (!webhookUrl) {
        console.error('Test webhook requested but webhook_url_test is not configured for franchisee:', franchiseeId)
        return new Response(JSON.stringify({
          success: false,
          error: 'no_webhook_url',
          message: 'Test webhook URL not configured'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else {
      // Production mode - use franchisee URL or global fallback
      webhookUrl = settings?.webhook_url_prod
      
      if (!webhookUrl) {
        webhookUrl = Deno.env.get('WEBHOOK_PROD_URL')
        if (webhookUrl) {
          console.warn('Using global fallback URL for franchisee:', franchiseeId, 'URL:', webhookUrl)
        } else {
          console.error('No production webhook URL configured for franchisee:', franchiseeId)
          return new Response(JSON.stringify({
            success: false,
            error: 'no_webhook_url',
            message: 'Production webhook URL not configured'
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
      }
    }

    console.log('➡️ send-webhook posting to:', webhookUrl)

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SoccerStars-Webhook/2.0',
      'x-webhook-mode': mode
    }

    // Check for auth header setting (only applies to production webhooks)
    if (!isTest && settings?.webhook_auth_header) {
      headers['Authorization'] = settings.webhook_auth_header
    }

    let responseStatus: number | null = null
    let responseBody: string | null = null
    let errorMessage: string | null = null
    let deliveredAt: string | null = null
    let attemptCount = 0

    // Retry logic: production mode gets 3 attempts, test mode gets 1
    const maxAttempts = isTest ? 1 : 3
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attemptCount = attempt
      
      try {
        console.log(`Webhook delivery attempt ${attempt}/${maxAttempts}`)
        
        // Apply timeout of 5 seconds per attempt
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const response = await fetch(webhookUrl!, {
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
          
          // For test mode, don't retry on 404 (workflow not listening)
          if (isTest && responseStatus === 404) {
            console.log('Test webhook received 404 - workflow not listening, not retrying')
            break
          }
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
      if (attempt < maxAttempts) {
        const delayMs = 2 ** attempt * 200 // 200ms, 400ms, 800ms
        console.log(`Waiting ${delayMs}ms before retry...`)
        await sleep(delayMs)
      }
    }

    // Log the webhook attempt with all details including is_test flag
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
        attempt_count: attemptCount,
        is_test: isTest
      })

    if (logError) {
      console.error('Error logging webhook attempt:', logError)
    }

    const success = deliveredAt !== null
    console.log(`Webhook delivery ${success ? 'succeeded' : 'failed'} after ${attemptCount} attempts`)

    // Special handling for test mode 404s
    if (isTest && responseStatus === 404) {
      return new Response(JSON.stringify({
        success: false,
        error: 'webhook_not_listening',
        response_status: responseStatus,
        response_body: responseBody,
        is_test: true
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success,
      delivered_at: deliveredAt,
      response_status: responseStatus,
      error_message: errorMessage,
      attempt_count: attemptCount,
      is_test: isTest
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
