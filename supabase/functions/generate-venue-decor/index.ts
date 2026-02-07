import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DECOR_STYLES = {
  traditional_uzbek: {
    name: "Традиционный узбекский",
    prompt: "traditional Uzbek wedding decor with rich national ornaments, suzani patterns, gold and red colors, ikat textiles, elaborate table settings",
  },
  modern_minimal: {
    name: "Современный минимализм",
    prompt: "modern minimalist wedding decor with clean lines, white and sage green color palette, elegant simplicity, geometric accents, fresh greenery",
  },
  romantic_garden: {
    name: "Романтический сад",
    prompt: "romantic garden wedding decor with abundant flowers, roses, peonies, soft blush pink colors, fairy lights, cascading floral arrangements",
  },
  royal_luxury: {
    name: "Королевская роскошь",
    prompt: "luxurious royal wedding decor with golden chandeliers, crystal elements, velvet drapery, opulent table settings, grand floral centerpieces",
  },
  rustic_bohemian: {
    name: "Рустик бохо",
    prompt: "rustic bohemian wedding decor with natural wood, macrame, dried flowers, earthy tones, vintage elements, eclectic mix of textures",
  },
  classic_elegant: {
    name: "Классическая элегантность",
    prompt: "classic elegant wedding decor with white roses, silver accents, tall candelabras, sophisticated table settings, timeless beauty",
  },
};

const DECOR_ELEMENTS = {
  floral_arch: "beautiful wedding arch decorated with fresh flowers and greenery",
  table_centerpiece: "elegant table centerpiece with candles and floral arrangement",
  ceiling_draping: "romantic ceiling drapery with fairy lights",
  aisle_decor: "decorated wedding aisle with flower petals and lanterns",
  backdrop: "stunning photo backdrop with flower wall",
  entrance: "grand decorated entrance with floral garlands",
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
      venueImageUrl, 
      venueId, 
      decoratorId,
      weddingPlanId,
      style, 
      decorElements = [],
      colorPalette = [],
      customPrompt = "",
    } = await req.json();

    if (!venueImageUrl || !venueId || !style) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters: venueImageUrl, venueId, style" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate style
    const styleConfig = DECOR_STYLES[style as keyof typeof DECOR_STYLES];
    if (!styleConfig) {
      return new Response(
        JSON.stringify({ error: `Invalid style. Available styles: ${Object.keys(DECOR_STYLES).join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build decor elements description
    const elementsDescription = decorElements
      .map((el: string) => DECOR_ELEMENTS[el as keyof typeof DECOR_ELEMENTS] || el)
      .filter(Boolean)
      .join(", ");

    // Build color palette description
    const colorDescription = colorPalette.length > 0 
      ? `Color palette: ${colorPalette.join(", ")}.` 
      : "";

    // Build the prompt for AI image editing
    const editPrompt = `Transform this empty venue hall into a beautifully decorated wedding venue. 
Add ${styleConfig.prompt}.
${elementsDescription ? `Include these elements: ${elementsDescription}.` : ""}
${colorDescription}
${customPrompt ? `Additional details: ${customPrompt}` : ""}
Keep the original venue architecture and perspective intact.
Make it look photorealistic, as if professionally decorated for a real wedding.
High quality, detailed, natural lighting, professional photography.`;

    console.log("Generating venue decoration with prompt:", editPrompt);
    console.log("Base image URL:", venueImageUrl.substring(0, 100) + "...");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Call Lovable AI with image editing
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: editPrompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: venueImageUrl,
                },
              },
            ],
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

    // Extract the generated image
    const resultImageUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!resultImageUrl) {
      console.error("No image in response:", JSON.stringify(aiData));
      throw new Error("No image generated from AI");
    }

    // Create service role client for insert
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Save to database
    const { data: visualization, error: saveError } = await supabaseAdmin
      .from("venue_visualizations")
      .insert({
        wedding_plan_id: weddingPlanId || null,
        venue_id: venueId,
        decorator_id: decoratorId || null,
        base_image_url: venueImageUrl,
        result_image_url: resultImageUrl,
        style,
        decor_elements: decorElements,
        generation_params: {
          colorPalette,
          customPrompt,
          prompt: editPrompt,
        },
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving visualization:", saveError);
      throw saveError;
    }

    console.log("Venue visualization saved successfully:", visualization.id);

    return new Response(
      JSON.stringify({
        success: true,
        visualization: {
          id: visualization.id,
          resultImageUrl,
          style: styleConfig.name,
          baseImageUrl: venueImageUrl,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-venue-decor:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
