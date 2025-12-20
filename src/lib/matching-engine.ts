/**
 * Smart Matching Engine для подбора вендоров
 * Реализует алгоритм мэтчинга на основе предпочтений пары и атрибутов поставщиков
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  VendorAttributes,
  VendorMatchResult,
  MatchReason,
  PhotographerAttributes,
  MusicianAttributes,
  DecoratorAttributes,
  VenueAttributes,
  CateringAttributes,
} from "@/types/vendor-attributes";

type VendorCategory = Database['public']['Enums']['vendor_category'];

/**
 * Полные параметры свадьбы для мэтчинга
 */
export interface WeddingMatchParams {
  weddingPlanId?: string;
  weddingDate?: Date;
  budget: number;
  categoryBudget?: number;
  guestCount: number;
  style?: string;
  location?: string;
  languages?: string[];
  priorities?: Record<string, 'high' | 'medium' | 'low'>;
  // Расширенные параметры
  venueTypePreference?: string;
  outdoorPreference?: boolean;
  parkingNeeded?: boolean;
  cuisinePreferences?: string[];
  dietaryRequirements?: string[];
  musicPreferences?: string[];
  musicType?: string;
  photoStyle?: string;
  needsDrone?: boolean;
  needsSDE?: boolean;
  programPreferences?: string[];
}

/**
 * Фильтры для поиска вендоров
 */
interface VendorFilters {
  category: VendorCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  availableOnDate?: Date;
  styles?: string[];
  languages?: string[];
  minCapacity?: number;
  maxCapacity?: number;
}

/**
 * Класс для работы с Matching Engine
 */
export class VendorMatchingEngine {
  /**
   * Получить параметры свадьбы из базы данных
   */
  static async getWeddingParams(weddingPlanId: string): Promise<WeddingMatchParams | null> {
    const { data, error } = await supabase
      .from('wedding_plans')
      .select('*')
      .eq('id', weddingPlanId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      weddingPlanId: data.id,
      weddingDate: data.wedding_date ? new Date(data.wedding_date) : undefined,
      budget: Number(data.budget_total) || 0,
      guestCount: data.estimated_guests || 100,
      style: data.style_preferences?.[0] || data.theme || undefined,
      location: data.venue_location || undefined,
      priorities: (data.category_priorities as Record<string, 'high' | 'medium' | 'low'>) || {},
      venueTypePreference: (data as any).venue_type_preference || undefined,
      outdoorPreference: (data as any).outdoor_preference || false,
      parkingNeeded: (data as any).parking_needed || false,
      cuisinePreferences: (data as any).cuisine_preferences || [],
      dietaryRequirements: (data as any).dietary_requirements || [],
      musicPreferences: (data as any).music_preferences || [],
      programPreferences: (data as any).program_preferences || [],
    };
  }

  /**
   * Рассчитать бюджет для категории на основе приоритетов
   */
  static calculateCategoryBudget(
    totalBudget: number,
    category: VendorCategory,
    priorities: Record<string, 'high' | 'medium' | 'low'>
  ): number {
    // Базовые проценты бюджета по категориям
    const basePercentages: Record<string, number> = {
      venue: 30,
      caterer: 25,
      photographer: 10,
      videographer: 8,
      music: 5,
      decorator: 8,
      florist: 5,
      makeup: 3,
      transport: 3,
      clothing: 3,
    };

    const basePercent = basePercentages[category] || 5;
    const priority = priorities[category] || 'medium';
    
    // Модификатор приоритета
    const priorityMultiplier = priority === 'high' ? 1.5 : priority === 'low' ? 0.7 : 1;
    
    return Math.round(totalBudget * (basePercent / 100) * priorityMultiplier);
  }

  /**
   * Основной метод поиска подходящих вендоров
   */
  static async findMatches(
    params: WeddingMatchParams,
    filters: VendorFilters
  ): Promise<VendorMatchResult[]> {
    try {
      // Рассчитать бюджет для категории
      const categoryBudget = params.categoryBudget || 
        this.calculateCategoryBudget(params.budget, filters.category, params.priorities || {});

      // Шаг 1: Hard Filter (жесткий отсев)
      let query = supabase
        .from('vendor_profiles')
        .select('*')
        .eq('category', filters.category);

      // Фильтр по цене
      if (categoryBudget > 0) {
        query = query.lte('starting_price', categoryBudget * 1.2); // +20% запаса
      }

      // Фильтр по локации (service_area)
      if (filters.location) {
        query = query.or(`service_area.cs.{${filters.location}},location.eq.${filters.location}`);
      }

      // Фильтр по вместимости для площадок и кейтеринга
      if (filters.category === 'venue' || filters.category === 'caterer') {
        if (filters.minCapacity) {
          query = query.gte('capacity_max', filters.minCapacity);
        }
      }

      const { data: vendors, error } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        return [];
      }

      if (!vendors || vendors.length === 0) {
        return [];
      }

      // Шаг 2: Проверка доступности
      let availableVendors = vendors;
      if (filters.availableOnDate) {
        availableVendors = await this.filterByAvailability(
          vendors,
          filters.availableOnDate
        );
      }

      // Шаг 3: Soft Filter (расчет совместимости)
      const matchResults: VendorMatchResult[] = [];

      for (const vendor of availableVendors) {
        const matchScore = await this.calculateMatchScore(vendor, params, filters, categoryBudget);
        
        matchResults.push({
          vendorId: vendor.id,
          matchScore: matchScore.score,
          reasons: matchScore.reasons,
          estimatedPrice: vendor.starting_price || undefined,
          availableOnDate: true,
        });
      }

      // Сортировка по score
      matchResults.sort((a, b) => b.matchScore - a.matchScore);

      // Кэширование результатов
      if (params.weddingPlanId) {
        await this.cacheRecommendations(matchResults.slice(0, 10), params.weddingPlanId, filters.category);
      }

      return matchResults;
    } catch (error) {
      console.error('Matching engine error:', error);
      return [];
    }
  }

  /**
   * Найти все рекомендации для свадьбы по всем категориям
   */
  static async findAllCategoryMatches(
    weddingPlanId: string
  ): Promise<Record<VendorCategory, VendorMatchResult[]>> {
    const params = await this.getWeddingParams(weddingPlanId);
    if (!params) return {} as Record<VendorCategory, VendorMatchResult[]>;

    const categories: VendorCategory[] = [
      'venue', 'caterer', 'photographer', 'videographer', 
      'florist', 'decorator', 'music', 'makeup', 'transport', 'clothing'
    ];

    const results: Record<string, VendorMatchResult[]> = {};

    for (const category of categories) {
      const filters: VendorFilters = {
        category,
        location: params.location,
        availableOnDate: params.weddingDate,
        minCapacity: category === 'venue' || category === 'caterer' ? params.guestCount : undefined,
        styles: params.style ? [params.style] : undefined,
      };

      results[category] = await this.findMatches(params, filters);
    }

    return results as Record<VendorCategory, VendorMatchResult[]>;
  }

  /**
   * Фильтрация по доступности на дату
   */
  private static async filterByAvailability(
    vendors: any[],
    date: Date
  ): Promise<any[]> {
    const vendorIds = vendors.map(v => v.id);
    
    const { data: unavailable } = await supabase
      .from('vendor_availability')
      .select('vendor_id')
      .in('vendor_id', vendorIds)
      .eq('date', date.toISOString().split('T')[0])
      .eq('is_available', false);

    const unavailableIds = new Set(unavailable?.map(a => a.vendor_id) || []);

    return vendors.filter(v => !unavailableIds.has(v.id));
  }

  /**
   * Расчет score совместимости
   */
  private static async calculateMatchScore(
    vendor: any,
    params: WeddingMatchParams,
    filters: VendorFilters,
    categoryBudget: number
  ): Promise<{ score: number; reasons: MatchReason[] }> {
    let totalScore = 0;
    const reasons: MatchReason[] = [];

    // Базовый score за наличие профиля
    totalScore += 5;

    // 1. Совпадение стиля (+15-25 баллов)
    if (params.style && vendor.styles?.includes(params.style)) {
      const styleScore = 25;
      totalScore += styleScore;
      reasons.push({
        type: 'style',
        score: styleScore,
        description: `Работает в стиле "${params.style}"`,
      });
    } else if (params.style && vendor.styles?.length > 0) {
      // Частичное совпадение стилей
      totalScore += 10;
    }

    // 2. Рейтинг вендора (+0-20 баллов)
    if (vendor.rating && vendor.rating > 0) {
      const ratingScore = Math.round((vendor.rating / 5) * 20);
      totalScore += ratingScore;
      reasons.push({
        type: 'rating',
        score: ratingScore,
        description: `Рейтинг ${vendor.rating.toFixed(1)}/5 (${vendor.total_reviews || 0} отзывов)`,
      });
    }

    // 3. Бюджетное соответствие (+0-20 баллов)
    if (categoryBudget > 0 && vendor.starting_price) {
      const priceFit = vendor.starting_price / categoryBudget;
      if (priceFit <= 0.8) {
        // Значительно дешевле бюджета
        totalScore += 15;
        reasons.push({
          type: 'budget',
          score: 15,
          description: 'Отличная цена в рамках бюджета',
        });
      } else if (priceFit <= 1.0) {
        // В пределах бюджета
        totalScore += 20;
        reasons.push({
          type: 'budget',
          score: 20,
          description: 'Идеально вписывается в бюджет',
        });
      } else if (priceFit <= 1.2) {
        // Немного дороже
        totalScore += 10;
        reasons.push({
          type: 'budget',
          score: 10,
          description: 'Чуть выше бюджета, но качественный',
        });
      }
    }

    // 4. Локация (+10 баллов)
    if (params.location) {
      const inServiceArea = vendor.service_area?.includes(params.location);
      const isLocation = vendor.location === params.location;
      
      if (inServiceArea || isLocation) {
        totalScore += 10;
        reasons.push({
          type: 'location',
          score: 10,
          description: `Работает в ${params.location}`,
        });
      }
    }

    // 5. Верификация (+5 баллов)
    if (vendor.verified) {
      totalScore += 5;
      reasons.push({
        type: 'feature',
        score: 5,
        description: 'Проверенный поставщик',
      });
    }

    // 6. Специфичные атрибуты категории
    const categoryScore = this.calculateCategorySpecificScore(vendor, params, filters);
    totalScore += categoryScore.score;
    reasons.push(...categoryScore.reasons);

    return {
      score: Math.min(totalScore, 100),
      reasons: reasons.slice(0, 5), // Топ-5 причин
    };
  }

  /**
   * Специфичный score для каждой категории
   */
  private static calculateCategorySpecificScore(
    vendor: any,
    params: WeddingMatchParams,
    filters: VendorFilters
  ): { score: number; reasons: MatchReason[] } {
    let score = 0;
    const reasons: MatchReason[] = [];

    const attributes = vendor.attributes as VendorAttributes | null;

    switch (filters.category) {
      case 'venue': {
        // Вместимость
        const capacityMax = vendor.capacity_max || (attributes as VenueAttributes)?.capacity?.max;
        const capacityMin = vendor.capacity_min || (attributes as VenueAttributes)?.capacity?.min || 0;
        
        if (capacityMax && params.guestCount <= capacityMax && params.guestCount >= capacityMin) {
          score += 15;
          reasons.push({
            type: 'feature',
            score: 15,
            description: `Вместимость до ${capacityMax} гостей`,
          });
        }

        // Тип площадки
        if (params.venueTypePreference) {
          const venueType = (attributes as VenueAttributes)?.venueType || vendor.venue_type;
          if (venueType === params.venueTypePreference) {
            score += 10;
            reasons.push({
              type: 'feature',
              score: 10,
              description: 'Подходящий тип площадки',
            });
          }
        }

        // Парковка
        if (params.parkingNeeded && (vendor.has_parking || (attributes as VenueAttributes)?.hasParking)) {
          score += 5;
          reasons.push({
            type: 'feature',
            score: 5,
            description: 'Есть парковка',
          });
        }

        // Открытое пространство
        if (params.outdoorPreference && (vendor.outdoor_available || (attributes as VenueAttributes)?.hasOutdoorSpace)) {
          score += 5;
          reasons.push({
            type: 'feature',
            score: 5,
            description: 'Есть открытое пространство',
          });
        }
        break;
      }

      case 'caterer': {
        // Кухня
        const cuisineTypes = vendor.cuisine_types || (attributes as CateringAttributes)?.cuisineTypes || [];
        const matchingCuisines = params.cuisinePreferences?.filter(c => cuisineTypes.includes(c)) || [];
        
        if (matchingCuisines.length > 0) {
          const cuisineScore = Math.min(matchingCuisines.length * 5, 15);
          score += cuisineScore;
          reasons.push({
            type: 'feature',
            score: cuisineScore,
            description: `Готовит: ${matchingCuisines.join(', ')}`,
          });
        }

        // Диетические опции
        const dietaryOptions = vendor.dietary_options || (attributes as CateringAttributes)?.dietaryOptions || [];
        const matchingDietary = params.dietaryRequirements?.filter(d => dietaryOptions.includes(d)) || [];
        
        if (matchingDietary.length > 0) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: `Есть: ${matchingDietary.join(', ')}`,
          });
        }

        // Вместимость
        const maxGuests = vendor.max_guests || (attributes as CateringAttributes)?.maxGuests;
        if (maxGuests && params.guestCount <= maxGuests) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: `Обслуживает до ${maxGuests} гостей`,
          });
        }
        break;
      }

      case 'photographer':
      case 'videographer': {
        const photoAttrs = attributes as PhotographerAttributes;
        
        // Стиль съёмки
        if (params.photoStyle && photoAttrs?.style === params.photoStyle) {
          score += 15;
          reasons.push({
            type: 'style',
            score: 15,
            description: `Стиль: ${params.photoStyle}`,
          });
        }

        // Дрон
        if (params.needsDrone && photoAttrs?.hasDrone) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: 'Аэросъёмка с дрона',
          });
        }

        // SDE
        if (params.needsSDE && photoAttrs?.providesSDE) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: 'Монтаж в день свадьбы (SDE)',
          });
        }

        // Второй фотограф для большой свадьбы
        if (params.guestCount > 200 && photoAttrs?.hasSecondShooter) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: 'Второй фотограф для большой свадьбы',
          });
        }
        break;
      }

      case 'music': {
        const musicAttrs = attributes as MusicianAttributes;
        const musicGenres = vendor.music_genres || musicAttrs?.genres || [];
        
        // Жанры
        const matchingGenres = params.musicPreferences?.filter(g => musicGenres.includes(g)) || [];
        if (matchingGenres.length > 0) {
          const genreScore = Math.min(matchingGenres.length * 5, 15);
          score += genreScore;
          reasons.push({
            type: 'feature',
            score: genreScore,
            description: `Играет: ${matchingGenres.join(', ')}`,
          });
        }

        // Тип музыканта
        if (params.musicType && musicAttrs?.type === params.musicType) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: `Тип: ${params.musicType}`,
          });
        }

        // Оборудование включено
        if (vendor.equipment_included || musicAttrs?.soundEquipmentIncluded) {
          score += 5;
          reasons.push({
            type: 'feature',
            score: 5,
            description: 'Оборудование включено',
          });
        }
        break;
      }

      case 'decorator':
      case 'florist': {
        const decorAttrs = attributes as DecoratorAttributes;
        
        // 3D визуализация
        if (decorAttrs?.provides3DVisualization) {
          score += 10;
          reasons.push({
            type: 'feature',
            score: 10,
            description: '3D визуализация проекта',
          });
        }

        // Переиспользование декора (экономия)
        if (decorAttrs?.reuseItems) {
          score += 5;
          reasons.push({
            type: 'budget',
            score: 5,
            description: 'Экономия на переносе декора',
          });
        }
        break;
      }
    }

    return { score, reasons };
  }

  /**
   * Кэширование рекомендаций в базе данных
   */
  private static async cacheRecommendations(
    matches: VendorMatchResult[],
    weddingPlanId: string,
    category: VendorCategory
  ): Promise<void> {
    try {
      // Удалить старые рекомендации для этой категории
      await supabase
        .from('vendor_recommendations')
        .delete()
        .eq('wedding_plan_id', weddingPlanId)
        .eq('category', category);

      // Вставить новые
      const recommendations = matches.map(match => ({
        wedding_plan_id: weddingPlanId,
        vendor_id: match.vendorId,
        category,
        match_score: match.matchScore,
        match_reasons: match.reasons as any,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }));

      if (recommendations.length > 0) {
        await supabase.from('vendor_recommendations').insert(recommendations);
      }
    } catch (error) {
      console.error('Error caching recommendations:', error);
    }
  }

  /**
   * Получить кэшированные рекомендации
   */
  static async getCachedRecommendations(
    weddingPlanId: string,
    category?: VendorCategory
  ): Promise<VendorMatchResult[]> {
    try {
      let query = supabase
        .from('vendor_recommendations')
        .select('*')
        .eq('wedding_plan_id', weddingPlanId)
        .gt('expires_at', new Date().toISOString())
        .order('match_score', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error || !data) return [];

      return data.map(rec => ({
        vendorId: rec.vendor_id,
        matchScore: rec.match_score,
        reasons: (rec.match_reasons as unknown) as MatchReason[],
        availableOnDate: true,
      }));
    } catch (error) {
      console.error('Error fetching cached recommendations:', error);
      return [];
    }
  }
}