import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INVITATION_TEMPLATES = {
  classic: "Elegant classic wedding invitation with traditional ornate borders, gold accents, sophisticated typography, formal style",
  modern: "Modern minimalist wedding invitation with clean lines, contemporary design, bold typography, stylish layout",
  romantic: "Romantic wedding invitation with soft watercolor flowers, delicate details, dreamy atmosphere, pastel colors",
  floral: "Beautiful floral wedding invitation with abundant flowers, botanical elements, garden theme, natural beauty",
  luxury: "Luxurious gold and white wedding invitation with royal ornaments, premium feel, sophisticated elegance",
  rustic: "Rustic wedding invitation with wooden textures, kraft paper style, natural elements, countryside charm",
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

    const { 
      weddingPlanId, 
      template, 
      title,
      coupleNames,
      eventDate,
      venueName,
      customMessage 
    } = await req.json();

    if (!weddingPlanId || !template || !title || !coupleNames) {
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
    const templateDescription = INVITATION_TEMPLATES[template as keyof typeof INVITATION_TEMPLATES] || INVITATION_TEMPLATES.classic;
    
    const dateStr = eventDate ? new Date(eventDate).toLocaleDateString("ru-RU", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    }) : "";
    
    const prompt = `Create a beautiful wedding invitation card. ${templateDescription}.
    
    Text to include:
    - Title: "${title}"
    - Couple names: "${coupleNames}"
    ${dateStr ? `- Date: "${dateStr}"` : ""}
    ${venueName ? `- Venue: "${venueName}"` : ""}
    ${customMessage ? `- Message: "${customMessage}"` : ""}
    
    Professional design, high quality, elegant typography, centered layout, 
    invitation card format (portrait orientation), wedding theme, ultra high resolution.`;

    console.log("Generating invitation with template:", template);

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
    const { data: invitation, error: saveError } = await supabaseClient
      .from("wedding_invitations")
      .insert({
        wedding_plan_id: weddingPlanId,
        template,
        title,
        couple_names: coupleNames,
        event_date: eventDate || null,
        venue_name: venueName || null,
        custom_message: customMessage || null,
        image_url: imageUrl,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving invitation:", saveError);
      throw saveError;
    }

    console.log("Invitation saved successfully");

    return new Response(
      JSON.stringify({
        success: true,
        invitation,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-wedding-invitation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
