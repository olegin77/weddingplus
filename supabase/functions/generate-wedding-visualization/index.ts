import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const WEDDING_STYLES = {
  traditional: "Traditional Uzbek wedding with beautiful national ornaments, rich decorations, traditional clothing",
  modern: "Modern elegant wedding with minimalist design, contemporary aesthetics, stylish decor",
  royal: "Luxurious royal palace wedding with grand chandeliers, golden decorations, majestic atmosphere",
  garden: "Beautiful garden wedding with flowers, natural greenery, outdoor romantic setting",
  romantic: "Romantic fairy-tale wedding with soft lighting, dreamy atmosphere, delicate decorations",
  rustic: "Rustic countryside wedding with natural wood, vintage elements, cozy atmosphere",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { weddingPlanId, style, quality = "medium" } = await req.json();

    if (!weddingPlanId || !style) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify wedding plan belongs to user
    const { data: weddingPlan, error: planError } = await supabaseClient
      .from("wedding_plans")
      .select("*")
      .eq("id", weddingPlanId)
      .eq("couple_user_id", user.id)
      .single();

    if (planError || !weddingPlan) {
      return new Response(
        JSON.stringify({ error: "Wedding plan not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build prompt
    const styleDescription = WEDDING_STYLES[style as keyof typeof WEDDING_STYLES] || WEDDING_STYLES.modern;
    const prompt = `A stunning professional wedding photograph. ${styleDescription}. 
    The scene shows a beautiful wedding ceremony with elegant bride and groom. 
    High quality, detailed, photorealistic, cinematic lighting, professional photography, 
    ${weddingPlan.venue_location ? `venue in ${weddingPlan.venue_location}` : ""}.
    Ultra high resolution, 4K quality.`;

    console.log("Generating image with prompt:", prompt);

    // Call Lovable AI to generate image
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    console.log("AI response received");

    // Extract base64 image
    const imageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!imageUrl) {
      throw new Error("No image generated");
    }

    // Save to database
    const { data: visualization, error: saveError } = await supabaseClient
      .from("wedding_visualizations")
      .insert({
        wedding_plan_id: weddingPlanId,
        style,
        prompt,
        image_url: imageUrl,
        quality,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving visualization:", saveError);
      throw saveError;
    }

    console.log("Visualization saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        visualization,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-wedding-visualization:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
