import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: {
      id: number
      first_name: string
      username?: string
    }
    chat: {
      id: number
      type: string
    }
    text?: string
    date: number
  }
  callback_query?: {
    id: string
    from: {
      id: number
      first_name: string
      username?: string
    }
    data: string
    message: {
      chat: {
        id: number
      }
    }
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

    const url = new URL(req.url)
    const webhookSecret = url.searchParams.get('secret')

    if (!webhookSecret) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Validate webhook secret
    const { data: connection, error: connError } = await supabase
      .from('telegram_connections')
      .select('*')
      .eq('webhook_secret', webhookSecret)
      .eq('is_active', true)
      .single()

    if (connError || !connection) {
      console.error('Invalid webhook secret')
      return new Response('Unauthorized', { status: 401 })
    }

    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error('TELEGRAM_BOT_TOKEN not configured')
    }

    const update: TelegramUpdate = await req.json()
    console.log('Telegram update received:', JSON.stringify(update))

    // Handle callback queries (button clicks)
    if (update.callback_query) {
      const { callback_query } = update
      const data = callback_query.data
      const chatId = callback_query.message.chat.id
      const userId = callback_query.from.id

      // Parse callback data: format is "rsvp_<response>_<invitationToken>"
      if (data.startsWith('rsvp_')) {
        const parts = data.split('_')
        const response = parts[1] // attending, not_attending, maybe
        const invitationToken = parts.slice(2).join('_')

        await handleRSVPResponse(supabase, connection, {
          telegramUserId: userId,
          telegramUsername: callback_query.from.username,
          telegramFirstName: callback_query.from.first_name,
          invitationToken,
          response,
          chatId
        }, TELEGRAM_BOT_TOKEN)

        // Answer callback query
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callback_query.id,
            text: getResponseText(response)
          })
        })
      }

      return new Response('OK', { headers: corsHeaders })
    }

    // Handle text messages
    if (update.message?.text) {
      const { message } = update
      const chatId = message.chat.id
      const text = (message.text || '').trim().toLowerCase()
      const userId = message.from.id

      // Handle /start command with invitation token
      if (text.startsWith('/start ')) {
        const invitationToken = text.substring(7).trim()
        await handleStartCommand(supabase, connection, invitationToken, chatId, userId, message.from, TELEGRAM_BOT_TOKEN)
      } 
      // Handle simple text responses
      else if (['да', 'yes', 'приду', 'буду', '+'].includes(text)) {
        await recordTextResponse(supabase, connection, userId, message.from, 'attending', chatId, TELEGRAM_BOT_TOKEN)
      } 
      else if (['нет', 'no', 'не приду', 'не буду', '-'].includes(text)) {
        await recordTextResponse(supabase, connection, userId, message.from, 'not_attending', chatId, TELEGRAM_BOT_TOKEN)
      }
      else if (['может', 'maybe', 'возможно', '?'].includes(text)) {
        await recordTextResponse(supabase, connection, userId, message.from, 'maybe', chatId, TELEGRAM_BOT_TOKEN)
      }
      // Default help response
      else if (text === '/start' || text === '/help') {
        await sendMessage(TELEGRAM_BOT_TOKEN, chatId, 
          '👋 Добро пожаловать!\n\n' +
          'Чтобы ответить на приглашение, перейдите по ссылке из вашего приглашения.\n\n' +
          'Или ответьте:\n' +
          '✅ "Да" или "Приду" - если придёте\n' +
          '❌ "Нет" или "Не приду" - если не сможете\n' +
          '❓ "Может" - если пока не уверены'
        )
      }

      // Update stats
      await supabase
        .from('telegram_connections')
        .update({ 
          total_responses_received: connection.total_responses_received + 1 
        })
        .eq('id', connection.id)
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Telegram webhook error:', error)
    return new Response('Error', { status: 500 })
  }
})

async function handleStartCommand(
  supabase: any,
  connection: any,
  invitationToken: string,
  chatId: number,
  userId: number,
  user: { first_name: string; username?: string },
  botToken: string
) {
  // Find invitation
  const { data: invitation, error } = await supabase
    .from('guest_invitations')
    .select('*, guest:guests(*), wedding_plan:wedding_plans(*)')
    .eq('token', invitationToken)
    .eq('wedding_plan_id', connection.wedding_plan_id)
    .single()

  if (error || !invitation) {
    await sendMessage(botToken, chatId, '❌ Приглашение не найдено или недействительно.')
    return
  }

  const guestName = invitation.guest?.full_name || 'Гость'
  const weddingDate = invitation.wedding_plan?.wedding_date
    ? new Date(invitation.wedding_plan.wedding_date).toLocaleDateString('ru-RU', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      })
    : ''

  // Send RSVP message with inline keyboard
  const keyboard = {
    inline_keyboard: [
      [
        { text: '✅ Приду', callback_data: `rsvp_attending_${invitationToken}` },
        { text: '❌ Не смогу', callback_data: `rsvp_not_attending_${invitationToken}` }
      ],
      [
        { text: '❓ Пока не уверен(а)', callback_data: `rsvp_maybe_${invitationToken}` }
      ]
    ]
  }

  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `👋 Здравствуйте, ${guestName}!\n\n` +
            `💒 Вы приглашены на свадьбу${weddingDate ? ` ${weddingDate}` : ''}!\n\n` +
            `Пожалуйста, подтвердите своё присутствие:`,
      reply_markup: keyboard
    })
  })

  // Update invitation as viewed
  await supabase
    .from('guest_invitations')
    .update({ viewed_at: new Date().toISOString() })
    .eq('id', invitation.id)
}

async function handleRSVPResponse(
  supabase: any,
  connection: any,
  data: {
    telegramUserId: number
    telegramUsername?: string
    telegramFirstName: string
    invitationToken: string
    response: string
    chatId: number
  },
  botToken: string
) {
  // Find invitation
  const { data: invitation, error } = await supabase
    .from('guest_invitations')
    .select('*, guest:guests(*)')
    .eq('token', data.invitationToken)
    .single()

  if (!invitation) {
    await sendMessage(botToken, data.chatId, '❌ Ошибка: приглашение не найдено')
    return
  }

  // Save response
  await supabase
    .from('telegram_rsvp_responses')
    .insert({
      telegram_connection_id: connection.id,
      guest_invitation_id: invitation.id,
      guest_id: invitation.guest_id,
      telegram_user_id: data.telegramUserId,
      telegram_username: data.telegramUsername,
      telegram_first_name: data.telegramFirstName,
      chat_id: data.chatId,
      rsvp_response: data.response,
      matched_at: new Date().toISOString()
    })

  // Update guest
  const guestStatus = data.response === 'attending' ? 'confirmed' 
    : data.response === 'not_attending' ? 'declined' 
    : 'pending'

  await supabase
    .from('guests')
    .update({ attendance_status: guestStatus })
    .eq('id', invitation.guest_id)

  // Update invitation
  await supabase
    .from('guest_invitations')
    .update({ responded_at: new Date().toISOString() })
    .eq('id', invitation.id)

  // Send confirmation
  const messages: Record<string, string> = {
    attending: '✅ Спасибо! Мы рады, что вы придёте! 🎉',
    not_attending: '❌ Очень жаль, что вы не сможете прийти. Надеемся увидеться в другой раз!',
    maybe: '❓ Хорошо, мы будем ждать вашего окончательного решения!'
  }

  await sendMessage(botToken, data.chatId, messages[data.response] || 'Спасибо за ответ!')
}

async function recordTextResponse(
  supabase: any,
  connection: any,
  userId: number,
  user: { first_name: string; username?: string },
  response: string,
  chatId: number,
  botToken: string
) {
  // Try to find existing response for this user to get guest_id
  const { data: existingResponse } = await supabase
    .from('telegram_rsvp_responses')
    .select('guest_id, guest_invitation_id')
    .eq('telegram_user_id', userId)
    .eq('telegram_connection_id', connection.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existingResponse?.guest_id) {
    // Update guest status
    const guestStatus = response === 'attending' ? 'confirmed' 
      : response === 'not_attending' ? 'declined' 
      : 'pending'

    await supabase
      .from('guests')
      .update({ attendance_status: guestStatus })
      .eq('id', existingResponse.guest_id)
  }

  // Record new response
  await supabase
    .from('telegram_rsvp_responses')
    .insert({
      telegram_connection_id: connection.id,
      guest_id: existingResponse?.guest_id || null,
      guest_invitation_id: existingResponse?.guest_invitation_id || null,
      telegram_user_id: userId,
      telegram_username: user.username,
      telegram_first_name: user.first_name,
      chat_id: chatId,
      rsvp_response: response
    })

  const messages: Record<string, string> = {
    attending: '✅ Отлично! Записали, что вы придёте! 🎉',
    not_attending: '❌ Поняли, жаль что не сможете.',
    maybe: '❓ Хорошо, ждём окончательного ответа!'
  }

  await sendMessage(botToken, chatId, messages[response])
}

async function sendMessage(botToken: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  })
}

function getResponseText(response: string): string {
  const texts: Record<string, string> = {
    attending: 'Записали! Спасибо!',
    not_attending: 'Записали. Жаль!',
    maybe: 'Хорошо!'
  }
  return texts[response] || 'Записали!'
}
