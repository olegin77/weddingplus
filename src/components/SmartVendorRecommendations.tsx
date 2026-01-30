/**
 * Компонент умных AI-рекомендаций вендоров v2.0
 * Интегрирует AIRecommendationService для улучшенного подбора
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AIRecommendationService, type AIRecommendation } from "@/services/AIRecommendationService";
import type { Database } from "@/integrations/supabase/types";
import { 
  Star, 
  CheckCircle, 
  Sparkles, 
  TrendingUp, 
  Award,
  MessageSquare,
  Clock,
  Users,
  Lightbulb
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type VendorCategory = Database['public']['Enums']['vendor_category'];

interface SmartVendorRecommendationsProps {
  weddingPlanId: string;
  category: VendorCategory;
  categoryBudget?: number;
}

// Тематические изображения для категорий
const CATEGORY_IMAGES: Record<VendorCategory, string> = {
  photographer: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  videographer: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  decorator: 'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  florist: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  music: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  venue: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  caterer: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  transport: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  makeup: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  clothing: 'https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
  other: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=400&h=250&fit=crop',
};

const CATEGORY_NAMES: Record<VendorCategory, string> = {
  photographer: 'Фотограф',
  videographer: 'Видеограф',
  decorator: 'Декоратор',
  florist: 'Флорист',
  music: 'Музыкант',
  venue: 'Площадка',
  caterer: 'Кейтеринг',
  transport: 'Транспорт',
  makeup: 'Визажист',
  clothing: 'Одежда',
  other: 'Другое',
};

export const SmartVendorRecommendations = ({
  weddingPlanId,
  category,
  categoryBudget,
}: SmartVendorRecommendationsProps) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const results = await AIRecommendationService.getSmartRecommendations({
          weddingPlanId,
          category,
          limit: 3,
          includeAIAnalysis: true,
        });
        
        setRecommendations(results);
      } catch (err) {
        console.error('Error loading AI recommendations:', err);
        setError('Не удалось загрузить рекомендации');
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [weddingPlanId, category]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-40 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (error || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI-рекомендации: {CATEGORY_NAMES[category]}
          </CardTitle>
          <CardDescription>
            {error || 'К сожалению, не нашли подходящих вендоров для ваших критериев.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/marketplace')} variant="outline">
            Смотреть весь каталог
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI-рекомендации: {CATEGORY_NAMES[category]}
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Lightbulb className="h-3.5 w-3.5" />
          Подобрано на основе вашего стиля, бюджета и верифицированных отзывов
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        {recommendations.map((rec, index) => {
          const vendor = rec.vendor;
          const vendorImage = vendor.portfolio_images?.[0] || CATEGORY_IMAGES[category];
          const isTopChoice = index === 0;

          return (
            <div
              key={rec.vendorId}
              className={`border rounded-xl overflow-hidden transition-all cursor-pointer
                ${isTopChoice ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/50'}
              `}
              onClick={() => navigate(`/marketplace/${rec.vendorId}`)}
            >
              {/* Header with image */}
              <div className="relative h-28 sm:h-32 w-full">
                <img 
                  src={vendorImage} 
                  alt={vendor.business_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1.5 flex-wrap">
                  {isTopChoice && (
                    <Badge className="bg-primary text-primary-foreground gap-1 text-xs">
                      <Award className="h-3 w-3" />
                      Лучший выбор
                    </Badge>
                  )}
                  {vendor.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Проверен
                    </Badge>
                  )}
                </div>

                {/* Combined Score */}
                <div className="absolute top-2 right-2">
                  <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 shadow-sm">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-primary" />
                      <span className="font-bold text-sm">{rec.combinedScore}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center">
                      совпадение
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3 sm:p-4 space-y-3">
                {/* Title and price */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-base sm:text-lg truncate">
                      {vendor.business_name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{vendor.rating || '—'}</span>
                      {(vendor.total_reviews ?? 0) > 0 && (
                        <span className="text-xs">({vendor.total_reviews})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">от</div>
                    <div className="text-base sm:text-lg font-semibold text-primary">
                      {vendor.starting_price
                        ? `${(Number(vendor.starting_price) / 1000000).toFixed(1)}M`
                        : '—'}
                    </div>
                  </div>
                </div>

                {/* Score breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Совместимость</span>
                    <span className="font-medium">{rec.combinedScore}%</span>
                  </div>
                  <Progress value={rec.combinedScore} className="h-2" />
                  
                  {/* Score components */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Matching: {rec.matchScore}%</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>AI-score: {rec.aiScore}%</span>
                    </div>
                  </div>
                </div>

                {/* Verified reviews summary */}
                {rec.verifiedReviewsSummary && (
                  <div className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg text-xs">
                    <MessageSquare className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium">
                        {rec.verifiedReviewsSummary.totalVerified} верифицированных отзывов
                      </div>
                      {rec.verifiedReviewsSummary.recentPositive > 0 && (
                        <div className="text-muted-foreground">
                          {rec.verifiedReviewsSummary.recentPositive} положительных за 6 мес
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {rec.aiInsights && rec.aiInsights.length > 0 && (
                  <div className="space-y-1.5">
                    {rec.aiInsights.slice(0, 3).map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{insight}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Match reasons */}
                {rec.reasons.length > 0 && !rec.aiInsights?.length && (
                  <div className="space-y-1.5">
                    {rec.reasons.slice(0, 3).map((reason, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                        <CheckCircle className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{reason.description}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Styles */}
                {vendor.styles && vendor.styles.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {(vendor.styles as string[]).slice(0, 3).map((style: string) => (
                      <Badge key={style} variant="outline" className="text-[10px] px-1.5">
                        {style}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button className="w-full mt-2" variant="outline" size="sm">
                  Подробнее и забронировать
                </Button>
              </div>
            </div>
          );
        })}

        <Button
          onClick={() => navigate(`/marketplace?category=${category}`)}
          variant="ghost"
          className="w-full"
        >
          Показать больше вариантов
        </Button>
      </CardContent>
    </Card>
  );
};
