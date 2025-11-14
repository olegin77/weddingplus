import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WeddingPlanData {
  id: string
  wedding_date: string
  venue_location: string
  theme: string
  estimated_guests: number
  budget_total: number
  budget_spent: number
  notes: string
}

const generatePDFHTML = (plan: WeddingPlanData, bookings: any[], guests: any[]) => {
  const budgetRemaining = (plan.budget_total || 0) - (plan.budget_spent || 0)
  const budgetPercentage = plan.budget_total ? ((plan.budget_spent || 0) / plan.budget_total * 100).toFixed(1) : 0

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { 
      font-family: Arial, sans-serif; 
      padding: 40px; 
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #f43f5e;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #f43f5e;
      margin: 0;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #f43f5e;
      border-bottom: 2px solid #fecdd3;
      padding-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin: 15px 0;
    }
    .info-item {
      padding: 10px;
      background: #fef2f2;
      border-radius: 8px;
    }
    .info-item strong {
      color: #f43f5e;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #fecdd3;
    }
    th {
      background: #fef2f2;
      color: #f43f5e;
      font-weight: bold;
    }
    .budget-bar {
      width: 100%;
      height: 30px;
      background: #fecdd3;
      border-radius: 15px;
      overflow: hidden;
      margin: 10px 0;
    }
    .budget-fill {
      height: 100%;
      background: #f43f5e;
      width: ${budgetPercentage}%;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #fecdd3;
      color: #9ca3af;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎊 План Свадьбы</h1>
    <p>WeddingTech UZ</p>
  </div>

  <div class="section">
    <h2>📋 Основная информация</h2>
    <div class="info-grid">
      <div class="info-item">
        <strong>Дата свадьбы:</strong><br>
        ${plan.wedding_date ? new Date(plan.wedding_date).toLocaleDateString('ru-RU', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) : 'Не указана'}
      </div>
      <div class="info-item">
        <strong>Место проведения:</strong><br>
        ${plan.venue_location || 'Не указано'}
      </div>
      <div class="info-item">
        <strong>Тема:</strong><br>
        ${plan.theme || 'Не указана'}
      </div>
      <div class="info-item">
        <strong>Гостей:</strong><br>
        ${plan.estimated_guests || 0} человек
      </div>
    </div>
  </div>

  <div class="section">
    <h2>💰 Бюджет</h2>
    <div class="info-grid">
      <div class="info-item">
        <strong>Общий бюджет:</strong><br>
        ${(plan.budget_total || 0).toLocaleString()} UZS
      </div>
      <div class="info-item">
        <strong>Потрачено:</strong><br>
        ${(plan.budget_spent || 0).toLocaleString()} UZS
      </div>
      <div class="info-item">
        <strong>Осталось:</strong><br>
        ${budgetRemaining.toLocaleString()} UZS
      </div>
      <div class="info-item">
        <strong>Использовано:</strong><br>
        ${budgetPercentage}%
      </div>
    </div>
    <div class="budget-bar">
      <div class="budget-fill"></div>
    </div>
  </div>

  ${bookings.length > 0 ? `
  <div class="section">
    <h2>📅 Бронирования (${bookings.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Поставщик</th>
          <th>Дата</th>
          <th>Стоимость</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        ${bookings.map(b => `
          <tr>
            <td>${b.vendor?.business_name || 'N/A'}</td>
            <td>${new Date(b.booking_date).toLocaleDateString('ru-RU')}</td>
            <td>${b.price.toLocaleString()} UZS</td>
            <td>${b.status === 'confirmed' ? '✅ Подтверждено' : 
                  b.status === 'pending' ? '⏳ Ожидание' : 
                  b.status === 'cancelled' ? '❌ Отменено' : 
                  '✔️ Завершено'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${guests.length > 0 ? `
  <div class="section">
    <h2>👥 Список гостей (${guests.length})</h2>
    <table>
      <thead>
        <tr>
          <th>Имя</th>
          <th>Email</th>
          <th>Телефон</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        ${guests.map(g => `
          <tr>
            <td>${g.full_name}${g.plus_one_allowed ? ' +1' : ''}</td>
            <td>${g.email || '-'}</td>
            <td>${g.phone || '-'}</td>
            <td>${g.attendance_status === 'confirmed' ? '✅ Придет' : 
                  g.attendance_status === 'declined' ? '❌ Не придет' : 
                  '⏳ Ожидание'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  ` : ''}

  ${plan.notes ? `
  <div class="section">
    <h2>📝 Заметки</h2>
    <div class="info-item">
      ${plan.notes}
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <p>Создано в WeddingTech UZ • ${new Date().toLocaleDateString('ru-RU')}</p>
    <p>weddingtech.uz</p>
  </div>
</body>
</html>
  `
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

    const { planId } = await req.json()

    // Fetch wedding plan
    const { data: plan, error: planError } = await supabase
      .from('wedding_plans')
      .select('*')
      .eq('id', planId)
      .eq('couple_user_id', user.id)
      .single()

    if (planError || !plan) {
      throw new Error('Wedding plan not found')
    }

    // Fetch bookings with vendor info
    const { data: bookings } = await supabase
      .from('bookings')
      .select(`
        *,
        vendor:vendor_profiles(business_name)
      `)
      .eq('wedding_plan_id', planId)

    // Fetch guests
    const { data: guests } = await supabase
      .from('guests')
      .select('*')
      .eq('wedding_plan_id', planId)

    const htmlContent = generatePDFHTML(plan, bookings || [], guests || [])

    // Note: For production PDF generation, use:
    // - Puppeteer
    // - wkhtmltopdf
    // - pdfmake
    // - jsPDF

    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="wedding-plan-${planId}.html"`
      }
    })
  } catch (error) {
    console.error('PDF export error:', error)
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