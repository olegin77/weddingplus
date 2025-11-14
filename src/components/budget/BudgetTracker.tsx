import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { BudgetItemDialog } from "./BudgetItemDialog";
import { BudgetChart } from "./BudgetChart";
import { BudgetCategoryCard } from "./BudgetCategoryCard";
import { useToast } from "@/hooks/use-toast";

interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  planned_amount: number;
  actual_amount: number;
  paid_amount: number;
  vendor_id: string | null;
  booking_id: string | null;
  notes: string | null;
  payment_status: string;
  due_date: string | null;
}

interface CategoryData {
  category: string;
  planned: number;
  actual: number;
  paid: number;
  items: BudgetItem[];
}

interface BudgetTrackerProps {
  weddingPlanId: string;
  totalBudget: number;
}

const categoryLabels: Record<string, string> = {
  venue: "Площадка",
  catering: "Кейтеринг",
  photography: "Фотография",
  videography: "Видеосъемка",
  flowers: "Цветы",
  decoration: "Декор",
  music: "Музыка",
  attire: "Наряды",
  makeup: "Макияж",
  invitations: "Приглашения",
  transportation: "Транспорт",
  gifts: "Подарки",
  rings: "Кольца",
  honeymoon: "Медовый месяц",
  other: "Другое",
};

export function BudgetTracker({ weddingPlanId, totalBudget }: BudgetTrackerProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);

  useEffect(() => {
    fetchBudgetItems();
  }, [weddingPlanId]);

  const fetchBudgetItems = async () => {
    try {
      const { data, error } = await supabase
        .from("budget_items")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("category", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching budget items:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить статьи бюджета",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from("budget_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Статья бюджета удалена",
      });

      fetchBudgetItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить статью",
      });
    }
  };

  const handleEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null);
    fetchBudgetItems();
  };

  // Calculate totals
  const totalPlanned = items.reduce((sum, item) => sum + Number(item.planned_amount), 0);
  const totalActual = items.reduce((sum, item) => sum + Number(item.actual_amount), 0);
  const totalPaid = items.reduce((sum, item) => sum + Number(item.paid_amount), 0);
  const totalUnpaid = totalActual - totalPaid;

  // Calculate by category
  const categoryData: CategoryData[] = Object.keys(categoryLabels).map((cat) => {
    const categoryItems = items.filter((item) => item.category === cat);
    return {
      category: cat,
      planned: categoryItems.reduce((sum, item) => sum + Number(item.planned_amount), 0),
      actual: categoryItems.reduce((sum, item) => sum + Number(item.actual_amount), 0),
      paid: categoryItems.reduce((sum, item) => sum + Number(item.paid_amount), 0),
      items: categoryItems,
    };
  }).filter((cat) => cat.items.length > 0);

  // Budget alerts
  const budgetExceeded = totalActual > totalBudget;
  const budgetWarning = totalActual > totalBudget * 0.9;

  const budgetUsagePercent = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;
  const paidPercent = totalActual > 0 ? (totalPaid / totalActual) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Alerts */}
      {budgetExceeded && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Превышен бюджет!</strong> Фактические расходы превышают запланированный
            бюджет на {((totalActual - totalBudget) / 1000).toFixed(0)} тыс. UZS
          </AlertDescription>
        </Alert>
      )}

      {budgetWarning && !budgetExceeded && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Внимание!</strong> Вы использовали {budgetUsagePercent.toFixed(0)}% бюджета
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общий бюджет
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalBudget / 1000).toFixed(0)} тыс
            </div>
            <p className="text-xs text-muted-foreground">UZS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Запланировано
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalPlanned / 1000).toFixed(0)} тыс
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {totalPlanned > totalBudget ? (
                <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
              )}
              {totalBudget > 0 ? ((totalPlanned / totalBudget) * 100).toFixed(0) : 0}% от бюджета
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Фактически
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalActual / 1000).toFixed(0)} тыс
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {totalActual > totalBudget ? (
                <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
              )}
              {totalBudget > 0 ? ((totalActual / totalBudget) * 100).toFixed(0) : 0}% от бюджета
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Оплачено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(totalPaid / 1000).toFixed(0)} тыс
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              Осталось: {(totalUnpaid / 1000).toFixed(0)} тыс
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Использование бюджета</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Фактические расходы</span>
              <span className="font-medium">
                {budgetUsagePercent.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={budgetUsagePercent} 
              className={`h-3 ${budgetExceeded ? "[&>div]:bg-red-500" : budgetWarning ? "[&>div]:bg-yellow-500" : ""}`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Оплаченные расходы</span>
              <span className="font-medium">
                {paidPercent.toFixed(0)}%
              </span>
            </div>
            <Progress value={paidPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <BudgetChart 
          data={categoryData} 
          type="pie"
          title="Распределение по категориям"
        />
        <BudgetChart 
          data={categoryData}
          type="bar"
          title="План vs Факт"
        />
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить статью
        </Button>
      </div>

      {/* Category Cards */}
      <div className="space-y-4">
        {categoryData.map((category) => (
          <BudgetCategoryCard
            key={category.category}
            category={category.category}
            label={categoryLabels[category.category]}
            data={category}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">
              Пока нет статей бюджета
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Добавить первую статью
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <BudgetItemDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        weddingPlanId={weddingPlanId}
        editingItem={editingItem}
      />
    </div>
  );
}
