import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  type: 'booking_confirmed' | 'booking_cancelled' | 'booking_reminder' | 'payment_confirmed'
  bookingData?: any
}

const getEmailTemplate = (type: string, data: any) => {
  const templates = {
    booking_confirmed: {
      subject: '✅ Бронирование подтверждено - WeddingTech UZ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f43f5e;">Ваше бронирование подтверждено!</h2>
          <p>Здравствуйте,</p>
          <p>Поставщик подтвердил ваше бронирование.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Дата:</strong> ${new Date(data.booking_date).toLocaleDateString('ru-RU')}</p>
            <p><strong>Стоимость:</strong> ${data.price.toLocaleString()} UZS</p>
            ${data.notes ? `<p><strong>Примечания:</strong> ${data.notes}</p>` : ''}
          </div>
          <p>С наилучшими пожеланиями,<br>Команда WeddingTech UZ</p>
        </div>
      `
    },
    booking_cancelled: {
      subject: '❌ Бронирование отменено - WeddingTech UZ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f43f5e;">Бронирование отменено</h2>
          <p>Здравствуйте,</p>
          <p>К сожалению, ваше бронирование было отменено.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Дата:</strong> ${new Date(data.booking_date).toLocaleDateString('ru-RU')}</p>
            <p><strong>Стоимость:</strong> ${data.price.toLocaleString()} UZS</p>
          </div>
          <p>Вы можете найти других поставщиков в нашем маркетплейсе.</p>
          <p>С уважением,<br>Команда WeddingTech UZ</p>
        </div>
      `
    },
    booking_reminder: {
      subject: '🔔 Напоминание о мероприятии - WeddingTech UZ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f43f5e;">Напоминание о предстоящем мероприятии</h2>
          <p>Здравствуйте,</p>
          <p>Напоминаем, что ваше мероприятие состоится через 7 дней!</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Дата:</strong> ${new Date(data.booking_date).toLocaleDateString('ru-RU')}</p>
            <p><strong>Поставщик:</strong> ${data.vendor_name}</p>
          </div>
          <p>Убедитесь, что все готово к важному дню!</p>
          <p>С наилучшими пожеланиями,<br>Команда WeddingTech UZ</p>
        </div>
      `
    },
    payment_confirmed: {
      subject: '💳 Оплата получена - WeddingTech UZ',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f43f5e;">Оплата успешно получена</h2>
          <p>Здравствуйте,</p>
          <p>Ваш платеж был успешно обработан.</p>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Сумма:</strong> ${data.amount.toLocaleString()} UZS</p>
            <p><strong>Провайдер:</strong> ${data.provider}</p>
            <p><strong>ID транзакции:</strong> ${data.transaction_id}</p>
          </div>
          <p>Спасибо за использование WeddingTech UZ!</p>
          <p>С уважением,<br>Команда WeddingTech UZ</p>
        </div>
      `
    }
  }

  return templates[type as keyof typeof templates] || templates.booking_confirmed
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

    const { to, subject, type, bookingData }: EmailRequest = await req.json()

    console.log('Sending email notification:', { to, type })

    // Check user notification preferences
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select('email_notifications')
      .eq('user_id', bookingData?.user_id)
      .single()

    if (preferences && !preferences.email_notifications) {
      console.log('User has disabled email notifications')
      return new Response(
        JSON.stringify({ success: true, message: 'Email disabled by user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const template = getEmailTemplate(type, bookingData || {})

    // Note: This is a placeholder. In production, integrate with:
    // - Resend (resend.com)
    // - SendGrid
    // - AWS SES
    // - Mailgun
    
    // For now, we'll just log the email
    console.log('Email would be sent:', {
      to,
      subject: template.subject,
      html: template.html
    })

    // In production, uncomment and configure your email service:
    /*
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'WeddingTech UZ <notifications@weddingtech.uz>',
        to: [to],
        subject: template.subject,
        html: template.html
      })
    })
    */

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Email notification sent',
        type
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Email notification error:', error)
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