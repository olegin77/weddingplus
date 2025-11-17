import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const body = await req.json()
    const provider = new URL(req.url).searchParams.get('provider')

    console.log('Payment webhook received:', { 
      provider, 
      hasParams: !!body.params,
      method: body.method 
    });

    let paymentId: string | null = null
    let status: string = 'failed'
    let providerTransactionId: string | null = null

    // Parse webhook based on provider
    switch (provider) {
      case 'payme':
        // Payme webhook format
        if (body.method === 'CheckPerformTransaction') {
          return new Response(JSON.stringify({ result: { allow: true } }))
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
      return new Response(JSON.stringify({ error: 'Invalid webhook data' }), { status: 400 })
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
      return new Response(JSON.stringify({ error: 'Payment update failed' }), { status: 500 })
    }

    // Update booking payment status if completed
    if (status === 'completed') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', payment.booking_id)

      console.log('Payment completed, booking updated');
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