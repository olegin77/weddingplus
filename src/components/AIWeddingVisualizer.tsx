import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Image as ImageIcon, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Visualization {
  id: string;
  style: string;
  image_url: string;
  created_at: string;
  quality: string;
}

const WEDDING_STYLES = [
  { value: "traditional", label: "🎊 Традиционная узбекская", description: "Национальные орнаменты и декор" },
  { value: "modern", label: "✨ Современная", description: "Минималистичный элегантный стиль" },
  { value: "royal", label: "👑 Королевская", description: "Роскошь и величие дворца" },
  { value: "garden", label: "🌸 Садовая", description: "Природа и цветы на открытом воздухе" },
  { value: "romantic", label: "💕 Романтическая", description: "Сказочная атмосфера и мягкий свет" },
  { value: "rustic", label: "🌾 Рустик", description: "Уютная загородная свадьба" },
];

const QUALITY_OPTIONS = [
  { value: "low", label: "Быстрая (низкое качество)" },
  { value: "medium", label: "Средняя (рекомендуется)" },
  { value: "high", label: "Высокая (медленнее)" },
];

export function AIWeddingVisualizer({ weddingPlanId }: { weddingPlanId: string }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [style, setStyle] = useState("modern");
  const [quality, setQuality] = useState("medium");
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisualizations();
  }, [weddingPlanId]);

  const fetchVisualizations = async () => {
    try {
      const { data, error } = await supabase
        .from("wedding_visualizations")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVisualizations(data || []);
    } catch (error) {
      console.error("Error fetching visualizations:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить визуализации",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!style) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите стиль свадьбы",
      });
      return;
    }

    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-wedding-visualization", {
        body: { weddingPlanId, style, quality },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast({
            variant: "destructive",
            title: "Превышен лимит",
            description: "Слишком много запросов. Попробуйте позже.",
          });
        } else if (data.error.includes("Payment required")) {
          toast({
            variant: "destructive",
            title: "Требуется оплата",
            description: "Пополните баланс в настройках.",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast({
        title: "Готово! 🎉",
        description: "Визуализация свадьбы создана",
      });

      fetchVisualizations();
    } catch (error) {
      console.error("Error generating visualization:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать визуализацию",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_visualizations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Визуализация удалена",
      });

      fetchVisualizations();
    } catch (error) {
      console.error("Error deleting visualization:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить визуализацию",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Визуализатор Свадьбы
          </CardTitle>
          <CardDescription>
            Увидьте свою свадьбу до того, как она состоится! Выберите стиль и получите
            реалистичную визуализацию с помощью искусственного интеллекта.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              🎨 AI создаст уникальную визуализацию свадьбы в выбранном стиле
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="style">Стиль свадьбы</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEDDING_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      <div>
                        <div className="font-medium">{s.label}</div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quality">Качество</Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {QUALITY_OPTIONS.map((q) => (
                    <SelectItem key={q.value} value={q.value}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создаём визуализацию...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Создать визуализацию
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      {visualizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Галерея ({visualizations.length})
            </CardTitle>
            <CardDescription>Ваши сгенерированные визуализации</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {visualizations.map((viz) => (
                <div key={viz.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={viz.image_url}
                      alt={`${viz.style} wedding visualization`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(viz.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium capitalize">{viz.style}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(viz.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
