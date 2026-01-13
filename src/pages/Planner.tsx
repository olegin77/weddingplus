import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { GuestList } from "@/components/GuestList";
import { CreateWeddingPlanDialog } from "@/components/CreateWeddingPlanDialog";
import ExportPDFButton from "@/components/ExportPDFButton";
import { InvitationManager } from "@/components/InvitationManager";
import { WeddingWebsiteBuilder } from "@/components/WeddingWebsiteBuilder";
import { BudgetTracker, type BudgetTrackerRef } from "@/components/budget/BudgetTracker";
import { SmartVendorRecommendations } from "@/components/SmartVendorRecommendations";
import { WeddingPlanProgress } from "@/components/WeddingPlanProgress";
import { useMilestones } from "@/hooks/useMilestones";
import { AutoPackageSelector } from "@/components/AutoPackageSelector";
import type { AutoPackageResult } from "@/services/AutoPackageService";


const Planner = () => {
  const [activeTab, setActiveTab] = useState("checklist");
  const [weddingPlan, setWeddingPlan] = useState<any>(null);
  const [bookedVendorsCount, setBookedVendorsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const budgetTrackerRef = useRef<BudgetTrackerRef>(null);

  const totalVendorsNeeded = 8;
  
  // Callback для интеграции AutoPackageSelector с бюджет-трекером
  const handlePackageSelected = useCallback(async (result: AutoPackageResult) => {
    if (!result.success || result.vendors.length === 0) return;
    
    // Добавляем выбранных вендоров в бюджет-трекер
    if (budgetTrackerRef.current) {
      await budgetTrackerRef.current.addItemsFromPackage(result.vendors);
      // Переключаемся на вкладку бюджета
      setActiveTab("budget");
    }
  }, []);

  // Milestone tracking with confetti animations
  useMilestones(weddingPlan, bookedVendorsCount, totalVendorsNeeded);

  useEffect(() => {
    fetchWeddingPlan();
  }, []);

  const fetchWeddingPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("wedding_plans")
        .select("*")
        .eq("couple_user_id", user.id)
        .maybeSingle();

      if (!error && data) {
        setWeddingPlan(data);
        
        // Fetch booked vendors count
        const { data: bookings } = await supabase
          .from("bookings")
          .select("id")
          .eq("wedding_plan_id", data.id)
          .in("status", ["confirmed", "completed"]);
        
        setBookedVendorsCount(bookings?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching wedding plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!weddingPlan) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <h2 className="text-2xl font-bold">У вас пока нет свадебного плана</h2>
          <p className="text-muted-foreground">Создайте свой первый план, чтобы начать</p>
          <CreateWeddingPlanDialog onSuccess={fetchWeddingPlan} />
        </div>
      </DashboardLayout>
    );
  }

  const checklistItems = [
    { id: 1, title: "Выбрать дату свадьбы", completed: true, category: "Основное" },
    { id: 2, title: "Определить бюджет", completed: true, category: "Финансы" },
    { id: 3, title: "Составить список гостей", completed: false, category: "Гости" },
  ];

  const completedTasks = checklistItems.filter(item => item.completed).length;
  const progress = (completedTasks / checklistItems.length) * 100;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Мой свадебный план</h1>
            <p className="text-muted-foreground">
              {weddingPlan.theme || "Ваша идеальная свадьба"}
            </p>
          </div>
          <ExportPDFButton 
            planId={weddingPlan.id} 
            planName={weddingPlan.theme || 'plan'}
          />
        </div>

        {/* Wedding Plan Progress Card */}
        <WeddingPlanProgress 
          weddingPlan={weddingPlan}
          bookedVendorsCount={bookedVendorsCount}
          totalVendorsNeeded={totalVendorsNeeded}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="checklist">Чек-лист</TabsTrigger>
            <TabsTrigger value="auto-package">Автоподбор</TabsTrigger>
            <TabsTrigger value="recommendations">Вендоры</TabsTrigger>
            <TabsTrigger value="budget">Бюджет</TabsTrigger>
            <TabsTrigger value="guests">Гости</TabsTrigger>
            <TabsTrigger value="invitations">Приглашения</TabsTrigger>
            <TabsTrigger value="website">Сайт</TabsTrigger>
          </TabsList>

          <TabsContent value="checklist" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Задачи</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <Checkbox checked={item.completed} disabled />
                    <label className="flex-1 text-sm">{item.title}</label>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auto-package" className="space-y-4">
            <AutoPackageSelector
              weddingPlanId={weddingPlan.id}
              initialBudget={weddingPlan.budget_total}
              onPackageSelected={handlePackageSelected}
            />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Умный подбор команды</CardTitle>
                <CardDescription>
                  Система автоматически подберет лучших специалистов под ваш стиль и бюджет
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Фотограф */}
                <SmartVendorRecommendations
                  weddingPlanId={weddingPlan.id}
                  category="photographer"
                  categoryBudget={weddingPlan.budget_total ? weddingPlan.budget_total * 0.15 : undefined}
                />

                {/* Музыканты */}
                <SmartVendorRecommendations
                  weddingPlanId={weddingPlan.id}
                  category="music"
                  categoryBudget={weddingPlan.budget_total ? weddingPlan.budget_total * 0.12 : undefined}
                />

                {/* Декоратор */}
                <SmartVendorRecommendations
                  weddingPlanId={weddingPlan.id}
                  category="decorator"
                  categoryBudget={weddingPlan.budget_total ? weddingPlan.budget_total * 0.10 : undefined}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <BudgetTracker 
              ref={budgetTrackerRef}
              weddingPlanId={weddingPlan.id} 
              totalBudget={weddingPlan.budget_total || 0}
            />
          </TabsContent>

          <TabsContent value="guests">
            <GuestList weddingPlanId={weddingPlan.id} />
          </TabsContent>

          <TabsContent value="invitations">
            <InvitationManager weddingPlanId={weddingPlan.id} />
          </TabsContent>

          <TabsContent value="website">
            <WeddingWebsiteBuilder weddingPlanId={weddingPlan.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Planner;