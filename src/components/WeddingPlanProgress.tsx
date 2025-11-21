import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Calendar, MapPin, DollarSign, Users, Palette, Briefcase } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type WeddingPlan = Database['public']['Tables']['wedding_plans']['Row'];

interface WeddingPlanProgressProps {
  weddingPlan: WeddingPlan | null;
  bookedVendorsCount?: number;
  totalVendorsNeeded?: number;
}

interface ProgressItem {
  label: string;
  completed: boolean;
  icon: React.ElementType;
  category: string;
}

export const WeddingPlanProgress = ({ 
  weddingPlan, 
  bookedVendorsCount = 0,
  totalVendorsNeeded = 8 
}: WeddingPlanProgressProps) => {
  if (!weddingPlan) return null;

  const items: ProgressItem[] = [
    {
      label: "Дата свадьбы",
      completed: !!weddingPlan.wedding_date,
      icon: Calendar,
      category: "Основное"
    },
    {
      label: "Место проведения",
      completed: !!weddingPlan.venue_location,
      icon: MapPin,
      category: "Основное"
    },
    {
      label: "Бюджет",
      completed: !!weddingPlan.budget_total && weddingPlan.budget_total > 0,
      icon: DollarSign,
      category: "Основное"
    },
    {
      label: "Количество гостей",
      completed: !!weddingPlan.estimated_guests && weddingPlan.estimated_guests > 0,
      icon: Users,
      category: "Основное"
    },
    {
      label: "Стиль свадьбы",
      completed: !!(weddingPlan.style_preferences as string[])?.length || !!weddingPlan.theme,
      icon: Palette,
      category: "Стиль"
    },
    {
      label: "Приоритеты",
      completed: !!(weddingPlan.priorities as any),
      icon: Briefcase,
      category: "Стиль"
    },
    {
      label: `Вендоры (${bookedVendorsCount}/${totalVendorsNeeded})`,
      completed: bookedVendorsCount >= totalVendorsNeeded,
      icon: Briefcase,
      category: "Вендоры"
    }
  ];

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  const getProgressColor = () => {
    if (progressPercentage < 30) return "bg-destructive";
    if (progressPercentage < 70) return "bg-warning";
    return "bg-success";
  };

  const getProgressMessage = () => {
    if (progressPercentage === 100) return "🎉 Отличная работа! План свадьбы полностью заполнен";
    if (progressPercentage >= 70) return "👏 Почти готово! Осталось совсем немного";
    if (progressPercentage >= 30) return "💪 Хорошее начало! Продолжайте заполнять";
    return "📝 Начните с заполнения основной информации";
  };

  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ProgressItem[]>);

  return (
    <Card className="shadow-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Прогресс планирования</span>
          <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progressPercentage} 
            className="h-3"
          />
          <p className="text-sm text-muted-foreground text-center">
            {getProgressMessage()}
          </p>
        </div>

        {/* Detailed Progress by Category */}
        <div className="space-y-4">
          {Object.entries(groupedItems).map(([category, categoryItems]) => {
            const categoryCompleted = categoryItems.filter(item => item.completed).length;
            const categoryTotal = categoryItems.length;
            const categoryPercentage = Math.round((categoryCompleted / categoryTotal) * 100);

            return (
              <div key={category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">
                    {categoryCompleted}/{categoryTotal}
                  </span>
                </div>
                
                <div className="space-y-1.5">
                  {categoryItems.map((item, idx) => {
                    const Icon = item.icon;
                    const StatusIcon = item.completed ? CheckCircle2 : Circle;
                    
                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          item.completed 
                            ? "bg-success/10 text-success-foreground" 
                            : "bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-sm flex-1">{item.label}</span>
                        <StatusIcon 
                          className={`w-5 h-5 shrink-0 ${
                            item.completed ? "text-success fill-success" : ""
                          }`} 
                        />
                      </div>
                    );
                  })}
                </div>

                <Progress 
                  value={categoryPercentage} 
                  className="h-1.5"
                />
              </div>
            );
          })}
        </div>

        {/* Action Hint */}
        {progressPercentage < 100 && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Следующий шаг:</strong>{" "}
              {!weddingPlan.wedding_date 
                ? "Укажите дату свадьбы"
                : !weddingPlan.venue_location
                ? "Выберите место проведения"
                : !weddingPlan.budget_total
                ? "Установите бюджет"
                : bookedVendorsCount < totalVendorsNeeded
                ? "Забронируйте необходимых вендоров"
                : "Завершите оставшиеся детали"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};