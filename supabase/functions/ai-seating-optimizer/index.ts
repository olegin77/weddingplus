import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://weddinguz.uz'

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Guest {
  id: string;
  full_name: string;
  guest_side: "groom" | "bride" | "both" | null;
  age_group: string | null;
  interests: string[] | null;
  languages: string[] | null;
  prefer_guests: string[] | null;
  avoid_guests: string[] | null;
  dietary_restrictions: string | null;
}

interface Table {
  id: string;
  table_number: number;
  capacity: number;
}

interface Assignment {
  guest_id: string;
  table_id: string;
  score: number;
  reasons: string[];
}

interface SeatingResult {
  assignments: Assignment[];
  conflicts: { guest1: string; guest2: string; reason: string }[];
  stats: {
    total_guests: number;
    seated_guests: number;
    conflict_count: number;
    preference_matches: number;
    average_compatibility: number;
  };
}

// Calculate compatibility score between two guests
function calculateCompatibility(guest1: Guest, guest2: Guest): { score: number; reasons: string[] } {
  let score = 50; // Base score
  const reasons: string[] = [];

  // Check explicit preferences
  if (guest1.prefer_guests?.includes(guest2.id) || guest2.prefer_guests?.includes(guest1.id)) {
    score += 30;
    reasons.push("Предпочитают сидеть рядом");
  }

  // Check explicit avoidances - heavy penalty
  if (guest1.avoid_guests?.includes(guest2.id) || guest2.avoid_guests?.includes(guest1.id)) {
    score -= 100;
    reasons.push("⚠️ Конфликт: не хотят сидеть рядом");
  }

  // Same side of family bonus
  if (guest1.guest_side && guest2.guest_side && guest1.guest_side === guest2.guest_side) {
    score += 15;
    reasons.push(`Обе стороны: ${guest1.guest_side === 'groom' ? 'жениха' : 'невесты'}`);
  }

  // Similar age group
  if (guest1.age_group && guest2.age_group && guest1.age_group === guest2.age_group) {
    score += 10;
    reasons.push("Одна возрастная группа");
  }

  // Shared interests
  const sharedInterests = guest1.interests?.filter(i => guest2.interests?.includes(i)) || [];
  if (sharedInterests.length > 0) {
    score += sharedInterests.length * 5;
    reasons.push(`Общие интересы: ${sharedInterests.join(", ")}`);
  }

  // Shared languages
  const sharedLanguages = guest1.languages?.filter(l => guest2.languages?.includes(l)) || [];
  if (sharedLanguages.length > 0) {
    score += sharedLanguages.length * 8;
    reasons.push(`Общие языки: ${sharedLanguages.join(", ")}`);
  }

  return { score: Math.max(0, Math.min(100, score)), reasons };
}

// Calculate table compatibility for a guest
function calculateTableScore(guest: Guest, tableGuests: Guest[]): { score: number; reasons: string[] } {
  if (tableGuests.length === 0) {
    return { score: 50, reasons: ["Первый гость за столом"] };
  }

  let totalScore = 0;
  const allReasons: string[] = [];

  for (const otherGuest of tableGuests) {
    const { score, reasons } = calculateCompatibility(guest, otherGuest);
    totalScore += score;
    allReasons.push(...reasons);
  }

  return {
    score: Math.round(totalScore / tableGuests.length),
    reasons: [...new Set(allReasons)].slice(0, 5),
  };
}

// Main AI seating optimization algorithm
function optimizeSeating(guests: Guest[], tables: Table[]): SeatingResult {
  const assignments: Assignment[] = [];
  const conflicts: { guest1: string; guest2: string; reason: string }[] = [];
  const tableOccupancy: Map<string, Guest[]> = new Map();
  let preferenceMatches = 0;

  // Initialize empty tables
  tables.forEach((t) => tableOccupancy.set(t.id, []));

  // Sort guests by constraint complexity (more constraints = seat first)
  const sortedGuests = [...guests].sort((a, b) => {
    const aConstraints = (a.prefer_guests?.length || 0) + (a.avoid_guests?.length || 0);
    const bConstraints = (b.prefer_guests?.length || 0) + (b.avoid_guests?.length || 0);
    return bConstraints - aConstraints;
  });

  // Seat each guest at the best available table
  for (const guest of sortedGuests) {
    let bestTable: Table | null = null;
    let bestScore = -Infinity;
    let bestReasons: string[] = [];

    for (const table of tables) {
      const currentGuests = tableOccupancy.get(table.id) || [];
      
      // Skip full tables
      if (currentGuests.length >= table.capacity) continue;

      const { score, reasons } = calculateTableScore(guest, currentGuests);

      // Check for hard conflicts
      const hasHardConflict = currentGuests.some(
        (g) => guest.avoid_guests?.includes(g.id) || g.avoid_guests?.includes(guest.id)
      );

      if (hasHardConflict) continue; // Skip tables with conflicts

      if (score > bestScore) {
        bestScore = score;
        bestTable = table;
        bestReasons = reasons;
      }
    }

    if (bestTable) {
      assignments.push({
        guest_id: guest.id,
        table_id: bestTable.id,
        score: bestScore,
        reasons: bestReasons,
      });

      const tableGuests = tableOccupancy.get(bestTable.id) || [];
      tableGuests.push(guest);
      tableOccupancy.set(bestTable.id, tableGuests);

      // Count preference matches
      const hasPreferenceMatch = tableGuests.some(
        (g) => guest.prefer_guests?.includes(g.id) || g.prefer_guests?.includes(guest.id)
      );
      if (hasPreferenceMatch) preferenceMatches++;
    }
  }

  // Detect remaining conflicts in final seating
  for (const [tableId, tableGuests] of tableOccupancy) {
    for (let i = 0; i < tableGuests.length; i++) {
      for (let j = i + 1; j < tableGuests.length; j++) {
        const g1 = tableGuests[i];
        const g2 = tableGuests[j];

        if (g1.avoid_guests?.includes(g2.id) || g2.avoid_guests?.includes(g1.id)) {
          conflicts.push({
            guest1: g1.full_name,
            guest2: g2.full_name,
            reason: "Указаны как несовместимые",
          });
        }
      }
    }
  }

  // Calculate average compatibility
  const totalScore = assignments.reduce((sum, a) => sum + a.score, 0);
  const avgCompatibility = assignments.length > 0 ? Math.round(totalScore / assignments.length) : 0;

  return {
    assignments,
    conflicts,
    stats: {
      total_guests: guests.length,
      seated_guests: assignments.length,
      conflict_count: conflicts.length,
      preference_matches: preferenceMatches,
      average_compatibility: avgCompatibility,
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { wedding_plan_id, seating_chart_id, mode = "optimize" } = await req.json();

    if (!wedding_plan_id || !seating_chart_id) {
      throw new Error("wedding_plan_id and seating_chart_id are required");
    }

    // Verify user owns the wedding plan (IDOR protection)
    const { data: plan, error: planError } = await supabaseClient
      .from("wedding_plans")
      .select("id")
      .eq("id", wedding_plan_id)
      .eq("couple_user_id", user.id)
      .single();

    if (planError || !plan) {
      return new Response(
        JSON.stringify({ error: "Wedding plan not found or access denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch guests with relationship data
    const { data: guests, error: guestsError } = await supabaseClient
      .from("guests")
      .select("id, full_name, guest_side, age_group, interests, languages, prefer_guests, avoid_guests, dietary_restrictions")
      .eq("wedding_plan_id", wedding_plan_id)
      .eq("attendance_status", "attending");

    if (guestsError) throw guestsError;

    // Fetch tables
    const { data: tables, error: tablesError } = await supabaseClient
      .from("seating_tables")
      .select("id, table_number, capacity")
      .eq("seating_chart_id", seating_chart_id);

    if (tablesError) throw tablesError;

    if (!guests?.length) {
      return new Response(
        JSON.stringify({ error: "Нет гостей со статусом 'attending'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!tables?.length) {
      return new Response(
        JSON.stringify({ error: "Нет столов в плане рассадки" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Run AI optimization
    const result = optimizeSeating(guests as Guest[], tables as Table[]);

    if (mode === "apply") {
      // Clear existing assignments
      const tableIds = tables.map((t) => t.id);
      await supabaseClient
        .from("table_assignments")
        .delete()
        .in("seating_table_id", tableIds);

      // Insert new assignments
      const assignmentsToInsert = result.assignments.map((a) => ({
        guest_id: a.guest_id,
        seating_table_id: a.table_id,
      }));

      if (assignmentsToInsert.length > 0) {
        const { error: insertError } = await supabaseClient
          .from("table_assignments")
          .insert(assignmentsToInsert);

        if (insertError) throw insertError;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI Seating error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
