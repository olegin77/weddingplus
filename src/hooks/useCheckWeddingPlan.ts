import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user has a wedding plan
 * Redirects to onboarding if user is a couple without a plan
 */
export const useCheckWeddingPlan = (shouldRedirect = false) => {
  const navigate = useNavigate();
  const [hasWeddingPlan, setHasWeddingPlan] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWeddingPlan = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Check user role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Only check wedding plan for couples
        if (profile?.role !== "couple") {
          setHasWeddingPlan(true);
          setIsLoading(false);
          return;
        }

        // Check if couple has a wedding plan
        const { data: plans } = await supabase
          .from("wedding_plans")
          .select("id")
          .eq("couple_user_id", user.id)
          .limit(1);

        const hasPlan = plans && plans.length > 0;
        setHasWeddingPlan(hasPlan);

        // Redirect to onboarding if no plan and shouldRedirect is true
        if (!hasPlan && shouldRedirect) {
          navigate("/onboarding", { replace: true });
        }
      } catch (error) {
        console.error("Error checking wedding plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWeddingPlan();
  }, [navigate, shouldRedirect]);

  return { hasWeddingPlan, isLoading };
};