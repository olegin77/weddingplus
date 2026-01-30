import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GiftRegistry } from "@/components/gifts/GiftRegistry";
import { AchievementsDashboard } from "@/components/gamification/AchievementsDashboard";
import { PlanningProgress } from "@/components/gamification/PlanningProgress";
import { useWeddingPlanId } from "@/hooks/useWeddingPlanId";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Gift, Trophy, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GiftsPage() {
  const { weddingPlanId, isLoading: isPlanLoading } = useWeddingPlanId();

  const { data: weddingPlan } = useQuery({
    queryKey: ["wedding-plan-details", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return null;
      const { data, error } = await supabase
        .from("wedding_plans")
        .select("wedding_date")
        .eq("id", weddingPlanId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!weddingPlanId,
  });

  if (isPlanLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (!weddingPlanId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Gift className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Создайте план свадьбы</h2>
          <p className="text-muted-foreground">
            Для доступа к реестру подарков и достижениям необходимо создать план свадьбы
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Подарки и достижения</h1>
          <p className="text-muted-foreground">
            Управляйте списком желаний и отслеживайте прогресс планирования
          </p>
        </div>

        <Tabs defaultValue="gifts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="gifts" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Подарки</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden sm:inline">Прогресс</span>
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Достижения</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gifts">
            <GiftRegistry weddingPlanId={weddingPlanId} />
          </TabsContent>

          <TabsContent value="progress">
            <PlanningProgress 
              weddingPlanId={weddingPlanId} 
              weddingDate={weddingPlan?.wedding_date}
            />
          </TabsContent>

          <TabsContent value="achievements">
            <AchievementsDashboard weddingPlanId={weddingPlanId} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
