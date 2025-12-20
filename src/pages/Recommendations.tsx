import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, MapPin, Check, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VendorMatchingEngine, WeddingMatchParams } from "@/lib/matching-engine";
import { toast } from "sonner";

type VendorCategory = 'venue' | 'caterer' | 'photographer' | 'videographer' | 'florist' | 'decorator' | 'music' | 'makeup' | 'transport' | 'clothing';

const categoryLabels: Record<VendorCategory, string> = {
  venue: "Площадки",
  caterer: "Кейтеринг",
  photographer: "Фотографы",
  videographer: "Видеографы",
  florist: "Флористы",
  decorator: "Декораторы",
  music: "Музыка",
  makeup: "Визажисты",
  transport: "Транспорт",
  clothing: "Наряды",
};

const categoryIcons: Record<VendorCategory, string> = {
  venue: "🏛️",
  caterer: "🍽️",
  photographer: "📸",
  videographer: "🎬",
  florist: "💐",
  decorator: "✨",
  music: "🎵",
  makeup: "💄",
  transport: "🚗",
  clothing: "👗",
};

interface VendorRecommendation {
  id: string;
  vendorId: string;
  matchScore: number;
  reasons: { type: string; score: number; description: string }[];
  vendor?: {
    id: string;
    business_name: string;
    category: VendorCategory;
    location: string;
    rating: number;
    total_reviews: number;
    starting_price: number;
    verified: boolean;
    styles: string[];
  };
}

const Recommendations = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [weddingPlan, setWeddingPlan] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Record<VendorCategory, VendorRecommendation[]>>({} as any);
  const [activeCategory, setActiveCategory] = useState<VendorCategory>("venue");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get wedding plan
      const { data: plan } = await supabase
        .from("wedding_plans")
        .select("*")
        .eq("couple_user_id", user.id)
        .maybeSingle();

      if (!plan) {
        navigate("/onboarding");
        return;
      }

      setWeddingPlan(plan);

      // Load cached recommendations first
      const { data: cached } = await supabase
        .from("vendor_recommendations")
        .select(`
          *,
          vendor:vendor_profiles(*)
        `)
        .eq("wedding_plan_id", plan.id)
        .order("match_score", { ascending: false });

      if (cached && cached.length > 0) {
        const grouped = groupByCategory(cached);
        setRecommendations(grouped);
      } else {
        // Generate fresh recommendations
        await refreshRecommendations(plan);
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast.error("Ошибка загрузки рекомендаций");
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (data: any[]): Record<VendorCategory, VendorRecommendation[]> => {
    const grouped: Record<string, VendorRecommendation[]> = {};
    
    for (const item of data) {
      const category = item.category as VendorCategory;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push({
        id: item.id,
        vendorId: item.vendor_id,
        matchScore: item.match_score,
        reasons: item.match_reasons || [],
        vendor: item.vendor,
      });
    }
    
    return grouped as Record<VendorCategory, VendorRecommendation[]>;
  };

  const refreshRecommendations = async (plan?: any) => {
    setRefreshing(true);
    try {
      const planToUse = plan || weddingPlan;
      if (!planToUse) return;

      const params: WeddingMatchParams = {
        weddingPlanId: planToUse.id,
        weddingDate: planToUse.wedding_date ? new Date(planToUse.wedding_date) : undefined,
        budget: Number(planToUse.budget_total) || 50000000,
        guestCount: planToUse.estimated_guests || 150,
        style: planToUse.style_preferences?.[0] || planToUse.theme,
        location: planToUse.venue_location,
        priorities: planToUse.category_priorities || planToUse.priorities || {},
        venueTypePreference: planToUse.venue_type_preference,
        outdoorPreference: planToUse.outdoor_preference,
        parkingNeeded: planToUse.parking_needed,
        cuisinePreferences: planToUse.cuisine_preferences || [],
        dietaryRequirements: planToUse.dietary_requirements || [],
        musicPreferences: planToUse.music_preferences || [],
        programPreferences: planToUse.program_preferences || [],
      };

      const categories: VendorCategory[] = ['venue', 'caterer', 'photographer', 'videographer', 'music', 'decorator', 'florist', 'makeup'];
      const allResults: Record<string, VendorRecommendation[]> = {};

      for (const category of categories) {
        const matches = await VendorMatchingEngine.findMatches(params, {
          category,
          location: params.location,
          availableOnDate: params.weddingDate,
          minCapacity: category === 'venue' || category === 'caterer' ? params.guestCount : undefined,
        });

        if (matches.length > 0) {
          // Fetch vendor details
          const vendorIds = matches.slice(0, 5).map(m => m.vendorId);
          const { data: vendors } = await supabase
            .from("vendor_profiles")
            .select("*")
            .in("id", vendorIds);

          const vendorMap = new Map(vendors?.map(v => [v.id, v]) || []);

          allResults[category] = matches.slice(0, 5).map(m => ({
            id: m.vendorId,
            vendorId: m.vendorId,
            matchScore: m.matchScore,
            reasons: m.reasons,
            vendor: vendorMap.get(m.vendorId) as any,
          }));
        }
      }

      setRecommendations(allResults as Record<VendorCategory, VendorRecommendation[]>);
      toast.success("Рекомендации обновлены");
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      toast.error("Ошибка обновления рекомендаций");
    } finally {
      setRefreshing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const renderVendorCard = (rec: VendorRecommendation) => {
    if (!rec.vendor) return null;

    return (
      <Card 
        key={rec.vendorId} 
        className="hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => navigate(`/marketplace/${rec.vendorId}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {rec.vendor.business_name}
                </h3>
                {rec.vendor.verified && (
                  <Badge variant="default" className="text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    Проверен
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {rec.vendor.location}
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(rec.matchScore)}`}>
                {rec.matchScore}%
              </div>
              <div className="text-xs text-muted-foreground">совпадение</div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-primary text-primary" />
              <span className="font-medium">{rec.vendor.rating?.toFixed(1) || "—"}</span>
              <span className="text-sm text-muted-foreground">
                ({rec.vendor.total_reviews || 0})
              </span>
            </div>
            <div className="text-sm font-medium">
              от {rec.vendor.starting_price?.toLocaleString()} сум
            </div>
          </div>

          {rec.reasons && rec.reasons.length > 0 && (
            <div className="space-y-1">
              {rec.reasons.slice(0, 3).map((reason, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Sparkles className="w-3 h-3 text-primary" />
                  <span className="text-muted-foreground">{reason.description}</span>
                </div>
              ))}
            </div>
          )}

          <Button 
            variant="ghost" 
            className="w-full mt-3 group-hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/marketplace/${rec.vendorId}`);
            }}
          >
            Подробнее
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-12 w-full" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const availableCategories = Object.keys(recommendations).filter(
    cat => recommendations[cat as VendorCategory]?.length > 0
  ) as VendorCategory[];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              Рекомендации для вас
            </h1>
            <p className="text-muted-foreground mt-1">
              Персональный подбор поставщиков на основе ваших предпочтений
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refreshRecommendations()}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>

        {weddingPlan && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Стиль: </span>
                  <span className="font-medium">{weddingPlan.theme || weddingPlan.style_preferences?.[0] || "Не указан"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Гостей: </span>
                  <span className="font-medium">{weddingPlan.estimated_guests || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Бюджет: </span>
                  <span className="font-medium">{Number(weddingPlan.budget_total).toLocaleString()} сум</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Город: </span>
                  <span className="font-medium">{weddingPlan.venue_location || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {availableCategories.length > 0 ? (
          <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as VendorCategory)}>
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              {availableCategories.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <span className="mr-1">{categoryIcons[category]}</span>
                  {categoryLabels[category]}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {recommendations[category]?.length || 0}
                  </Badge>
                </TabsTrigger>
              ))}
            </TabsList>

            {availableCategories.map(category => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations[category]?.map(rec => renderVendorCard(rec))}
                </div>
                
                {recommendations[category]?.length > 0 && (
                  <div className="mt-6 text-center">
                    <Button 
                      variant="outline"
                      onClick={() => navigate(`/marketplace?category=${category}`)}
                    >
                      Показать всех {categoryLabels[category].toLowerCase()}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Рекомендации формируются</h3>
              <p className="text-muted-foreground mb-4">
                Нажмите кнопку "Обновить" чтобы получить персональные рекомендации
              </p>
              <Button onClick={() => refreshRecommendations()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Сформировать рекомендации
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Recommendations;