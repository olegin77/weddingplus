import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Heart,
  Loader2,
  Zap,
  BarChart3,
  Play
} from "lucide-react";

interface Assignment {
  guest_id: string;
  table_id: string;
  score: number;
  reasons: string[];
}

interface Conflict {
  guest1: string;
  guest2: string;
  reason: string;
}

interface SeatingStats {
  total_guests: number;
  seated_guests: number;
  conflict_count: number;
  preference_matches: number;
  average_compatibility: number;
}

interface SeatingResult {
  assignments: Assignment[];
  conflicts: Conflict[];
  stats: SeatingStats;
}

interface AISeatingOptimizerProps {
  weddingPlanId: string;
  seatingChartId: string;
  onOptimizationApplied: () => void;
}

export function AISeatingOptimizer({
  weddingPlanId,
  seatingChartId,
  onOptimizationApplied,
}: AISeatingOptimizerProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<SeatingResult | null>(null);

  const runOptimization = async (apply: boolean = false) => {
    if (apply) {
      setApplying(true);
    } else {
      setLoading(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-seating-optimizer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            wedding_plan_id: weddingPlanId,
            seating_chart_id: seatingChartId,
            mode: apply ? "apply" : "optimize",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Ошибка оптимизации");
      }

      const data = await response.json();
      setResult(data);

      if (apply) {
        toast({
          title: "Рассадка применена! ✅",
          description: `${data.stats.seated_guests} гостей успешно рассажены`,
        });
        onOptimizationApplied();
      } else {
        toast({
          title: "Оптимизация завершена",
          description: `Найден оптимальный вариант для ${data.stats.seated_guests} гостей`,
        });
      }
    } catch (error) {
      console.error("Optimization error:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось выполнить оптимизацию",
      });
    } finally {
      setLoading(false);
      setApplying(false);
    }
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getCompatibilityLabel = (score: number) => {
    if (score >= 80) return "Отлично";
    if (score >= 60) return "Хорошо";
    if (score >= 40) return "Средне";
    return "Низко";
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Умная Рассадка
        </CardTitle>
        <CardDescription>
          Автоматическая оптимизация рассадки с учётом предпочтений, конфликтов и совместимости гостей
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => runOptimization(false)}
            disabled={loading || applying}
            variant="outline"
            className="flex-1 min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Анализ...
              </>
            ) : (
              <>
                <BarChart3 className="w-4 h-4 mr-2" />
                Предварительный анализ
              </>
            )}
          </Button>

          <Button
            onClick={() => runOptimization(true)}
            disabled={loading || applying}
            className="flex-1 min-w-[200px]"
          >
            {applying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Применение...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Оптимизировать и применить
              </>
            )}
          </Button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-lg p-4 border text-center">
                <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                <div className="text-2xl font-bold">{result.stats.seated_guests}</div>
                <div className="text-xs text-muted-foreground">из {result.stats.total_guests} гостей</div>
              </div>

              <div className="bg-background rounded-lg p-4 border text-center">
                <Heart className="w-8 h-8 mx-auto text-pink-500 mb-2" />
                <div className="text-2xl font-bold">{result.stats.preference_matches}</div>
                <div className="text-xs text-muted-foreground">совпадений пожеланий</div>
              </div>

              <div className="bg-background rounded-lg p-4 border text-center">
                <AlertTriangle className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                <div className="text-2xl font-bold">{result.stats.conflict_count}</div>
                <div className="text-xs text-muted-foreground">конфликтов</div>
              </div>

              <div className="bg-background rounded-lg p-4 border text-center">
                <CheckCircle className={`w-8 h-8 mx-auto mb-2 ${getCompatibilityColor(result.stats.average_compatibility)}`} />
                <div className="text-2xl font-bold">{result.stats.average_compatibility}%</div>
                <div className="text-xs text-muted-foreground">совместимость</div>
              </div>
            </div>

            {/* Compatibility Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Общая совместимость</span>
                <span className={getCompatibilityColor(result.stats.average_compatibility)}>
                  {getCompatibilityLabel(result.stats.average_compatibility)}
                </span>
              </div>
              <Progress 
                value={result.stats.average_compatibility} 
                className="h-3"
              />
            </div>

            <Separator />

            {/* Conflicts Warning */}
            {result.conflicts.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="w-5 h-5" />
                  Обнаружены конфликты ({result.conflicts.length})
                </h4>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {result.conflicts.map((conflict, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm"
                      >
                        <Badge variant="destructive" className="shrink-0">Конфликт</Badge>
                        <span>{conflict.guest1} ↔ {conflict.guest2}</span>
                        <span className="text-muted-foreground">— {conflict.reason}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* No Conflicts Success */}
            {result.conflicts.length === 0 && result.stats.seated_guests > 0 && (
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span>Отлично! Все гости рассажены без конфликтов</span>
              </div>
            )}

            {/* Unseated Guests Warning */}
            {result.stats.total_guests > result.stats.seated_guests && (
              <div className="flex items-center gap-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-700 dark:text-orange-300">
                <AlertTriangle className="w-5 h-5" />
                <span>
                  {result.stats.total_guests - result.stats.seated_guests} гостей не удалось рассадить. 
                  Добавьте больше столов или увеличьте вместимость.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Нажмите "Предварительный анализ" чтобы увидеть рекомендации</p>
            <p className="text-sm mt-2">
              Или "Оптимизировать и применить" для автоматической рассадки
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
