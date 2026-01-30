import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EscrowAction {
  action: 'release' | 'refund' | 'dispute' | 'resolve_dispute'
  escrowId: string
  reason?: string
  partialAmount?: number
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

    // Verify user
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

    const { action, escrowId, reason, partialAmount }: EscrowAction = await req.json()

    console.log('Escrow action:', { action, escrowId, userId: user.id })

    // Get escrow transaction
    const { data: escrow, error: escrowError } = await supabase
      .from('escrow_transactions')
      .select(`
        *,
        booking:bookings(*),
        vendor:vendor_profiles(*, user_id)
      `)
      .eq('id', escrowId)
      .single()

    if (escrowError || !escrow) {
      throw new Error('Escrow transaction not found')
    }

    // Check permissions
    const isAdmin = await checkIsAdmin(supabase, user.id)
    const isVendor = escrow.vendor?.user_id === user.id
    const isCouple = escrow.couple_user_id === user.id

    if (!isAdmin && !isVendor && !isCouple) {
      throw new Error('You do not have permission to manage this escrow')
    }

    let result: any = {}

    switch (action) {
      case 'release':
        // Only admin or couple can release funds
        if (!isAdmin && !isCouple) {
          throw new Error('Only the customer or admin can release funds')
        }

        if (escrow.status !== 'pending') {
          throw new Error('Can only release pending escrow transactions')
        }

        // Create vendor payout
        const { data: payout, error: payoutError } = await supabase
          .from('vendor_payouts')
          .insert({
            vendor_id: escrow.vendor_id,
            escrow_transaction_id: escrowId,
            amount: partialAmount || escrow.vendor_amount,
            currency: escrow.currency,
            payout_method: 'bank_transfer',
            status: 'pending'
          })
          .select()
          .single()

        if (payoutError) throw payoutError

        // Update escrow status
        await supabase
          .from('escrow_transactions')
          .update({
            status: partialAmount && partialAmount < escrow.vendor_amount ? 'partial_release' : 'released',
            released_at: new Date().toISOString(),
            status_reason: reason || 'Service completed successfully'
          })
          .eq('id', escrowId)

        result = { success: true, message: 'Funds released to vendor', payoutId: payout.id }
        break

      case 'refund':
        // Only admin can refund
        if (!isAdmin) {
          throw new Error('Only admin can process refunds')
        }

        if (!['pending', 'disputed'].includes(escrow.status)) {
          throw new Error('Cannot refund this transaction')
        }

        // Update escrow status
        await supabase
          .from('escrow_transactions')
          .update({
            status: 'refunded',
            status_reason: reason || 'Refund processed'
          })
          .eq('id', escrowId)

        // Update booking payment status
        await supabase
          .from('bookings')
          .update({ payment_status: 'refunded' })
          .eq('id', escrow.booking_id)

        result = { success: true, message: 'Refund processed' }
        break

      case 'dispute':
        // Couple can open dispute
        if (!isCouple && !isAdmin) {
          throw new Error('Only the customer or admin can open a dispute')
        }

        if (escrow.status !== 'pending') {
          throw new Error('Can only dispute pending transactions')
        }

        await supabase
          .from('escrow_transactions')
          .update({
            status: 'disputed',
            dispute_opened_at: new Date().toISOString(),
            dispute_notes: reason || 'Dispute opened by customer'
          })
          .eq('id', escrowId)

        result = { success: true, message: 'Dispute opened' }
        break

      case 'resolve_dispute':
        // Only admin can resolve disputes
        if (!isAdmin) {
          throw new Error('Only admin can resolve disputes')
        }

        if (escrow.status !== 'disputed') {
          throw new Error('No active dispute to resolve')
        }

        await supabase
          .from('escrow_transactions')
          .update({
            dispute_resolved_at: new Date().toISOString(),
            dispute_notes: `${escrow.dispute_notes}\n\nResolution: ${reason}`
          })
          .eq('id', escrowId)

        result = { success: true, message: 'Dispute resolved' }
        break

      default:
        throw new Error('Invalid action')
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Escrow management error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function checkIsAdmin(supabase: any, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin')
    .single()
  
  return !!data
}
