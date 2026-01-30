import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, Calendar, ChevronRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface PlanningProgressProps {
  weddingPlanId: string;
  weddingDate?: string | null;
}

interface Milestone {
  id: string;
  milestone_type: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed_at: string | null;
  order_index: number;
  is_required: boolean;
}

const DEFAULT_MILESTONES = [
  { type: "budget", title: "Составить бюджет", description: "Определить общий бюджет и распределение по категориям", order: 1, required: true },
  { type: "venue", title: "Выбрать площадку", description: "Забронировать место проведения свадьбы", order: 2, required: true },
  { type: "guests", title: "Составить список гостей", description: "Добавить всех приглашённых гостей", order: 3, required: true },
  { type: "vendors", title: "Выбрать ключевых вендоров", description: "Фотограф, видеограф, ведущий", order: 4, required: true },
  { type: "invitations", title: "Отправить приглашения", description: "Создать и разослать приглашения гостям", order: 5, required: false },
  { type: "seating", title: "Составить рассадку", description: "Распределить гостей по столам", order: 6, required: false },
  { type: "menu", title: "Утвердить меню", description: "Согласовать меню с кейтерингом", order: 7, required: false },
  { type: "attire", title: "Выбрать наряды", description: "Платье невесты и костюм жениха", order: 8, required: true },
  { type: "decor", title: "Утвердить декор", description: "Финализировать оформление площадки", order: 9, required: false },
  { type: "final_check", title: "Финальная проверка", description: "Подтвердить все бронирования за неделю до свадьбы", order: 10, required: true },
];

export function PlanningProgress({ weddingPlanId, weddingDate }: PlanningProgressProps) {
  const queryClient = useQueryClient();

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["planning-milestones", weddingPlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planning_milestones")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("order_index", { ascending: true });

      if (error) throw error;

      // If no milestones, create defaults
      if (!data || data.length === 0) {
        const defaultData = DEFAULT_MILESTONES.map((m) => ({
          wedding_plan_id: weddingPlanId,
          milestone_type: m.type,
          title: m.title,
          description: m.description,
          order_index: m.order,
          is_required: m.required,
        }));

        const { data: inserted, error: insertError } = await supabase
          .from("planning_milestones")
          .insert(defaultData)
          .select();

        if (insertError) throw insertError;
        return inserted as Milestone[];
      }

      return data as Milestone[];
    },
  });

  const toggleMilestone = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase
        .from("planning_milestones")
        .update({ completed_at: completed ? new Date().toISOString() : null })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { completed }) => {
      queryClient.invalidateQueries({ queryKey: ["planning-milestones"] });
      if (completed) {
        toast.success("🎉 Отлично! Этап выполнен!");
      }
    },
  });

  const completedCount = milestones?.filter((m) => m.completed_at).length || 0;
  const totalCount = milestones?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const daysUntilWedding = weddingDate 
    ? differenceInDays(new Date(weddingDate), new Date()) 
    : null;

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-full">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Прогресс планирования</h3>
                <p className="text-sm text-muted-foreground">
                  {completedCount} из {totalCount} этапов выполнено
                </p>
              </div>
            </div>
            {daysUntilWedding !== null && daysUntilWedding > 0 && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-2xl font-bold text-emerald-600">
                  <Calendar className="h-5 w-5" />
                  {daysUntilWedding}
                </div>
                <p className="text-xs text-muted-foreground">дней до свадьбы</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Готовность</span>
              <span className="font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Milestone List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Этапы подготовки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <AnimatePresence>
            {milestones?.map((milestone, index) => {
              const isCompleted = !!milestone.completed_at;
              const isOverdue = milestone.target_date && 
                new Date(milestone.target_date) < new Date() && 
                !isCompleted;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isCompleted 
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200" 
                      : isOverdue
                        ? "bg-red-50 dark:bg-red-950/20 border-red-200"
                        : "hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={isCompleted}
                    onCheckedChange={(checked) => {
                      toggleMilestone.mutate({ id: milestone.id, completed: !!checked });
                    }}
                    className="h-5 w-5"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {milestone.title}
                      </span>
                      {milestone.is_required && (
                        <Badge variant="outline" className="text-xs">Обязательно</Badge>
                      )}
                      {isOverdue && !isCompleted && (
                        <Badge variant="destructive" className="text-xs">Просрочено</Badge>
                      )}
                    </div>
                    {milestone.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {milestone.description}
                      </p>
                    )}
                  </div>

                  {milestone.target_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(milestone.target_date), "d MMM", { locale: ru })}
                    </div>
                  )}

                  {isCompleted && milestone.completed_at && (
                    <Badge className="bg-emerald-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {format(new Date(milestone.completed_at), "d.MM", { locale: ru })}
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
