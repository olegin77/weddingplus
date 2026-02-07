import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    
    if (type === "budget") {
      systemPrompt = `You are an expert wedding budget advisor. Help couples plan their wedding budget based on:
- Total budget amount
- Number of guests
- Wedding style and priorities
- Location

Provide detailed breakdown by category (venue, catering, photography, flowers, etc.) with realistic cost estimates.
Be practical and give percentage allocations. Format your response clearly with categories and amounts.`;
    } else if (type === "vendor") {
      systemPrompt = `You are a wedding vendor recommendation specialist. Based on the couple's:
- Wedding style and theme
- Budget range
- Location
- Priorities

Suggest appropriate vendor types they should prioritize booking first, explain why each vendor is important, and give tips on what to look for when selecting vendors.`;
    } else if (type === "timeline") {
      systemPrompt = `You are a wedding planning timeline expert. Create a detailed timeline for wedding planning based on:
- Wedding date
- Current date
- Complexity of wedding

Provide month-by-month milestones and tasks, prioritized by importance. Include booking deadlines and when to start each task.`;
    } else {
      systemPrompt = `You are a helpful AI wedding planning assistant for Weddinguz platform. You help couples plan their perfect wedding by:
- Answering questions about wedding planning
- Providing budget advice
- Suggesting vendors and services
- Creating timelines and checklists
- Giving creative ideas for themes and decorations

Be friendly, enthusiastic, and practical. Keep responses concise but informative.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Слишком много запросов. Пожалуйста, попробуйте позже." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Требуется пополнение баланса Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error("No response from AI");
    }

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Wedding assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});