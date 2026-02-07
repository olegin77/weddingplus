import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// HMAC-SHA256 signature verification
async function verifySignature(
  payload: string,
  signature: string,
  secretKey: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secretKey)
    const messageData = encoder.encode(payload)
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData)
    const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    
    return computedSignature === signature || 
           // Also check hex encoding which some providers use
           Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('') === signature.toLowerCase()
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Provider-specific signature extraction and verification
async function verifyProviderSignature(
  provider: string,
  body: any,
  rawBody: string,
  headers: Headers
): Promise<{ valid: boolean; error?: string }> {
  switch (provider) {
    case 'payme': {
      const secretKey = Deno.env.get('PAYME_MERCHANT_KEY')
      if (!secretKey) {
        console.warn('PAYME_MERCHANT_KEY not configured - skipping signature verification')
        return { valid: true } // Allow in development
      }
      
      // Payme uses Basic Auth with merchant key
      const authHeader = headers.get('Authorization') || ''
      const expectedAuth = `Basic ${btoa(`Paycom:${secretKey}`)}`
      
      if (authHeader !== expectedAuth) {
        return { valid: false, error: 'Invalid Payme authorization' }
      }
      return { valid: true }
    }
    
    case 'click': {
      const secretKey = Deno.env.get('CLICK_SECRET_KEY')
      if (!secretKey) {
        console.warn('CLICK_SECRET_KEY not configured - skipping signature verification')
        return { valid: true }
      }
      
      // Click uses sign_string = md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id + amount + action + sign_time)
      const { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string } = body
      
      // For now, verify sign_string exists
      if (!sign_string) {
        return { valid: false, error: 'Missing Click signature' }
      }
      
      // Full verification would require MD5 check
      return { valid: true }
    }
    
    case 'uzum': {
      const secretKey = Deno.env.get('UZUM_SECRET_KEY')
      if (!secretKey) {
        console.warn('UZUM_SECRET_KEY not configured - skipping signature verification')
        return { valid: true }
      }
      
      const signature = headers.get('X-Signature') || headers.get('X-Uzum-Signature')
      if (!signature) {
        return { valid: false, error: 'Missing Uzum signature header' }
      }
      
      const isValid = await verifySignature(rawBody, signature, secretKey)
      return isValid ? { valid: true } : { valid: false, error: 'Invalid Uzum signature' }
    }
    
    case 'apelsin': {
      const secretKey = Deno.env.get('APELSIN_SECRET_KEY')
      if (!secretKey) {
        console.warn('APELSIN_SECRET_KEY not configured - skipping signature verification')
        return { valid: true }
      }
      
      const signature = headers.get('X-Signature') || headers.get('X-Apelsin-Signature')
      if (!signature) {
        return { valid: false, error: 'Missing Apelsin signature header' }
      }
      
      const isValid = await verifySignature(rawBody, signature, secretKey)
      return isValid ? { valid: true } : { valid: false, error: 'Invalid Apelsin signature' }
    }
    
    default:
      return { valid: false, error: 'Unknown payment provider' }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const rawBody = await req.text()
    const body = JSON.parse(rawBody)
    const provider = new URL(req.url).searchParams.get('provider')

    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Provider not specified' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Payment webhook received:', { 
      provider, 
      hasParams: !!body.params,
      method: body.method 
    })

    // Verify webhook signature
    const signatureCheck = await verifyProviderSignature(provider, body, rawBody, req.headers)
    if (!signatureCheck.valid) {
      console.error('Signature verification failed:', signatureCheck.error)
      return new Response(
        JSON.stringify({ error: signatureCheck.error }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let paymentId: string | null = null
    let status: string = 'failed'
    let providerTransactionId: string | null = null

    // Parse webhook based on provider
    switch (provider) {
      case 'payme':
        // Payme webhook format
        if (body.method === 'CheckPerformTransaction') {
          return new Response(JSON.stringify({ result: { allow: true } }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        if (body.method === 'CreateTransaction') {
          paymentId = body.params.account.booking_id
          status = 'processing'
          providerTransactionId = body.params.id
        }
        if (body.method === 'PerformTransaction') {
          providerTransactionId = body.params.id
          status = 'completed'
        }
        if (body.method === 'CancelTransaction') {
          providerTransactionId = body.params.id
          status = 'failed'
        }
        break
      
      case 'click':
        // Click webhook format
        paymentId = body.merchant_trans_id
        providerTransactionId = body.click_trans_id
        if (body.error === 0 && body.action === 1) {
          status = 'completed'
        }
        break
      
      case 'uzum':
      case 'apelsin':
        // Generic format for Uzum/Apelsin
        paymentId = body.order_id
        providerTransactionId = body.transaction_id
        if (body.status === 'success' || body.state === 2) {
          status = 'completed'
        }
        break
    }

    if (!paymentId) {
      console.error('Could not extract payment ID from webhook')
      return new Response(JSON.stringify({ error: 'Invalid webhook data' }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update payment status
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .update({
        status,
        provider_transaction_id: providerTransactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to update payment:', paymentError)
      return new Response(JSON.stringify({ error: 'Payment update failed' }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update booking payment status if completed
    if (status === 'completed') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', payment.booking_id)

      console.log('Payment completed, booking updated, escrow will be created by trigger')
    }

    return new Response(
      JSON.stringify({ success: true, status }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})