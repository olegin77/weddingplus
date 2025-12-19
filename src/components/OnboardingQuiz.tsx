import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, Users, Wallet, Heart, Camera, Utensils, Music, Palette, MapPin, ArrowRight, ArrowLeft, Check, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const weddingStyles = [
  {
    id: "classic",
    name: "Классический",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    description: "Элегантность и традиции"
  },
  {
    id: "modern",
    name: "Современный",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
    description: "Минимализм и стиль"
  },
  {
    id: "rustic",
    name: "Рустик",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop",
    description: "Природа и уют"
  },
  {
    id: "bohemian",
    name: "Бохо",
    image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop",
    description: "Свобода и творчество"
  },
  {
    id: "glamorous",
    name: "Гламурный",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
    description: "Роскошь и блеск"
  },
  {
    id: "garden",
    name: "Садовая",
    image: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&h=300&fit=crop",
    description: "На природе, цветы"
  },
  {
    id: "minimalist",
    name: "Минимализм",
    image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=300&fit=crop",
    description: "Простота и изящество"
  },
  {
    id: "romantic",
    name: "Романтичный",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop",
    description: "Нежность и любовь"
  }
];

const priorityOptions = [
  { id: "photography", label: "Фотография", icon: Camera, description: "Качество съёмки" },
  { id: "catering", label: "Кейтеринг", icon: Utensils, description: "Еда и напитки" },
  { id: "entertainment", label: "Развлечения", icon: Music, description: "Музыка и шоу" },
  { id: "decoration", label: "Декор", icon: Palette, description: "Оформление" }
];

const locations = [
  "Ташкент", "Самарканд", "Бухара", "Хива", "Нукус", "Фергана", "Андижан", "Наманган", "Карши", "Навои"
];

const schema = z.object({
  budget_total: z.number().min(5000000, "Минимальный бюджет 5,000,000 сум"),
  estimated_guests: z.number().min(10, "Минимум 10 гостей").max(1000, "Максимум 1000 гостей"),
  wedding_date: z.string().optional(),
  venue_location: z.string().min(2, "Укажите город"),
  style_preferences: z.array(z.string()).min(1, "Выберите хотя бы один стиль"),
  priorities: z.object({
    photography: z.enum(["low", "medium", "high"]),
    catering: z.enum(["low", "medium", "high"]),
    entertainment: z.enum(["low", "medium", "high"]),
    decoration: z.enum(["low", "medium", "high"])
  })
});

type OnboardingFormData = z.infer<typeof schema>;

interface OnboardingQuizProps {
  onComplete: (weddingPlanId: string) => void;
}

export const OnboardingQuiz = ({ onComplete }: OnboardingQuizProps) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<{
    photography: "low" | "medium" | "high";
    catering: "low" | "medium" | "high";
    entertainment: "low" | "medium" | "high";
    decoration: "low" | "medium" | "high";
  }>({
    photography: "medium",
    catering: "medium",
    entertainment: "medium",
    decoration: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      budget_total: 50000000,
      estimated_guests: 100,
      venue_location: "",
      style_preferences: [],
      priorities: {
        photography: "medium",
        catering: "medium",
        entertainment: "medium",
        decoration: "medium"
      }
    }
  });

  const budget = watch("budget_total");
  const guests = watch("estimated_guests");
  const location = watch("venue_location");

  const toggleStyle = (styleId: string) => {
    const newStyles = selectedStyles.includes(styleId)
      ? selectedStyles.filter(s => s !== styleId)
      : [...selectedStyles, styleId];
    setSelectedStyles(newStyles);
    setValue("style_preferences", newStyles);
  };

  const updatePriority = (key: keyof typeof priorities, value: number) => {
    const level = (value <= 2 ? "low" : value <= 3 ? "medium" : "high") as "low" | "medium" | "high";
    const newPriorities = { ...priorities, [key]: level };
    setPriorities(newPriorities);
    setValue("priorities", newPriorities);
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Необходимо войти в систему");
        return;
      }

      const { data: weddingPlan, error } = await supabase
        .from("wedding_plans")
        .insert({
          couple_user_id: user.id,
          budget_total: data.budget_total,
          estimated_guests: data.estimated_guests,
          wedding_date: data.wedding_date || null,
          venue_location: data.venue_location,
          style_preferences: data.style_preferences,
          priorities: data.priorities,
          theme: data.style_preferences[0] || null
        })
        .select()
        .single();

      if (error) throw error;

      toast.success("План свадьбы создан! Подбираем идеальных специалистов...");
      onComplete(weddingPlan.id);
    } catch (error: any) {
      console.error("Error creating wedding plan:", error);
      toast.error("Ошибка при создании плана");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat("ru-RU").format(value) + " сум";
  };

  const canProceed = () => {
    switch (step) {
      case 1: return budget >= 5000000 && guests >= 10;
      case 2: return location.length >= 2;
      case 3: return selectedStyles.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Бюджет и гости</h2>
              <p className="text-muted-foreground">Это поможет подобрать подходящих исполнителей</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base">
                  <Wallet className="w-4 h-4" />
                  Общий бюджет
                </Label>
                <div className="text-center py-2">
                  <span className="text-3xl font-bold text-primary">{formatBudget(budget || 50000000)}</span>
                </div>
                <Slider
                  value={[budget || 50000000]}
                  onValueChange={(value) => setValue("budget_total", value[0])}
                  min={5000000}
                  max={500000000}
                  step={5000000}
                  className="py-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 млн</span>
                  <span>500 млн</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[50000000, 100000000, 200000000].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={budget === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => setValue("budget_total", preset)}
                    >
                      {new Intl.NumberFormat("ru-RU", { notation: "compact" }).format(preset)}
                    </Button>
                  ))}
                </div>
                {errors.budget_total && (
                  <p className="text-sm text-destructive">{errors.budget_total.message}</p>
                )}
              </div>

              <div className="space-y-4">
                <Label className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4" />
                  Количество гостей
                </Label>
                <div className="text-center py-2">
                  <span className="text-3xl font-bold text-primary">{guests || 100} гостей</span>
                </div>
                <Slider
                  value={[guests || 100]}
                  onValueChange={(value) => setValue("estimated_guests", value[0])}
                  min={10}
                  max={500}
                  step={10}
                  className="py-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>10</span>
                  <span>500+</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 300].map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={guests === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => setValue("estimated_guests", preset)}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
                {errors.estimated_guests && (
                  <p className="text-sm text-destructive">{errors.estimated_guests.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Где будет свадьба?</h2>
              <p className="text-muted-foreground">Выберите город проведения</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {locations.map((loc) => (
                  <Button
                    key={loc}
                    type="button"
                    variant={location === loc ? "default" : "outline"}
                    className="h-12 justify-start"
                    onClick={() => setValue("venue_location", loc)}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    {loc}
                  </Button>
                ))}
              </div>

              <div className="pt-4">
                <Label>Или укажите другой город</Label>
                <Input
                  placeholder="Введите название города"
                  value={location}
                  onChange={(e) => setValue("venue_location", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="pt-4">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Дата свадьбы (опционально)
                </Label>
                <Input
                  type="date"
                  {...register("wedding_date")}
                  className="mt-2"
                />
              </div>
              {errors.venue_location && (
                <p className="text-sm text-destructive">{errors.venue_location.message}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Какой стиль вам нравится?</h2>
              <p className="text-muted-foreground">Выберите один или несколько стилей</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {weddingStyles.map((style) => {
                const isSelected = selectedStyles.includes(style.id);
                return (
                  <Card
                    key={style.id}
                    className={cn(
                      "cursor-pointer transition-all overflow-hidden hover:shadow-lg",
                      isSelected && "ring-2 ring-primary"
                    )}
                    onClick={() => toggleStyle(style.id)}
                  >
                    <div className="relative h-24">
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-5 h-5 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm">{style.name}</h3>
                      <p className="text-xs text-muted-foreground">{style.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {errors.style_preferences && (
              <p className="text-sm text-destructive text-center">{errors.style_preferences.message}</p>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Что для вас важнее всего?</h2>
              <p className="text-muted-foreground">Настройте приоритеты для рекомендаций</p>
            </div>

            <div className="space-y-6">
              {priorityOptions.map((option) => {
                const Icon = option.icon;
                const value = priorities[option.id as keyof typeof priorities];
                const numValue = value === "low" ? 1 : value === "medium" ? 3 : 5;

                return (
                  <div key={option.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Icon className="w-5 h-5 text-secondary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {value === "low" ? "Низкий" : value === "medium" ? "Средний" : "Высокий"}
                      </span>
                    </div>
                    <Slider
                      value={[numValue]}
                      onValueChange={(vals) => updatePriority(option.id as keyof typeof priorities, vals[0])}
                      min={1}
                      max={5}
                      step={1}
                      className="py-2"
                    />
                  </div>
                );
              })}
            </div>

            <Card className="bg-secondary/50">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Ваш профиль:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span>{formatBudget(budget || 0)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{guests} гостей</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedStyles.length} стилей</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    i < step ? "bg-primary w-8" : i === step - 1 ? "bg-primary w-8" : "bg-secondary w-2"
                  )}
                />
              ))}
            </div>
            <CardDescription>
              Шаг {step} из {totalSteps}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {renderStep()}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Назад
                </Button>
              )}

              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="flex-1"
                >
                  Далее
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Создаём план..." : "Начать планирование"}
                  <Check className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
