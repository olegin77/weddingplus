import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentRequest {
  bookingId: string
  amount: number
  provider: 'payme' | 'click' | 'uzum' | 'apelsin'
  returnUrl?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { bookingId, amount, provider, returnUrl }: PaymentRequest = await req.json()

    // Validate provider
    const ALLOWED_PROVIDERS = ['payme', 'click', 'uzum', 'apelsin'];
    if (!ALLOWED_PROVIDERS.includes(provider)) {
      throw new Error('Invalid payment provider');
    }

    // Validate returnUrl format if provided
    if (returnUrl) {
      try {
        const url = new URL(returnUrl);
        // Only allow same origin or lovable.app domains
        const allowedDomains = ['lovable.app', 'lovable.dev'];
        if (!allowedDomains.some(domain => url.hostname.endsWith(domain))) {
          throw new Error('Invalid return URL domain');
        }
      } catch {
        throw new Error('Invalid return URL format');
      }
    }

    console.log('Processing payment:', { provider, hasBookingId: !!bookingId });

    // Verify booking belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .eq('couple_user_id', user.id)
      .single()

    if (bookingError || !booking) {
      throw new Error('Booking not found or unauthorized')
    }

    // Validate amount matches booking price using integer comparison to avoid floating point issues
    const bookingPriceCents = Math.round(Number(booking.price) * 100);
    const amountCents = Math.round(amount * 100);
    if (amountCents !== bookingPriceCents) {
      throw new Error('Payment amount does not match booking price');
    }

    // Validate amount is within reasonable bounds
    if (amount <= 0 || amount > 1000000000) {
      throw new Error('Invalid payment amount');
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: bookingId,
        amount: amount,
        currency: 'UZS',
        payment_provider: provider,
        status: 'pending',
        metadata: { return_url: returnUrl }
      })
      .select()
      .single()

    if (paymentError) {
      throw new Error(`Failed to create payment: ${paymentError.message}`)
    }

    // Generate payment URL based on provider
    let paymentUrl = ''
    let providerData = {}

    switch (provider) {
      case 'payme':
        // Payme integration (requires merchant credentials)
        paymentUrl = `https://checkout.paycom.uz/${btoa(`m=${Deno.env.get('PAYME_MERCHANT_ID')};ac.booking_id=${bookingId};a=${amount * 100}`)}`
        providerData = { method: 'payme' }
        break
      
      case 'click':
        // Click integration
        paymentUrl = `https://my.click.uz/services/pay?service_id=${Deno.env.get('CLICK_SERVICE_ID')}&merchant_id=${Deno.env.get('CLICK_MERCHANT_ID')}&amount=${amount}&transaction_param=${payment.id}`
        providerData = { method: 'click' }
        break
      
      case 'uzum':
        // Uzum integration
        paymentUrl = `https://gateway.uzum.uz/api/v1/checkout?merchant_id=${Deno.env.get('UZUM_MERCHANT_ID')}&amount=${amount * 100}&order_id=${payment.id}`
        providerData = { method: 'uzum' }
        break
      
      case 'apelsin':
        // Apelsin integration
        paymentUrl = `https://api.apelsin.uz/api/v1/payment?merchant_id=${Deno.env.get('APELSIN_MERCHANT_ID')}&amount=${amount}&order_id=${payment.id}`
        providerData = { method: 'apelsin' }
        break
    }

    // Update payment with provider data
    await supabase
      .from('payments')
      .update({ 
        metadata: { ...payment.metadata, ...providerData },
        status: 'processing'
      })
      .eq('id', payment.id)

    console.log('Payment URL generated for provider:', provider);

    return new Response(
      JSON.stringify({
        success: true,
        paymentId: payment.id,
        paymentUrl,
        provider
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Payment processing error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})