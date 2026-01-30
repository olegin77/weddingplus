/**
 * AI Recommendation Service v2.0
 * Улучшенная система рекомендаций с учётом верифицированных отзывов
 */

import { supabase } from "@/integrations/supabase/client";
import { VendorMatchingEngine, type WeddingMatchParams } from "@/lib/matching-engine";
import type { Database } from "@/integrations/supabase/types";

type VendorCategory = Database['public']['Enums']['vendor_category'];
type VendorProfile = Database['public']['Tables']['vendor_profiles']['Row'];

export interface VerifiedReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  booking_id: string | null;
  vendor_id: string;
  guest_count?: number;
  style?: string;
}

export interface AIRecommendation {
  vendorId: string;
  vendor: VendorProfile;
  matchScore: number;
  aiScore: number; // Дополнительный AI-score на основе анализа отзывов
  combinedScore: number;
  reasons: {
    type: string;
    score: number;
    description: string;
  }[];
  verifiedReviewsSummary?: {
    totalVerified: number;
    averageRating: number;
    recentPositive: number;
    similarEventsFeedback?: string;
  };
  aiInsights?: string[];
}

interface RecommendationContext {
  weddingPlanId: string;
  category: VendorCategory;
  limit?: number;
  includeAIAnalysis?: boolean;
}

/**
 * Класс для AI-рекомендаций с анализом верифицированных отзывов
 */
export class AIRecommendationService {
  /**
   * Получить AI-рекомендации с анализом отзывов
   */
  static async getSmartRecommendations(
    context: RecommendationContext
  ): Promise<AIRecommendation[]> {
    const { weddingPlanId, category, limit = 5, includeAIAnalysis = true } = context;

    // 1. Получаем параметры свадьбы
    const weddingParams = await VendorMatchingEngine.getWeddingParams(weddingPlanId);
    if (!weddingParams) return [];

    // 2. Получаем базовые рекомендации от matching engine
    const baseMatches = await VendorMatchingEngine.findMatches(
      weddingParams,
      {
        category,
        location: weddingParams.location,
        availableOnDate: weddingParams.weddingDate,
      },
      { includeExcluded: false, limit: limit * 2 }
    );

    if (baseMatches.length === 0) return [];

    // 3. Загружаем данные вендоров с верифицированными отзывами
    const vendorIds = baseMatches.map(m => m.vendorId);
    const [vendorsData, reviewsData] = await Promise.all([
      this.loadVendorProfiles(vendorIds),
      this.loadVerifiedReviews(vendorIds),
    ]);

    // 4. Анализируем каждого вендора
    const recommendations: AIRecommendation[] = [];

    for (const match of baseMatches) {
      const vendor = vendorsData.get(match.vendorId);
      if (!vendor) continue;

      const reviews = reviewsData.get(match.vendorId) || [];
      const verifiedSummary = this.analyzeVerifiedReviews(reviews, weddingParams);
      
      // Рассчитываем AI-score на основе отзывов
      const aiScore = this.calculateAIScore(reviews, weddingParams);
      
      // Комбинированный score: 70% matching + 30% AI
      const combinedScore = Math.round(match.matchScore * 0.7 + aiScore * 0.3);

      // Генерируем AI-инсайты
      const aiInsights = includeAIAnalysis 
        ? this.generateAIInsights(vendor, reviews, weddingParams)
        : undefined;

      recommendations.push({
        vendorId: match.vendorId,
        vendor,
        matchScore: match.matchScore,
        aiScore,
        combinedScore,
        reasons: match.reasons.map(r => ({
          type: r.type,
          score: r.score,
          description: r.description,
        })),
        verifiedReviewsSummary: verifiedSummary,
        aiInsights,
      });
    }

    // Сортируем по комбинированному score
    recommendations.sort((a, b) => b.combinedScore - a.combinedScore);

    return recommendations.slice(0, limit);
  }

  /**
   * Загрузка профилей вендоров
   */
  private static async loadVendorProfiles(
    vendorIds: string[]
  ): Promise<Map<string, VendorProfile>> {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .in('id', vendorIds);

    const map = new Map<string, VendorProfile>();
    if (data) {
      data.forEach(v => map.set(v.id, v));
    }
    return map;
  }

  /**
   * Загрузка верифицированных отзывов (с booking_id)
   */
  private static async loadVerifiedReviews(
    vendorIds: string[]
  ): Promise<Map<string, VerifiedReview[]>> {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        booking_id,
        vendor_id
      `)
      .in('vendor_id', vendorIds)
      .not('booking_id', 'is', null) // Только верифицированные
      .order('created_at', { ascending: false });

    const map = new Map<string, VerifiedReview[]>();
    if (data) {
      data.forEach(review => {
        const existing = map.get(review.vendor_id) || [];
        existing.push(review);
        map.set(review.vendor_id, existing);
      });
    }
    return map;
  }

  /**
   * Анализ верифицированных отзывов
   */
  private static analyzeVerifiedReviews(
    reviews: VerifiedReview[],
    params: WeddingMatchParams
  ): AIRecommendation['verifiedReviewsSummary'] | undefined {
    if (reviews.length === 0) return undefined;

    const totalVerified = reviews.length;
    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalVerified;
    
    // Отзывы за последние 6 месяцев
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentReviews = reviews.filter(r => new Date(r.created_at) > sixMonthsAgo);
    const recentPositive = recentReviews.filter(r => r.rating >= 4).length;

    // Анализ комментариев на похожие события
    const similarFeedback = this.extractSimilarEventFeedback(reviews, params);

    return {
      totalVerified,
      averageRating: Math.round(averageRating * 10) / 10,
      recentPositive,
      similarEventsFeedback: similarFeedback,
    };
  }

  /**
   * Извлечение отзывов о похожих мероприятиях
   */
  private static extractSimilarEventFeedback(
    reviews: VerifiedReview[],
    params: WeddingMatchParams
  ): string | undefined {
    // Ищем в комментариях упоминания похожего количества гостей
    const guestCount = params.guestCount;
    const relevantReviews = reviews.filter(r => {
      if (!r.comment) return false;
      const comment = r.comment.toLowerCase();
      
      // Поиск упоминаний размера мероприятия
      const mentionsLargeEvent = guestCount > 150 && 
        (comment.includes('большой') || comment.includes('много гостей') || comment.includes('масштаб'));
      const mentionsSmallEvent = guestCount <= 100 &&
        (comment.includes('камерн') || comment.includes('небольш') || comment.includes('интимн'));
      
      return mentionsLargeEvent || mentionsSmallEvent;
    });

    if (relevantReviews.length > 0) {
      const positiveCount = relevantReviews.filter(r => r.rating >= 4).length;
      if (positiveCount > 0) {
        return `${positiveCount} положительных отзывов от мероприятий похожего размера`;
      }
    }

    return undefined;
  }

  /**
   * Расчёт AI-score на основе отзывов
   */
  private static calculateAIScore(
    reviews: VerifiedReview[],
    params: WeddingMatchParams
  ): number {
    if (reviews.length === 0) return 50; // Базовый score без отзывов

    let score = 50;

    // 1. Количество верифицированных отзывов (+20 max)
    const reviewCountBonus = Math.min(reviews.length * 2, 20);
    score += reviewCountBonus;

    // 2. Средний рейтинг (+20 max)
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingBonus = Math.round((avgRating / 5) * 20);
    score += ratingBonus;

    // 3. Свежесть отзывов (+10 max)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const recentReviews = reviews.filter(r => new Date(r.created_at) > threeMonthsAgo);
    const freshnessBonus = Math.min(recentReviews.length * 2, 10);
    score += freshnessBonus;

    // 4. Консистентность рейтингов (+10 max при низкой дисперсии)
    if (reviews.length >= 3) {
      const variance = this.calculateVariance(reviews.map(r => r.rating));
      if (variance < 0.5) {
        score += 10; // Стабильно высокие оценки
      } else if (variance < 1) {
        score += 5;
      }
    }

    return Math.min(score, 100);
  }

  /**
   * Расчёт дисперсии
   */
  private static calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Генерация AI-инсайтов для вендора
   */
  private static generateAIInsights(
    vendor: VendorProfile,
    reviews: VerifiedReview[],
    params: WeddingMatchParams
  ): string[] {
    const insights: string[] = [];

    // 1. Инсайт о стиле
    const vendorStyles = vendor.styles || [];
    const requestedStyle = params.style || params.styles?.[0];
    if (requestedStyle && vendorStyles.includes(requestedStyle)) {
      insights.push(`Специализируется на ${requestedStyle} стиле`);
    }

    // 2. Инсайт об опыте
    if (vendor.experience_years && vendor.experience_years >= 5) {
      insights.push(`${vendor.experience_years}+ лет опыта в индустрии`);
    }

    // 3. Инсайт о отзывах
    if (reviews.length >= 10) {
      const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      if (avgRating >= 4.5) {
        insights.push(`${reviews.length} верифицированных отзывов со средней оценкой ${avgRating.toFixed(1)}`);
      }
    }

    // 4. Инсайт о вместимости
    const maxGuests = vendor.max_guests || vendor.capacity_max;
    if (maxGuests && params.guestCount > 0) {
      const utilization = params.guestCount / maxGuests;
      if (utilization >= 0.6 && utilization <= 0.85) {
        insights.push('Оптимальная вместимость для вашего мероприятия');
      }
    }

    // 5. Инсайт о бонусах
    const bonuses = vendor.bonuses || [];
    if (bonuses.length > 0) {
      insights.push(`Включает ${bonuses.length} бонусов в пакет`);
    }

    // 6. Инсайт о языках
    const languages = vendor.languages || [];
    if (languages.includes('Узбекский') && languages.includes('Русский')) {
      insights.push('Работает на узбекском и русском языках');
    }

    return insights.slice(0, 4); // Максимум 4 инсайта
  }

  /**
   * Получить топ-1 рекомендацию для категории
   */
  static async getBestMatch(
    weddingPlanId: string,
    category: VendorCategory
  ): Promise<AIRecommendation | null> {
    const recommendations = await this.getSmartRecommendations({
      weddingPlanId,
      category,
      limit: 1,
      includeAIAnalysis: true,
    });

    return recommendations[0] || null;
  }

  /**
   * Получить рекомендации по всем категориям
   */
  static async getAllCategoryRecommendations(
    weddingPlanId: string
  ): Promise<Record<VendorCategory, AIRecommendation | null>> {
    const categories: VendorCategory[] = [
      'venue', 'caterer', 'photographer', 'videographer',
      'florist', 'decorator', 'music', 'makeup', 'transport', 'clothing'
    ];

    const results: Record<string, AIRecommendation | null> = {};

    await Promise.all(
      categories.map(async (category) => {
        results[category] = await this.getBestMatch(weddingPlanId, category);
      })
    );

    return results as Record<VendorCategory, AIRecommendation | null>;
  }
}
