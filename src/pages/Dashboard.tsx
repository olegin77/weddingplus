import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, ShoppingBag, Sparkles, Star } from "lucide-react";
import { CreateWeddingPlanDialog } from "@/components/CreateWeddingPlanDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    daysUntilWedding: 0,
    budget: 0,
    guests: 0,
    vendors: 0,
  });
  const [hasWeddingPlan, setHasWeddingPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(profileData);

      const { data: weddingPlan } = await supabase
        .from("wedding_plans")
        .select("*")
        .eq("couple_user_id", user.id)
        .single();

      if (weddingPlan) {
        setHasWeddingPlan(true);
        const daysUntil = Math.ceil(
          (new Date(weddingPlan.wedding_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        const { data: guestsData } = await supabase
          .from("guests")
          .select("*")
          .eq("wedding_plan_id", weddingPlan.id);

        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("wedding_plan_id", weddingPlan.id);

        setStats({
          daysUntilWedding: daysUntil > 0 ? daysUntil : 0,
          budget: weddingPlan.budget_total || 0,
          guests: guestsData?.length || 0,
          vendors: bookingsData?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Добро пожаловать, {profile?.full_name || "Гость"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {profile?.role === "vendor" 
                ? "Управляйте вашими услугами" 
                : "Начните планирование вашей мечты"}
            </p>
          </div>
        </div>

        {profile?.role === "couple" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Дней до свадьбы</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.daysUntilWedding}</div>
                <p className="text-xs text-muted-foreground">
                  {hasWeddingPlan ? "Осталось дней" : "Создайте план"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Бюджет</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.budget.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Общий бюджет</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Гостей</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.guests}</div>
                <p className="text-xs text-muted-foreground">В списке гостей</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Поставщиков</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.vendors}</div>
                <p className="text-xs text-muted-foreground">Забронировано</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
            <CardDescription>Начните планирование прямо сейчас</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {!hasWeddingPlan ? (
              <CreateWeddingPlanDialog onSuccess={fetchDashboardData} />
            ) : (
              <>
                <Button className="w-full" variant="outline" onClick={() => navigate("/recommendations")}>
                  <Star className="mr-2 h-4 w-4" />
                  Рекомендации
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/planner")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Мой план
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/marketplace")}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Маркетплейс
                </Button>
                <Button className="w-full" variant="outline" onClick={() => navigate("/ai-assistant")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  AI Помощник
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;