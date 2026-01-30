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
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY')
    const ELEVENLABS_AGENT_ID = Deno.env.get('ELEVENLABS_VOICE_RSVP_AGENT_ID')
    
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY not configured')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'get-token') {
      // Get conversation token for ElevenLabs
      const { sessionToken } = await req.json()

      if (!sessionToken) {
        throw new Error('Session token required')
      }

      // Validate session
      const { data: session, error: sessionError } = await supabase
        .from('voice_rsvp_sessions')
        .select(`
          *,
          guest:guests(full_name, phone),
          invitation:guest_invitations(*, wedding_plan:wedding_plans(*))
        `)
        .eq('session_token', sessionToken)
        .single()

      if (sessionError || !session) {
        throw new Error('Invalid or expired session')
      }

      if (session.status === 'completed') {
        throw new Error('Session already completed')
      }

      // Get ElevenLabs conversation token
      const tokenResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/token?agent_id=${ELEVENLABS_AGENT_ID}`,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      )

      if (!tokenResponse.ok) {
        throw new Error('Failed to get ElevenLabs token')
      }

      const { token } = await tokenResponse.json()

      // Update session status
      await supabase
        .from('voice_rsvp_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', session.id)

      // Prepare context for the agent
      const guestName = session.guest?.full_name || 'Гость'
      const weddingDate = session.invitation?.wedding_plan?.wedding_date
      const formattedDate = weddingDate 
        ? new Date(weddingDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'скоро'

      return new Response(
        JSON.stringify({
          success: true,
          token,
          sessionId: session.id,
          context: {
            guestName,
            weddingDate: formattedDate,
            language: 'ru'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'save-result') {
      // Save RSVP result from voice conversation
      const { sessionToken, rsvpResponse, plusOnes, dietaryNotes, specialRequests, transcript } = await req.json()

      if (!sessionToken) {
        throw new Error('Session token required')
      }

      // Get and validate session
      const { data: session, error: sessionError } = await supabase
        .from('voice_rsvp_sessions')
        .select('*, invitation:guest_invitations(*)')
        .eq('session_token', sessionToken)
        .single()

      if (sessionError || !session) {
        throw new Error('Invalid session')
      }

      // Update voice session
      const { error: updateError } = await supabase
        .from('voice_rsvp_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          rsvp_response: rsvpResponse,
          plus_ones: plusOnes || 0,
          dietary_notes: dietaryNotes,
          special_requests: specialRequests,
          transcript: transcript || []
        })
        .eq('id', session.id)

      if (updateError) {
        throw new Error('Failed to save session result')
      }

      // Update guest invitation
      if (session.guest_invitation_id) {
        await supabase
          .from('guest_invitations')
          .update({
            responded_at: new Date().toISOString()
          })
          .eq('id', session.guest_invitation_id)
      }

      // Update guest status
      const guestStatus = rsvpResponse === 'attending' ? 'confirmed' 
        : rsvpResponse === 'not_attending' ? 'declined' 
        : 'pending'

      await supabase
        .from('guests')
        .update({
          attendance_status: guestStatus,
          dietary_restrictions: dietaryNotes || undefined,
          notes: specialRequests || undefined
        })
        .eq('id', session.guest_id)

      console.log('Voice RSVP completed:', { sessionId: session.id, response: rsvpResponse })

      return new Response(
        JSON.stringify({ success: true, message: 'RSVP saved successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'create-session') {
      // Create new voice RSVP session (called from invitation link)
      const { invitationToken } = await req.json()

      if (!invitationToken) {
        throw new Error('Invitation token required')
      }

      // Get invitation
      const { data: invitation, error: invError } = await supabase
        .from('guest_invitations')
        .select('*, guest:guests(*), wedding_plan:wedding_plans(*)')
        .eq('token', invitationToken)
        .single()

      if (invError || !invitation) {
        throw new Error('Invalid invitation')
      }

      // Check if voice RSVP is enabled
      const { data: settings } = await supabase
        .from('communication_settings')
        .select('voice_rsvp_enabled')
        .eq('wedding_plan_id', invitation.wedding_plan_id)
        .single()

      if (!settings?.voice_rsvp_enabled) {
        throw new Error('Voice RSVP is not enabled for this wedding')
      }

      // Generate unique session token
      const sessionToken = generateToken()

      // Create session
      const { data: session, error: createError } = await supabase
        .from('voice_rsvp_sessions')
        .insert({
          guest_invitation_id: invitation.id,
          guest_id: invitation.guest_id,
          wedding_plan_id: invitation.wedding_plan_id,
          session_token: sessionToken,
          status: 'pending'
        })
        .select()
        .single()

      if (createError) {
        throw new Error('Failed to create session')
      }

      return new Response(
        JSON.stringify({
          success: true,
          sessionToken,
          guestName: invitation.guest?.full_name
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action')
  } catch (error) {
    console.error('Voice RSVP error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage, success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

function generateToken(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let token = ''
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
