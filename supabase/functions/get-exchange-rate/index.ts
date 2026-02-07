import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch exchange rate from Central Bank of Uzbekistan
    const response = await fetch("https://cbu.uz/oz/arkhiv-kursov-valyut/json/");
    
    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates from CBU");
    }

    const data = await response.json();
    
    // Find USD rate
    const usdRate = data.find((rate: any) => rate.Ccy === "USD");
    
    if (!usdRate) {
      throw new Error("USD rate not found");
    }

    return new Response(
      JSON.stringify({
        success: true,
        usd_rate: parseFloat(usdRate.Rate),
        date: usdRate.Date,
        currency: "UZS",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Exchange rate error:", error);
    
    // Return fallback rate if API fails
    return new Response(
      JSON.stringify({
        success: true,
        usd_rate: 12800, // Fallback approximate rate
        date: new Date().toISOString().split('T')[0],
        currency: "UZS",
        fallback: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
