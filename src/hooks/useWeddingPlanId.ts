import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to get the current user's wedding plan ID
 */
export const useWeddingPlanId = () => {
  const [weddingPlanId, setWeddingPlanId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeddingPlanId = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Get the wedding plan for this user
        const { data: plans, error } = await supabase
          .from("wedding_plans")
          .select("id")
          .eq("couple_user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) {
          console.error("Error fetching wedding plan:", error);
        } else if (plans && plans.length > 0) {
          setWeddingPlanId(plans[0].id);
        }
      } catch (error) {
        console.error("Error in useWeddingPlanId:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeddingPlanId();
  }, []);

  return { weddingPlanId, isLoading };
};
