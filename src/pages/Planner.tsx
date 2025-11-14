import { useState, useEffect } from "react";
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
import { BudgetTracker } from "@/components/budget/BudgetTracker";

const Planner = () => {
  const [activeTab, setActiveTab] = useState("checklist");
  const [weddingPlan, setWeddingPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        .single();

      if (!error && data) {
        setWeddingPlan(data);
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

        <Card>
          <CardHeader>
            <CardTitle>Общий прогресс</CardTitle>
            <CardDescription>
              Вы выполнили {completedTasks} из {checklistItems.length} задач
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checklist">Чек-лист</TabsTrigger>
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

          <TabsContent value="budget">
            <BudgetTracker 
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