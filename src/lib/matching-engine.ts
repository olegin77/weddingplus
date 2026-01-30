/**
 * Smart Matching Engine для подбора вендоров v2.0
 * Реализует алгоритм мэтчинга с Hard Filters и Soft Scoring
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type {
  VendorAttributes,
  VendorMatchResult,
  MatchReason,
  ExclusionReason,
  HardFilterType,
  PhotographerAttributes,
  MusicianAttributes,
  DecoratorAttributes,
  VenueAttributes,
  CateringAttributes,
} from "@/types/vendor-attributes";

type VendorCategory = Database['public']['Enums']['vendor_category'];
type VendorProfile = Database['public']['Tables']['vendor_profiles']['Row'];

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
  styles?: string[];
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
 * Опции для matching engine
 */
interface MatchingOptions {
  includeExcluded?: boolean; // Включать исключённых с причинами
  budgetFlexibility?: number; // Насколько можно превысить бюджет (0.2 = 20%)
  minScore?: number; // Минимальный балл для включения
  limit?: number; // Лимит результатов
}

const DEFAULT_OPTIONS: MatchingOptions = {
  includeExcluded: false,
  budgetFlexibility: 0.2,
  minScore: 20,
  limit: 20,
};

/**
 * Класс для работы с Matching Engine
 */
export class VendorMatchingEngine {
  private options: MatchingOptions;

  constructor(options: Partial<MatchingOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

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
      styles: data.style_preferences || [],
      location: data.venue_location || undefined,
      priorities: (data.category_priorities as Record<string, 'high' | 'medium' | 'low'>) || {},
      venueTypePreference: data.venue_type_preference || undefined,
      outdoorPreference: data.outdoor_preference || false,
      parkingNeeded: data.parking_needed || false,
      cuisinePreferences: data.cuisine_preferences || [],
      dietaryRequirements: data.dietary_requirements || [],
      musicPreferences: data.music_preferences || [],
      programPreferences: data.program_preferences || [],
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
   * === HARD FILTERS ===
   * Проверяет, должен ли поставщик быть исключён
   */
  private static applyHardFilters(
    vendor: VendorProfile,
    params: WeddingMatchParams,
    categoryBudget: number,
    isAvailable: boolean
  ): ExclusionReason | null {
    // 1. Проверка доступности на дату
    if (!isAvailable) {
      return {
        filter: 'unavailable',
        description: 'Занят на выбранную дату свадьбы',
      };
    }

    // 2. Проверка максимальной вместимости
    // Например: тойхона на 500 человек НЕ подходит для 600 гостей
    if (vendor.max_guests && vendor.max_guests < params.guestCount) {
      return {
        filter: 'capacity_exceeded',
        description: `Максимум ${vendor.max_guests} гостей, вам нужно ${params.guestCount}`,
        vendorValue: vendor.max_guests,
        requiredValue: params.guestCount,
      };
    }

    // Для venue проверяем capacity_max
    if (vendor.capacity_max && vendor.capacity_max < params.guestCount) {
      return {
        filter: 'capacity_exceeded',
        description: `Вместимость до ${vendor.capacity_max} человек, вам нужно ${params.guestCount}`,
        vendorValue: vendor.capacity_max,
        requiredValue: params.guestCount,
      };
    }

    // 3. Проверка минимальной вместимости
    // Например: зал от 200 человек не подходит для свадьбы на 50 гостей
    if (vendor.min_guests && vendor.min_guests > params.guestCount) {
      return {
        filter: 'min_guests_not_met',
        description: `Минимум ${vendor.min_guests} гостей, у вас ${params.guestCount}`,
        vendorValue: vendor.min_guests,
        requiredValue: params.guestCount,
      };
    }

    if (vendor.capacity_min && vendor.capacity_min > params.guestCount) {
      return {
        filter: 'min_guests_not_met',
        description: `Минимальная вместимость ${vendor.capacity_min}, у вас ${params.guestCount} гостей`,
        vendorValue: vendor.capacity_min,
        requiredValue: params.guestCount,
      };
    }

    // 4. Проверка бюджета (с учётом гибкости)
    if (vendor.starting_price && categoryBudget > 0) {
      const maxAllowedPrice = categoryBudget * (1 + (DEFAULT_OPTIONS.budgetFlexibility || 0.2));
      if (Number(vendor.starting_price) > maxAllowedPrice) {
        return {
          filter: 'budget_exceeded',
          description: `Цена от ${this.formatPrice(vendor.starting_price)}, бюджет ${this.formatPrice(categoryBudget)}`,
          vendorValue: Number(vendor.starting_price),
          requiredValue: categoryBudget,
        };
      }
    }

    // 5. Проверка локации
    if (params.location && vendor.service_area?.length) {
      const locationLower = params.location.toLowerCase();
      const servesLocation = vendor.service_area.some(
        (area) => area.toLowerCase().includes(locationLower) || locationLower.includes(area.toLowerCase())
      );
      
      if (!servesLocation && vendor.location?.toLowerCase() !== locationLower) {
        return {
          filter: 'location_mismatch',
          description: `Не работает в регионе: ${params.location}`,
          vendorValue: vendor.service_area.join(', '),
          requiredValue: params.location,
        };
      }
    }

    return null; // Прошёл все фильтры
  }

  /**
   * Форматирование цены
   */
  private static formatPrice(price: number | string): string {
    const num = Number(price);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)} млн сум`;
    }
    if (num >= 1000) {
      return `${Math.round(num / 1000)} тыс сум`;
    }
    return `${num} сум`;
  }

  /**
   * Основной метод поиска подходящих вендоров
   */
  static async findMatches(
    params: WeddingMatchParams,
    filters: VendorFilters,
    options: MatchingOptions = DEFAULT_OPTIONS
  ): Promise<VendorMatchResult[]> {
    try {
      // Рассчитать бюджет для категории
      const categoryBudget = params.categoryBudget || 
        this.calculateCategoryBudget(params.budget, filters.category, params.priorities || {});

      // Загрузка всех вендоров категории (без предварительной фильтрации)
      // Это позволяет показать причины исключения
      let query = supabase
        .from('vendor_profiles')
        .select('*')
        .eq('category', filters.category);

      const { data: vendors, error } = await query;

      if (error) {
        console.error('Error fetching vendors:', error);
        return [];
      }

      if (!vendors || vendors.length === 0) {
        return [];
      }

      // Проверка доступности на дату
      const availabilityMap = await this.checkAvailability(
        vendors.map(v => v.id),
        filters.availableOnDate
      );

      // Обработка каждого вендора
      const matchResults: VendorMatchResult[] = [];

      for (const vendor of vendors) {
        const isAvailable = availabilityMap.get(vendor.id) ?? true;
        
        // Применяем Hard Filters
        const exclusionReason = this.applyHardFilters(vendor, params, categoryBudget, isAvailable);
        
        if (exclusionReason && !options.includeExcluded) {
          continue; // Пропускаем исключённых если не нужно их показывать
        }

        // Рассчитываем Soft Score
        const matchScore = await this.calculateMatchScore(vendor, params, filters, categoryBudget);
        
        // Проверяем минимальный балл
        if (!exclusionReason && matchScore.score < (options.minScore || 0)) {
          continue;
        }

        matchResults.push({
          vendorId: vendor.id,
          matchScore: exclusionReason ? 0 : matchScore.score,
          reasons: matchScore.reasons,
          estimatedPrice: vendor.starting_price ? Number(vendor.starting_price) : undefined,
          availableOnDate: isAvailable,
          excluded: !!exclusionReason,
          exclusionReason: exclusionReason || undefined,
          categoryScores: matchScore.categoryScores,
        });
      }

      // Сортировка: сначала не исключённые, потом по score
      matchResults.sort((a, b) => {
        if (a.excluded !== b.excluded) {
          return a.excluded ? 1 : -1;
        }
        return b.matchScore - a.matchScore;
      });

      // Применяем лимит
      const limitedResults = options.limit 
        ? matchResults.slice(0, options.limit) 
        : matchResults;

      // Кэширование результатов (только не исключённых)
      if (params.weddingPlanId) {
        const toCache = limitedResults.filter(r => !r.excluded).slice(0, 10);
        await this.cacheRecommendations(toCache, params.weddingPlanId, filters.category);
      }

      return limitedResults;
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
   * Проверка доступности вендоров на дату (возвращает Map)
   */
  private static async checkAvailability(
    vendorIds: string[],
    date?: Date
  ): Promise<Map<string, boolean>> {
    const result = new Map<string, boolean>();
    
    // Если дата не указана, все доступны
    if (!date) {
      vendorIds.forEach(id => result.set(id, true));
      return result;
    }

    const { data: unavailable } = await supabase
      .from('vendor_availability')
      .select('vendor_id')
      .in('vendor_id', vendorIds)
      .eq('date', date.toISOString().split('T')[0])
      .eq('is_available', false);

    const unavailableSet = new Set(unavailable?.map(a => a.vendor_id) || []);
    
    vendorIds.forEach(id => {
      result.set(id, !unavailableSet.has(id));
    });

    return result;
  }

  /**
   * Фильтрация по доступности на дату (legacy)
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
   * Расчет score совместимости v2.1 - с учётом отзывов похожих клиентов
   */
  private static async calculateMatchScore(
    vendor: any,
    params: WeddingMatchParams,
    filters: VendorFilters,
    categoryBudget: number
  ): Promise<{ score: number; reasons: MatchReason[]; categoryScores: VendorMatchResult['categoryScores'] }> {
    let totalScore = 0;
    const reasons: MatchReason[] = [];

    // Базовый score за наличие профиля
    totalScore += 5;

    // 1. Совпадение стиля (+15-25 баллов)
    const styleScore = this.calculateStyleScore(vendor, params);
    totalScore += styleScore.score;
    if (styleScore.reason) reasons.push(styleScore.reason);

    // 2. Рейтинг с учётом количества отзывов (+0-25 баллов)
    const ratingScore = this.calculateRatingScore(vendor);
    totalScore += ratingScore.score;
    if (ratingScore.reason) reasons.push(ratingScore.reason);

    // 3. Бюджетное соответствие (+0-20 баллов)
    const budgetScore = this.calculateBudgetScore(vendor, categoryBudget);
    totalScore += budgetScore.score;
    if (budgetScore.reason) reasons.push(budgetScore.reason);

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

    // 6. Опыт работы (+0-10 баллов)
    const experienceScore = this.calculateExperienceScore(vendor);
    totalScore += experienceScore.score;
    if (experienceScore.reason) reasons.push(experienceScore.reason);

    // 7. Бонусы и пакеты (+0-10 баллов)
    const packagesScore = this.calculatePackagesScore(vendor);
    totalScore += packagesScore.score;
    if (packagesScore.reason) reasons.push(packagesScore.reason);

    // 8. Условия работы (+0-5 баллов)
    const termsScore = this.calculateTermsScore(vendor);
    totalScore += termsScore.score;
    if (termsScore.reason) reasons.push(termsScore.reason);

    // 9. Специфичные атрибуты категории
    const categoryScore = this.calculateCategorySpecificScore(vendor, params, filters);
    totalScore += categoryScore.score;
    reasons.push(...categoryScore.reasons);

    return {
      score: Math.min(totalScore, 100),
      reasons: reasons.slice(0, 6), // Топ-6 причин
      categoryScores: {
        style: styleScore.score,
        rating: ratingScore.score,
        budget: budgetScore.score,
        experience: experienceScore.score,
        categorySpecific: categoryScore.score,
        verification: vendor.verified ? 5 : 0,
        packages: packagesScore.score,
        terms: termsScore.score,
      },
    };
  }

  /**
   * Расчёт score за стиль
   */
  private static calculateStyleScore(vendor: any, params: WeddingMatchParams): { score: number; reason?: MatchReason } {
    if (!params.style && !params.styles?.length) return { score: 0 };
    
    const vendorStyles = vendor.styles || [];
    const requestedStyles = params.styles?.length ? params.styles : (params.style ? [params.style] : []);
    
    const matchingStyles = requestedStyles.filter(s => vendorStyles.includes(s));
    
    if (matchingStyles.length > 0) {
      const score = Math.min(25, 15 + matchingStyles.length * 5);
      return {
        score,
        reason: {
          type: 'style',
          score,
          description: `Работает в стиле: ${matchingStyles.join(', ')}`,
        },
      };
    }
    
    // Частичное совпадение стилей
    if (vendorStyles.length > 0) {
      return { score: 5 };
    }
    
    return { score: 0 };
  }

  /**
   * Расчёт score за рейтинг с учётом количества отзывов
   */
  private static calculateRatingScore(vendor: any): { score: number; reason?: MatchReason } {
    if (!vendor.rating || vendor.rating === 0) return { score: 0 };
    
    const rating = Number(vendor.rating);
    const reviewCount = vendor.total_reviews || 0;
    
    // Базовый score за рейтинг (0-15)
    let score = Math.round((rating / 5) * 15);
    
    // Бонус за количество отзывов (0-10)
    // Логарифмическая шкала: 1-5 отзывов = +2, 6-20 = +5, 21-50 = +7, 50+ = +10
    let reviewBonus = 0;
    if (reviewCount >= 50) reviewBonus = 10;
    else if (reviewCount >= 21) reviewBonus = 7;
    else if (reviewCount >= 6) reviewBonus = 5;
    else if (reviewCount >= 1) reviewBonus = 2;
    
    score += reviewBonus;
    
    return {
      score,
      reason: {
        type: 'rating',
        score,
        description: rating >= 4.5 
          ? `Отличный рейтинг ${rating.toFixed(1)}/5 (${reviewCount} отзывов)`
          : `Рейтинг ${rating.toFixed(1)}/5 (${reviewCount} отзывов)`,
      },
    };
  }

  /**
   * Расчёт score за бюджет
   */
  private static calculateBudgetScore(vendor: any, categoryBudget: number): { score: number; reason?: MatchReason } {
    if (categoryBudget <= 0 || !vendor.starting_price) return { score: 0 };
    
    const priceFit = Number(vendor.starting_price) / categoryBudget;
    
    if (priceFit <= 0.8) {
      return {
        score: 15,
        reason: { type: 'budget', score: 15, description: 'Отличная цена, есть запас бюджета' },
      };
    } else if (priceFit <= 1.0) {
      return {
        score: 20,
        reason: { type: 'budget', score: 20, description: 'Идеально вписывается в бюджет' },
      };
    } else if (priceFit <= 1.2) {
      return {
        score: 10,
        reason: { type: 'budget', score: 10, description: 'Чуть выше бюджета, но качественный' },
      };
    }
    
    return { score: 0 };
  }

  /**
   * Расчёт score за опыт
   */
  private static calculateExperienceScore(vendor: any): { score: number; reason?: MatchReason } {
    const years = vendor.experience_years || 0;
    if (years === 0) return { score: 0 };
    
    // 1-2 года = 3, 3-5 = 5, 6-10 = 8, 10+ = 10
    let score = 0;
    let description = '';
    
    if (years >= 10) {
      score = 10;
      description = `${years}+ лет опыта`;
    } else if (years >= 6) {
      score = 8;
      description = `${years} лет опыта`;
    } else if (years >= 3) {
      score = 5;
      description = `${years} года опыта`;
    } else {
      score = 3;
      description = `${years} год опыта`;
    }
    
    return {
      score,
      reason: { type: 'feature', score, description },
    };
  }

  /**
   * Расчёт score за пакеты и бонусы
   */
  private static calculatePackagesScore(vendor: any): { score: number; reason?: MatchReason } {
    let score = 0;
    const features: string[] = [];
    
    // Наличие пакетов
    const packages = vendor.packages as any[] || [];
    if (packages.length > 0) {
      score += 3;
      features.push(`${packages.length} пакетов`);
    }
    
    // Бонусы
    const bonuses = vendor.bonuses as string[] || [];
    if (bonuses.length > 0) {
      score += Math.min(bonuses.length, 4);
      features.push(`${bonuses.length} бонусов`);
    }
    
    // Дополнительные услуги
    const additionalServices = vendor.additional_services as string[] || [];
    if (additionalServices.length > 0) {
      score += Math.min(additionalServices.length, 3);
    }
    
    if (score === 0) return { score: 0 };
    
    return {
      score: Math.min(score, 10),
      reason: {
        type: 'feature',
        score: Math.min(score, 10),
        description: features.length > 0 ? features.join(', ') : 'Расширенный набор услуг',
      },
    };
  }

  /**
   * Расчёт score за условия работы
   */
  private static calculateTermsScore(vendor: any): { score: number; reason?: MatchReason } {
    let score = 0;
    const terms: string[] = [];
    
    // Низкий депозит
    if (vendor.deposit_percentage && vendor.deposit_percentage < 50) {
      score += 2;
      terms.push(`депозит ${vendor.deposit_percentage}%`);
    }
    
    // Гибкая политика отмены
    if (vendor.cancellation_policy) {
      score += 1;
    }
    
    // Быстрая доставка (для фото/видео)
    if (vendor.delivery_time_days && vendor.delivery_time_days <= 14) {
      score += 2;
      terms.push(`готово за ${vendor.delivery_time_days} дней`);
    }
    
    if (score === 0) return { score: 0 };
    
    return {
      score: Math.min(score, 5),
      reason: {
        type: 'feature',
        score: Math.min(score, 5),
        description: terms.length > 0 ? `Выгодные условия: ${terms.join(', ')}` : 'Хорошие условия работы',
      },
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