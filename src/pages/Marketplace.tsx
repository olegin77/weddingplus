import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Star, MapPin, Heart, SlidersHorizontal, ChevronLeft, ChevronRight, Sparkles, Users, Wallet, Palette, GitCompare, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MatchScoreBadge } from "@/components/vendor/MatchScoreBadge";
import { ComparisonFloatingBar } from "@/components/vendor/ComparisonFloatingBar";
import { useVendorComparison } from "@/hooks/useVendorComparison";
import { VendorMatchingEngine, type WeddingMatchParams } from "@/lib/matching-engine";
import type { VendorMatchResult } from "@/types/vendor-attributes";
const ITEMS_PER_PAGE = 12;

// Тематические изображения для категорий (надёжные источники)
const CATEGORY_IMAGES: Record<string, string> = {
  photographer: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  videographer: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  decorator: 'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  florist: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  music: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  venue: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  caterer: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  transport: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  makeup: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  clothing: 'https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  other: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
};

// Стили для фильтра
const AVAILABLE_STYLES = [
  'Классический', 'Современный', 'Богемный', 'Минималистичный', 
  'Традиционный', 'Романтичный', 'Гламурный', 'Рустик', 'Винтаж'
];

// Описания для демо-поставщиков
const DEMO_VENDORS = [
  { id: 'demo-1', business_name: 'Royal Palace Venue', category: 'venue', location: 'Ташкент', price_range_min: 15000000, price_range_max: 60000000, rating: 4.8, total_reviews: 124, verified: true, isDemo: true, description: 'Роскошный банкетный зал с панорамными окнами и изысканным интерьером. Вместимость до 500 гостей.', max_guests: 500, min_guests: 100, styles: ['Классический', 'Гламурный'] },
  { id: 'demo-2', business_name: 'Garden Bliss Venue', category: 'venue', location: 'Самарканд', price_range_min: 10000000, price_range_max: 35000000, rating: 4.6, total_reviews: 78, verified: true, isDemo: true, description: 'Живописная площадка с садом и фонтанами. Идеально для романтической свадьбы на природе.', max_guests: 300, min_guests: 50, styles: ['Романтичный', 'Богемный'] },
  { id: 'demo-3', business_name: 'UzPhoto Studio', category: 'photographer', location: 'Ташкент', price_range_min: 5000000, price_range_max: 15000000, rating: 4.9, total_reviews: 210, verified: true, isDemo: true, description: 'Профессиональная свадебная фотография с 10-летним опытом. Создаём незабываемые моменты.', styles: ['Современный', 'Классический'] },
  { id: 'demo-4', business_name: 'Sam Video Pro', category: 'videographer', location: 'Самарканд', price_range_min: 7000000, price_range_max: 18000000, rating: 4.7, total_reviews: 95, verified: true, isDemo: true, description: 'Кинематографичная свадебная видеосъёмка с использованием дронов и современного оборудования.', styles: ['Современный'] },
  { id: 'demo-5', business_name: 'Flora Boutique', category: 'florist', location: 'Бухара', price_range_min: 3000000, price_range_max: 10000000, rating: 4.5, total_reviews: 62, verified: true, isDemo: true, description: 'Свежие цветы и авторские композиции для вашего особенного дня. Доставка по всему Узбекистану.', styles: ['Романтичный', 'Классический'] },
  { id: 'demo-6', business_name: 'Melody Band', category: 'music', location: 'Ташкент', price_range_min: 6000000, price_range_max: 20000000, rating: 4.7, total_reviews: 140, verified: true, isDemo: true, description: 'Живая музыка на любой вкус: от классики до современных хитов. Создаём атмосферу праздника!', styles: ['Современный', 'Традиционный'] },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || "all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [sortBy, setSortBy] = useState<string>("smart");
  const [vendors, setVendors] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Vendor comparison hook
  const {
    comparisonItems,
    addToComparison,
    removeFromComparison,
    isInComparison,
    clearComparison,
    goToComparison,
    canAddToComparison,
    maxVendors,
  } = useVendorComparison();
  
  // Smart Matching фильтры
  const [smartMatchingEnabled, setSmartMatchingEnabled] = useState(false);
  const [weddingParams, setWeddingParams] = useState<WeddingMatchParams | null>(null);
  const [matchResults, setMatchResults] = useState<Map<string, VendorMatchResult>>(new Map());
  const [guestCountFilter, setGuestCountFilter] = useState<number>(0);
  const [selectedStyle, setSelectedStyle] = useState<string>("all");

  // Загрузка параметров свадьбы
  const loadWeddingParams = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: weddingPlan } = await supabase
      .from('wedding_plans')
      .select('*')
      .eq('couple_user_id', user.id)
      .maybeSingle();

    if (weddingPlan) {
      const params = await VendorMatchingEngine.getWeddingParams(weddingPlan.id);
      if (params) {
        setWeddingParams(params);
        setSmartMatchingEnabled(true);
        if (params.guestCount > 0) {
          setGuestCountFilter(params.guestCount);
        }
        if (params.style) {
          setSelectedStyle(params.style);
        }
      }
    }
  }, []);

  // Локальный расчёт match score
  const calculateLocalMatchScore = useCallback((
    vendor: any,
    params: WeddingMatchParams,
    guestCount: number,
    style: string,
    budget: [number, number]
  ): { score: number; reasons: any[]; excluded: boolean; exclusionReason?: any } => {
    const reasons: any[] = [];
    let score = 50; // Базовый score
    
    // Проверка вместимости (Hard Filter)
    const maxGuests = vendor.max_guests || vendor.capacity_max;
    const minGuests = vendor.min_guests || vendor.capacity_min;
    
    if (guestCount > 0) {
      if (maxGuests && maxGuests < guestCount) {
        return {
          score: 0,
          reasons: [],
          excluded: true,
          exclusionReason: {
            filter: 'capacity_exceeded',
            description: `Максимум ${maxGuests} гостей, нужно ${guestCount}`,
            vendorValue: maxGuests,
            requiredValue: guestCount,
          },
        };
      }
      if (minGuests && minGuests > guestCount) {
        return {
          score: 0,
          reasons: [],
          excluded: true,
          exclusionReason: {
            filter: 'min_guests_not_met',
            description: `Минимум ${minGuests} гостей, у вас ${guestCount}`,
            vendorValue: minGuests,
            requiredValue: guestCount,
          },
        };
      }
      
      // Идеальное совпадение вместимости
      if (maxGuests && guestCount <= maxGuests * 0.8) {
        score += 10;
        reasons.push({
          type: 'capacity',
          score: 10,
          description: `Комфортно для ${guestCount} гостей`,
        });
      }
    }
    
    // Проверка стиля
    if (style !== "all" && vendor.styles?.length) {
      if (vendor.styles.includes(style)) {
        score += 20;
        reasons.push({
          type: 'style',
          score: 20,
          description: `Работает в стиле "${style}"`,
        });
      }
    }
    
    // Рейтинг
    if (vendor.rating) {
      const ratingScore = Math.round((vendor.rating / 5) * 15);
      score += ratingScore;
      reasons.push({
        type: 'rating',
        score: ratingScore,
        description: `Рейтинг ${vendor.rating.toFixed(1)}/5`,
      });
    }
    
    // Бюджет
    const vendorMinPrice = vendor.price_range_min || vendor.starting_price || 0;
    if (vendorMinPrice > 0 && budget[1] > 0) {
      if (vendorMinPrice <= budget[1]) {
        score += 10;
        reasons.push({
          type: 'budget',
          score: 10,
          description: 'Вписывается в бюджет',
        });
      }
    }
    
    // Верификация
    if (vendor.verified) {
      score += 5;
      reasons.push({
        type: 'verification',
        score: 5,
        description: 'Проверенный поставщик',
      });
    }
    
    return {
      score: Math.min(100, score),
      reasons,
      excluded: false,
    };
  }, []);

  useEffect(() => {
    fetchVendors();
    fetchFavorites();
    loadWeddingParams();
  }, [loadWeddingParams]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setVendors(DEMO_VENDORS);
      } else {
        setVendors(data);
      }
      
      // Extract unique locations
      const uniqueLocations = Array.from(new Set((data && data.length > 0 ? data : DEMO_VENDORS).map(v => v.location).filter(Boolean))) as string[];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorite_vendors")
        .select("vendor_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.vendor_id) || []));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (vendorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите, чтобы добавлять поставщиков в избранное",
          variant: "destructive",
        });
        return;
      }

      if (favorites.has(vendorId)) {
        const { error } = await supabase
          .from("favorite_vendors")
          .delete()
          .eq("user_id", user.id)
          .eq("vendor_id", vendorId);

        if (error) throw error;
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(vendorId);
          return newSet;
        });

        toast({
          title: "Удалено из избранного",
        });
      } else {
        const { error } = await supabase
          .from("favorite_vendors")
          .insert({ user_id: user.id, vendor_id: vendorId });

        if (error) throw error;
        
        setFavorites(prev => new Set(prev).add(vendorId));

        toast({
          title: "Добавлено в избранное",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive",
      });
    }
  };

  // Вычисление smart matching результатов
  const computeSmartMatching = useCallback(async () => {
    if (!smartMatchingEnabled || !weddingParams) return;

    const results = new Map<string, VendorMatchResult>();
    
    for (const vendor of vendors) {
      if (vendor.isDemo) continue;
      
      // Создаём упрощённый match для демонстрации
      const matchScore = calculateLocalMatchScore(vendor, weddingParams, guestCountFilter, selectedStyle, priceRange);
      
      results.set(vendor.id, {
        vendorId: vendor.id,
        matchScore: matchScore.score,
        reasons: matchScore.reasons,
        excluded: matchScore.excluded,
        exclusionReason: matchScore.exclusionReason,
        availableOnDate: true,
      });
    }
    
    setMatchResults(results);
  }, [vendors, weddingParams, smartMatchingEnabled, guestCountFilter, selectedStyle, priceRange]);

  useEffect(() => {
    computeSmartMatching();
  }, [computeSmartMatching]);

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => {
        const matchesSearch = vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory;
        const matchesLocation = selectedLocation === "all" || vendor.location === selectedLocation;
        const matchesRating = vendor.rating >= minRating;
        const matchesPrice = 
          (vendor.price_range_min || 0) >= priceRange[0] && 
          (vendor.price_range_max || 100000000) <= priceRange[1];
        
        // Smart Matching фильтры
        let matchesCapacity = true;
        if (guestCountFilter > 0 && smartMatchingEnabled) {
          const maxGuests = vendor.max_guests || vendor.capacity_max;
          const minGuests = vendor.min_guests || vendor.capacity_min;
          if (maxGuests && maxGuests < guestCountFilter) {
            matchesCapacity = false;
          }
          if (minGuests && minGuests > guestCountFilter) {
            matchesCapacity = false;
          }
        }
        
        let matchesStyle = true;
        if (selectedStyle !== "all" && smartMatchingEnabled) {
          matchesStyle = vendor.styles?.includes(selectedStyle) || false;
        }
        
        return matchesSearch && matchesCategory && matchesLocation && matchesRating && matchesPrice && matchesCapacity && matchesStyle;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "smart":
            // Сортировка по match score
            const scoreA = matchResults.get(a.id)?.matchScore || 0;
            const scoreB = matchResults.get(b.id)?.matchScore || 0;
            return scoreB - scoreA;
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "price_low":
            return (a.price_range_min || 0) - (b.price_range_min || 0);
          case "price_high":
            return (b.price_range_max || 0) - (a.price_range_max || 0);
          case "name":
            return a.business_name.localeCompare(b.business_name);
          default:
            return 0;
        }
      });
  }, [vendors, searchQuery, selectedCategory, selectedLocation, minRating, priceRange, sortBy, guestCountFilter, selectedStyle, smartMatchingEnabled, matchResults]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLocation, minRating, priceRange, sortBy, guestCountFilter, selectedStyle]);

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="px-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Маркетплейс поставщиков</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Найдите идеальных профессионалов для вашей свадьбы
          </p>
        </div>

        <Card className="border-0 sm:border shadow-none sm:shadow-sm">
          <CardContent className="px-2 sm:px-6 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
            {/* Mobile-optimized search and filter bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск..."
                  className="pl-10 h-10 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                variant={filtersOpen ? "default" : "outline"}
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="h-10 px-3 shrink-0"
                size="icon"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort dropdown - full width on mobile */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                {smartMatchingEnabled && (
                  <SelectItem value="smart">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Умный подбор
                    </span>
                  </SelectItem>
                )}
                <SelectItem value="rating">По рейтингу</SelectItem>
                <SelectItem value="price_low">Цена: низкая</SelectItem>
                <SelectItem value="price_high">Цена: высокая</SelectItem>
                <SelectItem value="name">По названию</SelectItem>
              </SelectContent>
            </Select>

            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleContent className="space-y-3 pt-3 border-t">
                {/* Smart Matching Toggle - mobile optimized */}
                <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <Label className="font-medium text-sm">Умный подбор</Label>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {weddingParams 
                          ? `${weddingParams.guestCount} гостей`
                          : 'Создайте план свадьбы'
                        }
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={smartMatchingEnabled}
                    onCheckedChange={setSmartMatchingEnabled}
                    disabled={!weddingParams}
                  />
                </div>

                {/* Smart Matching Filters - mobile grid */}
                {smartMatchingEnabled && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 p-2.5 sm:p-3 rounded-lg bg-muted/50">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        Гостей
                      </Label>
                      <Input
                        type="number"
                        value={guestCountFilter || ''}
                        onChange={(e) => setGuestCountFilter(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Palette className="w-3 h-3" />
                        Стиль
                      </Label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Любой" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Любой стиль</SelectItem>
                          {AVAILABLE_STYLES.map((style) => (
                            <SelectItem key={style} value={style}>
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        До {(priceRange[1] / 1000000).toFixed(0)} млн
                      </Label>
                      <Slider
                        value={[priceRange[1]]}
                        onValueChange={(value) => setPriceRange([0, value[0]])}
                        max={100000000}
                        step={5000000}
                        className="w-full mt-2"
                      />
                    </div>
                  </div>
                )}

                {/* Standard Filters - Mobile optimized grid */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Категория</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Все" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        <SelectItem value="venue">Площадка</SelectItem>
                        <SelectItem value="photographer">Фотограф</SelectItem>
                        <SelectItem value="videographer">Видеограф</SelectItem>
                        <SelectItem value="caterer">Кейтеринг</SelectItem>
                        <SelectItem value="florist">Флорист</SelectItem>
                        <SelectItem value="decorator">Декоратор</SelectItem>
                        <SelectItem value="music">Музыка</SelectItem>
                        <SelectItem value="makeup">Визаж</SelectItem>
                        <SelectItem value="clothing">Одежда</SelectItem>
                        <SelectItem value="transport">Транспорт</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs sm:text-sm font-medium">Локация</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Все" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все локации</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="text-xs sm:text-sm font-medium">
                      Рейтинг: {minRating}★
                    </label>
                    <Slider
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      max={5}
                      step={0.5}
                      className="w-full mt-3"
                    />
                  </div>

                  {!smartMatchingEnabled && (
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <label className="text-xs sm:text-sm font-medium">
                        Цена: до {(priceRange[1] / 1000000).toFixed(0)} млн
                      </label>
                      <Slider
                        value={[priceRange[1]]}
                        onValueChange={(value) => setPriceRange([0, value[0]])}
                        max={100000000}
                        step={5000000}
                        className="w-full mt-3"
                      />
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Показано {paginatedVendors.length} из {filteredVendors.length} поставщиков
                </p>
              </div>

              {/* Mobile-optimized vendor grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {paginatedVendors.map((vendor) => (
                  <Card 
                    key={vendor.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden active:scale-[0.98]"
                    onClick={() => navigate(`/marketplace/${vendor.id}`)}
                  >
                    {/* Compact image for mobile */}
                    <div className="relative h-32 sm:h-40 w-full overflow-hidden">
                      <img 
                        src={vendor.portfolio_images?.[0] || CATEGORY_IMAGES[vendor.category] || CATEGORY_IMAGES.other} 
                        alt={vendor.business_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2 flex gap-1.5">
                        {vendor.verified && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0.5">Проверен</Badge>
                        )}
                        {smartMatchingEnabled && matchResults.get(vendor.id) && (
                          <MatchScoreBadge 
                            matchResult={matchResults.get(vendor.id)} 
                            size="sm"
                          />
                        )}
                      </div>
                      {!vendor.isDemo && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => toggleFavorite(vendor.id, e)}
                          className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              favorites.has(vendor.id) 
                                ? 'fill-primary text-primary' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </Button>
                      )}
                    </div>
                    
                    {/* Compact card content for mobile */}
                    <CardHeader className="p-3 sm:p-4 pb-1 sm:pb-2">
                      <div className="space-y-0.5">
                        <CardTitle className="text-base sm:text-lg line-clamp-1">{vendor.business_name}</CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-xs">
                          <Badge variant="outline" className="text-[10px] px-1.5">{vendor.category}</Badge>
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            {vendor.location}
                          </span>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0 space-y-2">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span className="font-semibold text-sm">{vendor.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({vendor.total_reviews})
                        </span>
                      </div>

                      {/* Price and actions - compact layout */}
                      <div className="flex items-center justify-between pt-2 border-t gap-1.5">
                        <div className="text-xs sm:text-sm font-medium truncate flex-1">
                          {vendor.price_range_min ? 
                            `от ${(vendor.price_range_min / 1000000).toFixed(1)}M` : 
                            'По запросу'
                          }
                        </div>
                        <div className="flex items-center gap-1">
                          {!vendor.isDemo && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant={isInComparison(vendor.id) ? "default" : "outline"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isInComparison(vendor.id)) {
                                        removeFromComparison(vendor.id);
                                      } else {
                                        addToComparison({
                                          id: vendor.id,
                                          category: vendor.category,
                                          business_name: vendor.business_name,
                                        });
                                      }
                                    }}
                                    disabled={!isInComparison(vendor.id) && !canAddToComparison(vendor.category)}
                                    className="h-7 px-2"
                                  >
                                    {isInComparison(vendor.id) ? (
                                      <Check className="w-3.5 h-3.5" />
                                    ) : (
                                      <GitCompare className="w-3.5 h-3.5" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {isInComparison(vendor.id) 
                                    ? "Удалить из сравнения" 
                                    : canAddToComparison(vendor.category)
                                      ? "Добавить в сравнение"
                                      : "Сравнивайте вендоров одной категории"
                                  }
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <Button size="sm" className="h-7 px-2 text-xs">
                            Подробнее
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredVendors.length === 0 && (
                <div className="text-center py-12">
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Поставщики не найдены по заданным критериям.
                    </p>
                    {smartMatchingEnabled && guestCountFilter > 0 && (
                      <p className="text-sm text-muted-foreground">
                        Попробуйте уменьшить количество гостей или измените стиль.
                      </p>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setGuestCountFilter(0);
                        setSelectedStyle("all");
                        setPriceRange([0, 100000000]);
                        setMinRating(0);
                        setSelectedCategory("all");
                        setSelectedLocation("all");
                      }}
                    >
                      Сбросить фильтры
                    </Button>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current and adjacent pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      }
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Floating Comparison Bar */}
        <ComparisonFloatingBar
          items={comparisonItems}
          onRemove={removeFromComparison}
          onClear={clearComparison}
          onCompare={goToComparison}
          maxVendors={maxVendors}
        />
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;