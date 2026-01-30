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

    const url = new URL(req.url)
    const token = url.searchParams.get('token')

    if (!token) {
      // Return HTML page for QR scan without token
      return new Response(
        getErrorHTML('Неверный QR-код'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // Get QR session
    const { data: session, error: sessionError } = await supabase
      .from('qr_payment_sessions')
      .select(`
        *,
        vendor:vendor_profiles(business_name, location)
      `)
      .eq('qr_token', token)
      .single()

    if (sessionError || !session) {
      return new Response(
        getErrorHTML('QR-код не найден или недействителен'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // Check if expired
    if (new Date(session.expires_at) < new Date()) {
      // Update status to expired
      await supabase
        .from('qr_payment_sessions')
        .update({ status: 'expired' })
        .eq('id', session.id)

      return new Response(
        getErrorHTML('Срок действия QR-кода истёк'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // Check if already paid
    if (session.status === 'paid') {
      return new Response(
        getSuccessHTML('Этот платёж уже был оплачен'),
        { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } }
      )
    }

    // Return payment page
    const paymentHTML = getPaymentHTML({
      sessionId: session.id,
      amount: session.amount,
      currency: session.currency,
      description: session.description,
      vendorName: session.vendor?.business_name || 'Продавец',
      vendorLocation: session.vendor?.location || '',
      token
    })

    return new Response(paymentHTML, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }
    })
  } catch (error) {
    console.error('QR scan error:', error)
    return new Response(
      getErrorHTML('Произошла ошибка'),
      { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' }, status: 500 }
    )
  }
})

interface PaymentPageData {
  sessionId: string
  amount: number
  currency: string
  description: string
  vendorName: string
  vendorLocation: string
  token: string
}

function getPaymentHTML(data: PaymentPageData): string {
  const formattedAmount = new Intl.NumberFormat('ru-RU').format(data.amount)
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Оплата - WeddingTech UZ</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 20px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    }
    .logo { text-align: center; margin-bottom: 24px; font-size: 24px; }
    .vendor-name { font-size: 18px; color: #333; text-align: center; margin-bottom: 8px; }
    .vendor-location { font-size: 14px; color: #666; text-align: center; margin-bottom: 24px; }
    .amount { font-size: 36px; font-weight: bold; text-align: center; color: #1a1a1a; margin-bottom: 8px; }
    .description { font-size: 14px; color: #666; text-align: center; margin-bottom: 32px; }
    .providers { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .provider-btn {
      padding: 16px;
      border: 2px solid #e5e5e5;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 16px;
      font-weight: 500;
    }
    .provider-btn:hover { border-color: #667eea; background: #f8f9ff; }
    .provider-btn.selected { border-color: #667eea; background: #f0f3ff; }
    .pay-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .pay-btn:hover { transform: scale(1.02); }
    .pay-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .secure { font-size: 12px; color: #888; text-align: center; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">💍 WeddingTech UZ</div>
    <div class="vendor-name">${data.vendorName}</div>
    <div class="vendor-location">${data.vendorLocation}</div>
    <div class="amount">${formattedAmount} ${data.currency}</div>
    <div class="description">${data.description}</div>
    
    <div class="providers">
      <button class="provider-btn" data-provider="payme">💳 Payme</button>
      <button class="provider-btn" data-provider="click">💰 Click</button>
      <button class="provider-btn" data-provider="uzum">🟣 Uzum</button>
      <button class="provider-btn" data-provider="apelsin">🍊 Apelsin</button>
    </div>
    
    <button class="pay-btn" id="payBtn" disabled>Выберите способ оплаты</button>
    
    <div class="secure">🔒 Безопасная оплата через эскроу</div>
  </div>

  <script>
    let selectedProvider = null;
    const buttons = document.querySelectorAll('.provider-btn');
    const payBtn = document.getElementById('payBtn');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedProvider = btn.dataset.provider;
        payBtn.disabled = false;
        payBtn.textContent = 'Оплатить через ' + btn.textContent.trim();
      });
    });
    
    payBtn.addEventListener('click', async () => {
      if (!selectedProvider) return;
      payBtn.disabled = true;
      payBtn.textContent = 'Обработка...';
      
      try {
        // Redirect to payment processing
        window.location.href = '/functions/v1/process-qr-payment?token=${data.token}&provider=' + selectedProvider;
      } catch (error) {
        alert('Ошибка обработки платежа');
        payBtn.disabled = false;
      }
    });
  </script>
</body>
</html>`
}

function getErrorHTML(message: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ошибка - WeddingTech UZ</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #fef2f2; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; padding: 32px; border-radius: 16px; text-align: center; max-width: 300px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    .message { color: #dc2626; font-size: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">❌</div>
    <div class="message">${message}</div>
  </div>
</body>
</html>`
}

function getSuccessHTML(message: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Успех - WeddingTech UZ</title>
  <style>
    body { font-family: -apple-system, sans-serif; background: #f0fdf4; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .card { background: white; padding: 32px; border-radius: 16px; text-align: center; max-width: 300px; }
    .icon { font-size: 48px; margin-bottom: 16px; }
    .message { color: #16a34a; font-size: 18px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">✅</div>
    <div class="message">${message}</div>
  </div>
</body>
</html>`
}
