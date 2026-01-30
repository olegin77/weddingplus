import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, Save, Wallet, Users, UtensilsCrossed,
  Gift, Gem, Shirt
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWeddingPlanId } from "@/hooks/useWeddingPlanId";
import { cn } from "@/lib/utils";

// Uzbek traditional budget categories
const TRADITIONAL_CATEGORIES = [
  {
    id: "kalym",
    name: "Калым",
    description: "Выкуп за невесту (традиционный)",
    icon: Gem,
    side: "groom",
    color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  {
    id: "sarpo",
    name: "Сарпо",
    description: "Подарки семье невесты (одежда, украшения)",
    icon: Shirt,
    side: "groom",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "peshona",
    name: "Пешона",
    description: "Дары от семьи невесты жениху",
    icon: Gift,
    side: "bride",
    color: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
  },
];

// Plov calculator constants
const PLOV_COST_PER_PERSON = 25000; // UZS per person
const PLOV_RICE_KG_PER_PERSON = 0.25;
const PLOV_MEAT_KG_PER_PERSON = 0.2;
const PLOV_CARROT_KG_PER_PERSON = 0.15;

export function TraditionalBudget() {
  const queryClient = useQueryClient();
  const { weddingPlanId, isLoading: planLoading } = useWeddingPlanId();

  const [formData, setFormData] = useState({
    kalym_amount: 0,
    sarpo_amount: 0,
    peshona_amount: 0,
    groom_side_budget: 0,
    bride_side_budget: 0,
  });

  const [plovGuests, setPlovGuests] = useState(300);

  // Fetch wedding plan data
  const { data: weddingPlan, isLoading } = useQuery({
    queryKey: ["wedding-plan-traditional", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return null;
      const { data, error } = await supabase
        .from("wedding_plans")
        .select("kalym_amount, sarpo_amount, peshona_amount, groom_side_budget, bride_side_budget, estimated_guests")
        .eq("id", weddingPlanId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!weddingPlanId,
  });

  // Initialize form with fetched data
  useEffect(() => {
    if (weddingPlan) {
      setFormData({
        kalym_amount: weddingPlan.kalym_amount || 0,
        sarpo_amount: weddingPlan.sarpo_amount || 0,
        peshona_amount: weddingPlan.peshona_amount || 0,
        groom_side_budget: weddingPlan.groom_side_budget || 0,
        bride_side_budget: weddingPlan.bride_side_budget || 0,
      });
      setPlovGuests(weddingPlan.estimated_guests || 300);
    }
  }, [weddingPlan]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!weddingPlanId) throw new Error("No wedding plan");

      const { error } = await supabase
        .from("wedding_plans")
        .update({
          kalym_amount: formData.kalym_amount,
          sarpo_amount: formData.sarpo_amount,
          peshona_amount: formData.peshona_amount,
          groom_side_budget: formData.groom_side_budget,
          bride_side_budget: formData.bride_side_budget,
        })
        .eq("id", weddingPlanId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Данные сохранены");
      queryClient.invalidateQueries({ queryKey: ["wedding-plan-traditional"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ошибка сохранения");
    },
  });

  // Calculate totals
  const groomTotal = formData.kalym_amount + formData.sarpo_amount + formData.groom_side_budget;
  const brideTotal = formData.peshona_amount + formData.bride_side_budget;
  const grandTotal = groomTotal + brideTotal;

  // Plov calculator
  const plovCost = plovGuests * PLOV_COST_PER_PERSON;
  const plovRice = plovGuests * PLOV_RICE_KG_PER_PERSON;
  const plovMeat = plovGuests * PLOV_MEAT_KG_PER_PERSON;
  const plovCarrot = plovGuests * PLOV_CARROT_KG_PER_PERSON;

  if (planLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Traditional Categories */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-primary" />
            Традиционные расходы
          </CardTitle>
          <CardDescription>
            Калым, сарпо и пешона — традиционные элементы узбекской свадьбы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {TRADITIONAL_CATEGORIES.map((category) => {
            const Icon = category.icon;
            const fieldKey = `${category.id}_amount` as keyof typeof formData;
            
            return (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", category.color.split(" ")[0])}>
                      <Icon className={cn("w-5 h-5", category.color.split(" ").slice(1).join(" "))} />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {category.side === "groom" ? "Сторона жениха" : "Сторона невесты"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData[fieldKey]}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [fieldKey]: parseFloat(e.target.value) || 0,
                    }))}
                    className="max-w-[200px]"
                  />
                  <span className="text-muted-foreground">сум</span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Side Budgets */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Бюджет стороны жениха
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Общий бюджет (без калыма и сарпо)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.groom_side_budget}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    groom_side_budget: parseFloat(e.target.value) || 0,
                  }))}
                />
                <span className="text-muted-foreground whitespace-nowrap">сум</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Калым</span>
              <span>{formData.kalym_amount.toLocaleString()} сум</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Сарпо</span>
              <span>{formData.sarpo_amount.toLocaleString()} сум</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Прочие расходы</span>
              <span>{formData.groom_side_budget.toLocaleString()} сум</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Итого</span>
              <span className="text-primary">{groomTotal.toLocaleString()} сум</span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Бюджет стороны невесты
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Общий бюджет (без пешоны)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={formData.bride_side_budget}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    bride_side_budget: parseFloat(e.target.value) || 0,
                  }))}
                />
                <span className="text-muted-foreground whitespace-nowrap">сум</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Пешона</span>
              <span>{formData.peshona_amount.toLocaleString()} сум</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Прочие расходы</span>
              <span>{formData.bride_side_budget.toLocaleString()} сум</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Итого</span>
              <span className="text-primary">{brideTotal.toLocaleString()} сум</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grand Total */}
      <Card className="glass-card border-primary/20 bg-primary/5">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-primary" />
            <div>
              <p className="font-medium">Общий семейный бюджет</p>
              <p className="text-sm text-muted-foreground">Сумма расходов обеих сторон</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-primary">{grandTotal.toLocaleString()} сум</p>
        </CardContent>
      </Card>

      {/* Plov Calculator */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-primary" />
            Калькулятор плова (Nahorgi Osh)
          </CardTitle>
          <CardDescription>
            Расчет продуктов и стоимости для утреннего плова
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Количество гостей</Label>
            <Input
              type="number"
              value={plovGuests}
              onChange={(e) => setPlovGuests(parseInt(e.target.value) || 0)}
              className="max-w-[200px]"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Рис</p>
              <p className="text-lg font-bold">{plovRice.toFixed(0)} кг</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Мясо</p>
              <p className="text-lg font-bold">{plovMeat.toFixed(0)} кг</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Морковь</p>
              <p className="text-lg font-bold">{plovCarrot.toFixed(0)} кг</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-sm text-muted-foreground">Примерная стоимость</p>
              <p className="text-lg font-bold text-primary">{plovCost.toLocaleString()} сум</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            * Расчет основан на средних показателях: {PLOV_COST_PER_PERSON.toLocaleString()} сум/чел, 
            {PLOV_RICE_KG_PER_PERSON} кг риса, {PLOV_MEAT_KG_PER_PERSON} кг мяса на человека
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="w-full btn-gradient"
      >
        {saveMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Сохранить
      </Button>
    </div>
  );
}
