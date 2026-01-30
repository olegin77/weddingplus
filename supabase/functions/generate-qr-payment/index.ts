import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface QRPaymentRequest {
  bookingId?: string
  amount: number
  description?: string
  expiresInMinutes?: number
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

    // Check if user is a vendor
    const { data: vendorProfile, error: vendorError } = await supabase
      .from('vendor_profiles')
      .select('id, business_name')
      .eq('user_id', user.id)
      .single()

    if (vendorError || !vendorProfile) {
      throw new Error('Only vendors can generate QR payments')
    }

    const { bookingId, amount, description, expiresInMinutes = 30 }: QRPaymentRequest = await req.json()

    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount')
    }

    // Generate unique QR token
    const qrToken = generateQRToken()
    
    // Calculate expiry
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

    // Create QR session
    const { data: qrSession, error: sessionError } = await supabase
      .from('qr_payment_sessions')
      .insert({
        booking_id: bookingId || null,
        vendor_id: vendorProfile.id,
        amount,
        currency: 'UZS',
        description: description || `Оплата ${vendorProfile.business_name}`,
        qr_token: qrToken,
        expires_at: expiresAt.toISOString(),
        status: 'active'
      })
      .select()
      .single()

    if (sessionError) {
      throw new Error(`Failed to create QR session: ${sessionError.message}`)
    }

    // Generate QR code data URL using a simple implementation
    const paymentUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/scan-qr-payment?token=${qrToken}`
    
    // Create QR code using Google Charts API (simple solution)
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`

    // Update session with QR image URL
    await supabase
      .from('qr_payment_sessions')
      .update({ qr_image_url: qrImageUrl })
      .eq('id', qrSession.id)

    console.log('QR payment session created:', { sessionId: qrSession.id, token: qrToken })

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: qrSession.id,
        qrToken,
        qrImageUrl,
        paymentUrl,
        amount,
        expiresAt: expiresAt.toISOString(),
        vendorName: vendorProfile.business_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('QR generation error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function generateQRToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
