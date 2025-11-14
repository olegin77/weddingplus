import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AIInvitationCreator } from "@/components/AIInvitationCreator";
import { CreateWeddingPlanDialog } from "@/components/CreateWeddingPlanDialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function AIInvitationCreatorPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [weddingPlanId, setWeddingPlanId] = useState<string | null>(null);

  useEffect(() => {
    checkWeddingPlan();
  }, []);

  const checkWeddingPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: plans, error } = await supabase
        .from("wedding_plans")
        .select("id")
        .eq("couple_user_id", user.id)
        .limit(1);

      if (error) throw error;

      if (plans && plans.length > 0) {
        setWeddingPlanId(plans[0].id);
      }
    } catch (error) {
      console.error("Error checking wedding plan:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить план свадьбы",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-6xl py-8">
        {weddingPlanId ? (
          <AIInvitationCreator weddingPlanId={weddingPlanId} />
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Сначала создайте свадебный план
            </p>
            <CreateWeddingPlanDialog onSuccess={checkWeddingPlan} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
