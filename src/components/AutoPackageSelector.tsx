/**
 * AutoPackageSelector - UI компонент для автоподбора комплекта вендоров
 */

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { 
  Sparkles, 
  Wand2, 
  Star, 
  MapPin, 
  Check, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Users,
  Camera,
  Music,
  Utensils,
  Building2,
  Flower2,
  Car,
  Palette,
  Scissors,
  RefreshCw,
  ArrowRight,
  CircleDollarSign,
  Trophy,
  Scale
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  AutoPackageService, 
  type PackageConfig, 
  type AutoPackageResult,
  type PackageVendorResult 
} from "@/services/AutoPackageService";
import type { Database } from "@/integrations/supabase/types";

type VendorCategory = Database["public"]["Enums"]["vendor_category"];

interface AutoPackageSelectorProps {
  weddingPlanId: string;
  initialBudget?: number;
  onPackageSelected?: (result: AutoPackageResult) => void;
}

const CATEGORY_CONFIG: Record<VendorCategory, { icon: React.ReactNode; label: string; required: boolean }> = {
  venue: { icon: <Building2 className="h-4 w-4" />, label: "Площадка (Тойхона)", required: true },
  caterer: { icon: <Utensils className="h-4 w-4" />, label: "Кейтеринг", required: true },
  photographer: { icon: <Camera className="h-4 w-4" />, label: "Фотограф", required: true },
  videographer: { icon: <Camera className="h-4 w-4" />, label: "Видеограф", required: false },
  music: { icon: <Music className="h-4 w-4" />, label: "Музыка / DJ", required: true },
  decorator: { icon: <Palette className="h-4 w-4" />, label: "Декоратор", required: false },
  florist: { icon: <Flower2 className="h-4 w-4" />, label: "Флорист", required: false },
  makeup: { icon: <Scissors className="h-4 w-4" />, label: "Визажист", required: false },
  transport: { icon: <Car className="h-4 w-4" />, label: "Транспорт", required: false },
  clothing: { icon: <Scissors className="h-4 w-4" />, label: "Наряды", required: false },
  other: { icon: <Star className="h-4 w-4" />, label: "Другое", required: false },
};

const OPTIMIZATION_MODES = [
  { 
    id: 'budget' as const, 
    label: 'Экономия', 
    icon: <CircleDollarSign className="h-5 w-5" />,
    description: 'Максимальная экономия при сохранении качества'
  },
  { 
    id: 'balanced' as const, 
    label: 'Баланс', 
    icon: <Scale className="h-5 w-5" />,
    description: 'Оптимальное соотношение цены и качества'
  },
  { 
    id: 'quality' as const, 
    label: 'Премиум', 
    icon: <Trophy className="h-5 w-5" />,
    description: 'Лучшие вендоры без ограничений'
  },
];

export function AutoPackageSelector({ 
  weddingPlanId, 
  initialBudget,
  onPackageSelected 
}: AutoPackageSelectorProps) {
  const navigate = useNavigate();
  
  // Состояние конфигурации
  const [budget, setBudget] = useState(initialBudget || 100000000);
  const [optimizationMode, setOptimizationMode] = useState<'budget' | 'quality' | 'balanced'>('balanced');
  const [requiredCategories, setRequiredCategories] = useState<VendorCategory[]>([
    'venue', 'caterer', 'photographer', 'music'
  ]);
  const [optionalCategories, setOptionalCategories] = useState<VendorCategory[]>([
    'videographer', 'decorator', 'florist'
  ]);
  
  // Специальные требования
  const [requirements, setRequirements] = useState({
    mustHaveDrone: false,
    mustHaveSDE: false,
    mustHaveParking: false,
    mustHaveOutdoor: false,
    mustHaveHalal: false,
    mustHave3DVisualization: false,
  });
  
  // Результат подбора
  const [result, setResult] = useState<AutoPackageResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedVendors, setExpandedVendors] = useState<Set<string>>(new Set());

  // Загрузка начального бюджета из плана свадьбы
  useEffect(() => {
    const loadWeddingPlan = async () => {
      const { data } = await supabase
        .from("wedding_plans")
        .select("budget_total")
        .eq("id", weddingPlanId)
        .maybeSingle();
      
      if (data?.budget_total) {
        setBudget(Number(data.budget_total));
      }
    };
    
    if (!initialBudget) {
      loadWeddingPlan();
    }
  }, [weddingPlanId, initialBudget]);

  // Выполнение подбора
  const runAutoPackage = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const config: PackageConfig = {
        weddingPlanId,
        optimizationMode,
        requiredCategories,
        optionalCategories,
        maxBudget: budget,
        minMatchScore: 30,
        requirements,
      };
      
      const service = new AutoPackageService(config);
      const packageResult = await service.findOptimalPackage();
      
      setResult(packageResult);
      
      if (packageResult.success) {
        toast.success(`Подобран комплект из ${packageResult.vendors.length} вендоров!`);
        onPackageSelected?.(packageResult);
      } else {
        toast.error(packageResult.warnings[0] || "Не удалось подобрать комплект");
      }
    } catch (error) {
      console.error("Auto package error:", error);
      toast.error("Ошибка при подборе комплекта");
    } finally {
      setIsLoading(false);
    }
  }, [weddingPlanId, optimizationMode, requiredCategories, optionalCategories, budget, requirements, onPackageSelected]);

  // Toggle категории
  const toggleCategory = (category: VendorCategory, isRequired: boolean) => {
    if (isRequired) {
      setRequiredCategories(prev => 
        prev.includes(category) 
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    } else {
      setOptionalCategories(prev => 
        prev.includes(category) 
          ? prev.filter(c => c !== category)
          : [...prev, category]
      );
    }
  };

  // Toggle развёрнутый вендор
  const toggleVendorExpanded = (vendorId: string) => {
    setExpandedVendors(prev => {
      const next = new Set(prev);
      if (next.has(vendorId)) {
        next.delete(vendorId);
      } else {
        next.add(vendorId);
      }
      return next;
    });
  };

  // Форматирование цены
  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн`;
    }
    if (price >= 1000) {
      return `${Math.round(price / 1000)} тыс`;
    }
    return `${price}`;
  };

  // Получить цвет для score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Автоподбор комплекта вендоров</CardTitle>
              <CardDescription>
                AI подберёт оптимальную команду для вашей свадьбы
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Левая колонка - Настройки */}
        <div className="lg:col-span-1 space-y-4">
          {/* Бюджет */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Бюджет
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-2xl font-bold text-primary">
                {formatPrice(budget)} сум
              </div>
              <Slider
                value={[budget]}
                onValueChange={([val]) => setBudget(val)}
                min={20000000}
                max={500000000}
                step={5000000}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20 млн</span>
                <span>500 млн</span>
              </div>
            </CardContent>
          </Card>

          {/* Режим оптимизации */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Режим оптимизации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {OPTIMIZATION_MODES.map((mode) => (
                <div
                  key={mode.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    optimizationMode === mode.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  }`}
                  onClick={() => setOptimizationMode(mode.id)}
                >
                  <div className="flex items-center gap-2">
                    <div className={optimizationMode === mode.id ? 'text-primary' : 'text-muted-foreground'}>
                      {mode.icon}
                    </div>
                    <span className="font-medium">{mode.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mode.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Категории */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Категории услуг</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Обязательные</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(CATEGORY_CONFIG) as [VendorCategory, typeof CATEGORY_CONFIG[VendorCategory]][])
                    .filter(([cat, config]) => config.required || requiredCategories.includes(cat))
                    .slice(0, 6)
                    .map(([category, config]) => (
                      <Badge
                        key={category}
                        variant={requiredCategories.includes(category) ? "default" : "outline"}
                        className="cursor-pointer gap-1"
                        onClick={() => toggleCategory(category, true)}
                      >
                        {config.icon}
                        {config.label.split(" ")[0]}
                      </Badge>
                    ))}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">Дополнительные</Label>
                <div className="flex flex-wrap gap-2">
                  {(Object.entries(CATEGORY_CONFIG) as [VendorCategory, typeof CATEGORY_CONFIG[VendorCategory]][])
                    .filter(([, config]) => !config.required)
                    .map(([category, config]) => (
                      <Badge
                        key={category}
                        variant={optionalCategories.includes(category) ? "secondary" : "outline"}
                        className="cursor-pointer gap-1"
                        onClick={() => toggleCategory(category, false)}
                      >
                        {config.icon}
                        {config.label.split(" ")[0]}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Специальные требования */}
          <Collapsible>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 rounded-t-lg">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>Специальные требования</span>
                    <ChevronDown className="h-4 w-4" />
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="drone" className="text-sm">Дрон для съёмки</Label>
                    <Switch
                      id="drone"
                      checked={requirements.mustHaveDrone}
                      onCheckedChange={(val) => setRequirements(prev => ({ ...prev, mustHaveDrone: val }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sde" className="text-sm">Монтаж в день свадьбы</Label>
                    <Switch
                      id="sde"
                      checked={requirements.mustHaveSDE}
                      onCheckedChange={(val) => setRequirements(prev => ({ ...prev, mustHaveSDE: val }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="parking" className="text-sm">Парковка обязательна</Label>
                    <Switch
                      id="parking"
                      checked={requirements.mustHaveParking}
                      onCheckedChange={(val) => setRequirements(prev => ({ ...prev, mustHaveParking: val }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="outdoor" className="text-sm">Открытое пространство</Label>
                    <Switch
                      id="outdoor"
                      checked={requirements.mustHaveOutdoor}
                      onCheckedChange={(val) => setRequirements(prev => ({ ...prev, mustHaveOutdoor: val }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="halal" className="text-sm">Халяль меню</Label>
                    <Switch
                      id="halal"
                      checked={requirements.mustHaveHalal}
                      onCheckedChange={(val) => setRequirements(prev => ({ ...prev, mustHaveHalal: val }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="3d" className="text-sm">3D визуализация</Label>
                    <Switch
                      id="3d"
                      checked={requirements.mustHave3DVisualization}
                      onCheckedChange={(val) => setRequirements(prev => ({ ...prev, mustHave3DVisualization: val }))}
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Кнопка запуска */}
          <Button 
            onClick={runAutoPackage} 
            disabled={isLoading}
            className="w-full h-12 text-lg gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Подбираем...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Подобрать комплект
              </>
            )}
          </Button>
        </div>

        {/* Правая колонка - Результаты */}
        <div className="lg:col-span-2">
          {result ? (
            <div className="space-y-4">
              {/* Сводка */}
              <Card className={result.success ? "border-green-500/30 bg-green-50/50 dark:bg-green-950/20" : "border-destructive/30"}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {result.vendors.length}
                      </div>
                      <div className="text-sm text-muted-foreground">Вендоров</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {formatPrice(result.totalPrice)} сум
                      </div>
                      <div className="text-sm text-muted-foreground">Общая стоимость</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(result.averageMatchScore)}`}>
                        {result.averageMatchScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Совпадение</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {result.budgetUsedPercent}%
                      </div>
                      <div className="text-sm text-muted-foreground">Бюджета</div>
                    </div>
                  </div>
                  <Progress value={result.budgetUsedPercent} className="mt-4" />
                </CardContent>
              </Card>

              {/* Предупреждения */}
              {result.warnings.length > 0 && (
                <Card className="border-yellow-500/30 bg-yellow-50/50 dark:bg-yellow-950/20">
                  <CardContent className="pt-4">
                    {result.warnings.map((warning, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Список вендоров */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {result.vendors.map((vendorResult) => (
                    <VendorResultCard
                      key={vendorResult.vendor.id}
                      vendorResult={vendorResult}
                      isExpanded={expandedVendors.has(vendorResult.vendor.id)}
                      onToggle={() => toggleVendorExpanded(vendorResult.vendor.id)}
                      onViewDetails={() => navigate(`/vendor/${vendorResult.vendor.id}`)}
                      formatPrice={formatPrice}
                      getScoreColor={getScoreColor}
                    />
                  ))}
                </div>
              </ScrollArea>

              {/* Рекомендации */}
              {result.suggestions.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Рекомендации
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            // Пустое состояние
            <Card className="h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Настройте параметры и запустите подбор</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Укажите бюджет, выберите нужные категории и требования. 
                  AI подберёт оптимальную команду вендоров для вашей свадьбы.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Карточка вендора в результатах
 */
interface VendorResultCardProps {
  vendorResult: PackageVendorResult;
  isExpanded: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
  formatPrice: (price: number) => string;
  getScoreColor: (score: number) => string;
}

function VendorResultCard({ 
  vendorResult, 
  isExpanded, 
  onToggle, 
  onViewDetails,
  formatPrice,
  getScoreColor 
}: VendorResultCardProps) {
  const { vendor, matchResult, selectedPackage, estimatedPrice, isOptional } = vendorResult;
  const categoryConfig = CATEGORY_CONFIG[vendor.category as VendorCategory];

  return (
    <Card className={isOptional ? "opacity-80" : ""}>
      <div 
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start gap-3">
          {/* Иконка категории */}
          <div className="p-2 bg-primary/10 rounded-lg shrink-0">
            {categoryConfig?.icon || <Star className="h-4 w-4" />}
          </div>

          {/* Основная информация */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold truncate">{vendor.business_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {categoryConfig?.label || vendor.category}
                  {isOptional && <Badge variant="outline" className="ml-2 text-xs">Доп.</Badge>}
                </p>
              </div>
              
              <div className="text-right shrink-0">
                <div className="font-bold">{formatPrice(estimatedPrice)} сум</div>
                <div className={`text-sm font-medium ${getScoreColor(matchResult.matchScore)}`}>
                  {matchResult.matchScore}% совпадение
                </div>
              </div>
            </div>

            {/* Мета информация */}
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {vendor.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {Number(vendor.rating).toFixed(1)}
                </span>
              )}
              {vendor.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {vendor.location}
                </span>
              )}
              {vendor.verified && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Check className="h-3 w-3" />
                  Проверен
                </Badge>
              )}
            </div>

            {/* Выбранный пакет */}
            {selectedPackage && (
              <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium">Пакет: {selectedPackage.name}</div>
                {selectedPackage.includes.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedPackage.includes.slice(0, 3).join(" • ")}
                    {selectedPackage.includes.length > 3 && ` +${selectedPackage.includes.length - 3}`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Стрелка раскрытия */}
          <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Развёрнутый контент */}
      {isExpanded && (
        <CardContent className="pt-0 border-t">
          <div className="space-y-3 pt-3">
            {/* Причины совпадения */}
            <div>
              <Label className="text-xs text-muted-foreground">Почему подходит:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {matchResult.reasons.slice(0, 5).map((reason, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    +{reason.score} {reason.description}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category Scores */}
            {matchResult.categoryScores && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">{matchResult.categoryScores.style}</div>
                  <div className="text-muted-foreground">Стиль</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">{matchResult.categoryScores.rating}</div>
                  <div className="text-muted-foreground">Рейтинг</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-medium">{matchResult.categoryScores.budget}</div>
                  <div className="text-muted-foreground">Бюджет</div>
                </div>
              </div>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              className="w-full gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              Подробнее
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default AutoPackageSelector;
