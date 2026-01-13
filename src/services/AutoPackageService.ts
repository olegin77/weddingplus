/**
 * AutoPackageService - Автоматический подбор полного комплекта вендоров
 * Оптимизация по бюджету + детальные критерии совместимости
 */

import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { VendorMatchingEngine, type WeddingMatchParams } from "@/lib/matching-engine";
import type { VendorMatchResult } from "@/types/vendor-attributes";

type VendorCategory = Database["public"]["Enums"]["vendor_category"];
type VendorProfile = Database["public"]["Tables"]["vendor_profiles"]["Row"];

/**
 * Конфигурация для подбора комплекта
 */
export interface PackageConfig {
  weddingPlanId: string;
  // Приоритеты оптимизации
  optimizationMode: 'budget' | 'quality' | 'balanced';
  // Обязательные категории
  requiredCategories: VendorCategory[];
  // Опциональные категории (будут включены если бюджет позволяет)
  optionalCategories?: VendorCategory[];
  // Максимальный бюджет
  maxBudget?: number;
  // Минимальный score для вендора
  minMatchScore?: number;
  // Специальные требования
  requirements?: {
    mustHaveDrone?: boolean;
    mustHaveSDE?: boolean;
    mustHaveParking?: boolean;
    mustHaveOutdoor?: boolean;
    mustHaveHalal?: boolean;
    mustHave3DVisualization?: boolean;
  };
}

/**
 * Результат подбора одного вендора в комплекте
 */
export interface PackageVendorResult {
  vendor: VendorProfile;
  matchResult: VendorMatchResult;
  selectedPackage?: {
    name: string;
    price: number;
    includes: string[];
  };
  estimatedPrice: number;
  isOptional: boolean;
  compatibilityNotes: string[];
}

/**
 * Полный результат автоподбора
 */
export interface AutoPackageResult {
  success: boolean;
  vendors: PackageVendorResult[];
  totalPrice: number;
  totalMatchScore: number;
  averageMatchScore: number;
  budgetUsedPercent: number;
  warnings: string[];
  suggestions: string[];
  alternativeOptions: {
    category: VendorCategory;
    alternatives: PackageVendorResult[];
  }[];
}

/**
 * Веса для различных критериев по режиму оптимизации
 */
const OPTIMIZATION_WEIGHTS = {
  budget: {
    price: 0.5,
    matchScore: 0.2,
    rating: 0.2,
    features: 0.1,
  },
  quality: {
    price: 0.1,
    matchScore: 0.3,
    rating: 0.4,
    features: 0.2,
  },
  balanced: {
    price: 0.3,
    matchScore: 0.3,
    rating: 0.25,
    features: 0.15,
  },
};

/**
 * Базовые проценты бюджета по категориям
 */
const BUDGET_PERCENTAGES: Record<VendorCategory, number> = {
  venue: 30,
  caterer: 25,
  photographer: 10,
  videographer: 8,
  music: 5,
  decorator: 7,
  florist: 5,
  makeup: 3,
  transport: 3,
  clothing: 4,
  other: 0,
};

export class AutoPackageService {
  private config: PackageConfig;
  private weddingParams: WeddingMatchParams | null = null;

  constructor(config: PackageConfig) {
    this.config = {
      ...config,
      minMatchScore: config.minMatchScore ?? 30,
      optionalCategories: config.optionalCategories ?? [],
    };
  }

  /**
   * Основной метод подбора комплекта
   */
  async findOptimalPackage(): Promise<AutoPackageResult> {
    try {
      // 1. Загружаем параметры свадьбы
      this.weddingParams = await VendorMatchingEngine.getWeddingParams(this.config.weddingPlanId);
      
      if (!this.weddingParams) {
        return this.createErrorResult("Не найден план свадьбы");
      }

      const maxBudget = this.config.maxBudget ?? this.weddingParams.budget;
      const results: PackageVendorResult[] = [];
      const warnings: string[] = [];
      const suggestions: string[] = [];
      const alternativeOptions: AutoPackageResult["alternativeOptions"] = [];

      // 2. Подбираем вендоров для обязательных категорий
      for (const category of this.config.requiredCategories) {
        const categoryBudget = this.calculateCategoryBudget(category, maxBudget);
        const result = await this.findBestVendorForCategory(category, categoryBudget, false);
        
        if (result) {
          results.push(result);
          
          // Ищем альтернативы
          const alternatives = await this.findAlternatives(category, categoryBudget, result.vendor.id);
          if (alternatives.length > 0) {
            alternativeOptions.push({ category, alternatives });
          }
        } else {
          warnings.push(`Не найден подходящий ${this.getCategoryName(category)}`);
        }
      }

      // 3. Подсчитываем текущие расходы
      let currentTotal = results.reduce((sum, r) => sum + r.estimatedPrice, 0);
      const remainingBudget = maxBudget - currentTotal;

      // 4. Добавляем опциональные категории если бюджет позволяет
      for (const category of this.config.optionalCategories || []) {
        const categoryBudget = Math.min(
          this.calculateCategoryBudget(category, maxBudget),
          remainingBudget * 0.5 // Не более 50% остатка на одну опциональную категорию
        );

        if (categoryBudget > 0) {
          const result = await this.findBestVendorForCategory(category, categoryBudget, true);
          
          if (result && result.estimatedPrice <= remainingBudget) {
            results.push(result);
            currentTotal += result.estimatedPrice;
          }
        }
      }

      // 5. Проверяем совместимость вендоров
      const compatibilityIssues = this.checkCompatibility(results);
      warnings.push(...compatibilityIssues);

      // 6. Генерируем рекомендации
      suggestions.push(...this.generateSuggestions(results, maxBudget, currentTotal));

      // 7. Формируем результат
      const totalMatchScore = results.reduce((sum, r) => sum + r.matchResult.matchScore, 0);
      const averageMatchScore = results.length > 0 ? totalMatchScore / results.length : 0;

      return {
        success: results.length > 0,
        vendors: results,
        totalPrice: currentTotal,
        totalMatchScore,
        averageMatchScore: Math.round(averageMatchScore),
        budgetUsedPercent: Math.round((currentTotal / maxBudget) * 100),
        warnings,
        suggestions,
        alternativeOptions,
      };
    } catch (error) {
      console.error("AutoPackageService error:", error);
      return this.createErrorResult("Ошибка при подборе комплекта");
    }
  }

  /**
   * Поиск лучшего вендора для категории
   */
  private async findBestVendorForCategory(
    category: VendorCategory,
    categoryBudget: number,
    isOptional: boolean
  ): Promise<PackageVendorResult | null> {
    if (!this.weddingParams) return null;

    // Получаем всех подходящих вендоров
    const matches = await VendorMatchingEngine.findMatches(
      { ...this.weddingParams, categoryBudget },
      {
        category,
        location: this.weddingParams.location,
        availableOnDate: this.weddingParams.weddingDate,
        styles: this.weddingParams.styles,
      },
      { includeExcluded: false, limit: 20 }
    );

    if (matches.length === 0) return null;

    // Загружаем профили вендоров
    const vendorIds = matches.map((m) => m.vendorId);
    const { data: vendors } = await supabase
      .from("vendor_profiles")
      .select("*")
      .in("id", vendorIds);

    if (!vendors || vendors.length === 0) return null;

    // Оцениваем и выбираем лучшего
    const weights = OPTIMIZATION_WEIGHTS[this.config.optimizationMode];
    let bestResult: PackageVendorResult | null = null;
    let bestScore = -Infinity;

    for (const vendor of vendors) {
      const match = matches.find((m) => m.vendorId === vendor.id);
      if (!match) continue;

      // Проверяем специальные требования
      if (!this.checkRequirements(vendor)) continue;

      // Вычисляем комплексный score
      const priceScore = this.calculatePriceScore(vendor, categoryBudget);
      const matchScore = match.matchScore / 100;
      const ratingScore = (Number(vendor.rating) || 0) / 5;
      const featureScore = this.calculateFeatureScore(vendor, category);

      const totalScore =
        priceScore * weights.price +
        matchScore * weights.matchScore +
        ratingScore * weights.rating +
        featureScore * weights.features;

      if (totalScore > bestScore) {
        bestScore = totalScore;
        
        // Находим лучший пакет услуг
        const selectedPackage = this.selectBestPackage(vendor, categoryBudget);
        const estimatedPrice = selectedPackage?.price ?? Number(vendor.starting_price) ?? 0;

        bestResult = {
          vendor,
          matchResult: match,
          selectedPackage,
          estimatedPrice,
          isOptional,
          compatibilityNotes: [],
        };
      }
    }

    return bestResult;
  }

  /**
   * Поиск альтернативных вендоров
   */
  private async findAlternatives(
    category: VendorCategory,
    categoryBudget: number,
    excludeVendorId: string
  ): Promise<PackageVendorResult[]> {
    if (!this.weddingParams) return [];

    const matches = await VendorMatchingEngine.findMatches(
      { ...this.weddingParams, categoryBudget },
      {
        category,
        location: this.weddingParams.location,
        availableOnDate: this.weddingParams.weddingDate,
      },
      { includeExcluded: false, limit: 5 }
    );

    const alternativeMatches = matches.filter((m) => m.vendorId !== excludeVendorId);
    if (alternativeMatches.length === 0) return [];

    const vendorIds = alternativeMatches.map((m) => m.vendorId);
    const { data: vendors } = await supabase
      .from("vendor_profiles")
      .select("*")
      .in("id", vendorIds);

    if (!vendors) return [];

    return vendors.slice(0, 3).map((vendor) => {
      const match = alternativeMatches.find((m) => m.vendorId === vendor.id)!;
      const selectedPackage = this.selectBestPackage(vendor, categoryBudget);
      
      return {
        vendor,
        matchResult: match,
        selectedPackage,
        estimatedPrice: selectedPackage?.price ?? Number(vendor.starting_price) ?? 0,
        isOptional: false,
        compatibilityNotes: [],
      };
    });
  }

  /**
   * Выбор лучшего пакета услуг для вендора
   */
  private selectBestPackage(
    vendor: VendorProfile,
    budget: number
  ): PackageVendorResult["selectedPackage"] | undefined {
    const packages = vendor.packages as Array<{
      name: string;
      price: number;
      hours?: number;
      includes?: string[];
    }> | null;

    if (!packages || packages.length === 0) return undefined;

    // Сортируем пакеты по цене
    const sortedPackages = [...packages].sort((a, b) => a.price - b.price);

    // Ищем пакет, который вписывается в бюджет и даёт максимум
    let bestPackage = sortedPackages[0];

    for (const pkg of sortedPackages) {
      if (pkg.price <= budget) {
        bestPackage = pkg;
      } else {
        break;
      }
    }

    return {
      name: bestPackage.name,
      price: bestPackage.price,
      includes: bestPackage.includes || [],
    };
  }

  /**
   * Проверка специальных требований
   */
  private checkRequirements(vendor: VendorProfile): boolean {
    const requirements = this.config.requirements;
    if (!requirements) return true;

    const features = vendor.special_features as Record<string, boolean> | null;
    const attributes = vendor.attributes as Record<string, any> | null;

    if (requirements.mustHaveDrone) {
      const hasDrone = features?.hasDrone || attributes?.hasDrone;
      if (!hasDrone) return false;
    }

    if (requirements.mustHaveSDE) {
      const hasSDE = features?.providesSDE || attributes?.providesSDE;
      if (!hasSDE) return false;
    }

    if (requirements.mustHaveParking && !vendor.has_parking) {
      return false;
    }

    if (requirements.mustHaveOutdoor && !vendor.outdoor_available) {
      return false;
    }

    if (requirements.mustHaveHalal) {
      const hasHalal = vendor.dietary_options?.includes("halal");
      if (!hasHalal) return false;
    }

    if (requirements.mustHave3DVisualization) {
      const has3D = features?.provides3DVisualization || attributes?.provides3DVisualization;
      if (!has3D) return false;
    }

    return true;
  }

  /**
   * Расчёт score по цене (0-1)
   */
  private calculatePriceScore(vendor: VendorProfile, budget: number): number {
    const price = Number(vendor.starting_price) || 0;
    if (price === 0 || budget === 0) return 0.5;

    const ratio = price / budget;
    
    if (ratio <= 0.5) return 1.0; // Очень выгодно
    if (ratio <= 0.8) return 0.9; // Хорошая цена
    if (ratio <= 1.0) return 0.7; // В бюджете
    if (ratio <= 1.2) return 0.4; // Чуть дороже
    return 0.1; // Значительно дороже
  }

  /**
   * Расчёт score по фичам (0-1)
   */
  private calculateFeatureScore(vendor: VendorProfile, category: VendorCategory): number {
    let score = 0;
    let maxScore = 0;

    // Верификация
    maxScore += 1;
    if (vendor.verified) score += 1;

    // Опыт
    maxScore += 1;
    if (vendor.experience_years && vendor.experience_years >= 3) score += 1;

    // Портфолио
    maxScore += 1;
    if (vendor.portfolio_images && vendor.portfolio_images.length >= 5) score += 1;

    // Специфичные для категории
    const features = vendor.special_features as Record<string, boolean> | null;
    
    switch (category) {
      case "photographer":
      case "videographer":
        maxScore += 2;
        if (features?.hasDrone) score += 1;
        if (features?.providesSDE) score += 1;
        break;
      case "venue":
        maxScore += 2;
        if (vendor.has_parking) score += 1;
        if (vendor.outdoor_available) score += 1;
        break;
      case "caterer":
        maxScore += 2;
        if (vendor.dietary_options?.includes("halal")) score += 1;
        if (vendor.provides_staff) score += 1;
        break;
      case "music":
        maxScore += 1;
        if (vendor.equipment_included) score += 1;
        break;
      case "decorator":
      case "florist":
        maxScore += 1;
        if (features?.provides3DVisualization) score += 1;
        break;
    }

    return maxScore > 0 ? score / maxScore : 0.5;
  }

  /**
   * Проверка совместимости вендоров
   */
  private checkCompatibility(vendors: PackageVendorResult[]): string[] {
    const warnings: string[] = [];
    
    const venue = vendors.find((v) => v.vendor.category === "venue");
    const caterer = vendors.find((v) => v.vendor.category === "caterer");
    const music = vendors.find((v) => v.vendor.category === "music");

    // Проверка совместимости кейтеринга и площадки
    if (venue && caterer) {
      const venueCapacity = venue.vendor.capacity_max || 0;
      const catererMax = caterer.vendor.max_guests || Infinity;
      
      if (catererMax < venueCapacity * 0.8) {
        warnings.push(
          `Кейтеринг может обслужить меньше гостей (${catererMax}), чем вмещает площадка (${venueCapacity})`
        );
      }
    }

    // Проверка ограничений по звуку
    if (venue && music) {
      const restrictions = venue.vendor.venue_restrictions as Record<string, any> | null;
      if (restrictions?.soundLimit) {
        warnings.push(`У площадки есть ограничение по звуку: ${restrictions.soundLimit}`);
      }
    }

    // Проверка локаций
    const locations = new Set(
      vendors.map((v) => v.vendor.location).filter(Boolean)
    );
    if (locations.size > 1) {
      warnings.push("Вендоры из разных городов - проверьте логистику");
    }

    return warnings;
  }

  /**
   * Генерация рекомендаций
   */
  private generateSuggestions(
    vendors: PackageVendorResult[],
    maxBudget: number,
    currentTotal: number
  ): string[] {
    const suggestions: string[] = [];
    const remainingBudget = maxBudget - currentTotal;
    const remainingPercent = (remainingBudget / maxBudget) * 100;

    if (remainingPercent > 20) {
      suggestions.push(
        `Остаётся ${Math.round(remainingPercent)}% бюджета (${this.formatPrice(remainingBudget)}) - можно добавить дополнительные услуги`
      );
    }

    // Проверяем наличие определённых категорий
    const hasCategories = new Set(vendors.map((v) => v.vendor.category));
    
    if (!hasCategories.has("videographer") && remainingBudget > 5000000) {
      suggestions.push("Рекомендуем добавить видеографа для полноценной съёмки");
    }

    if (!hasCategories.has("decorator") && remainingBudget > 3000000) {
      suggestions.push("Декоратор поможет создать уникальную атмосферу");
    }

    // Проверяем качество подобранных вендоров
    const lowScoreVendors = vendors.filter(
      (v) => v.matchResult.matchScore < 50 && !v.isOptional
    );
    
    if (lowScoreVendors.length > 0) {
      suggestions.push(
        `Для ${lowScoreVendors.map((v) => this.getCategoryName(v.vendor.category as VendorCategory)).join(", ")} рекомендуем рассмотреть альтернативы`
      );
    }

    return suggestions;
  }

  /**
   * Расчёт бюджета для категории
   */
  private calculateCategoryBudget(category: VendorCategory, totalBudget: number): number {
    const percentage = BUDGET_PERCENTAGES[category] || 5;
    const priority = this.weddingParams?.priorities?.[category] || "medium";
    
    const multiplier = priority === "high" ? 1.5 : priority === "low" ? 0.7 : 1;
    
    return Math.round(totalBudget * (percentage / 100) * multiplier);
  }

  /**
   * Получить название категории
   */
  private getCategoryName(category: VendorCategory): string {
    const names: Record<VendorCategory, string> = {
      venue: "Площадка",
      caterer: "Кейтеринг",
      photographer: "Фотограф",
      videographer: "Видеограф",
      florist: "Флорист",
      decorator: "Декоратор",
      music: "Музыка",
      makeup: "Визажист",
      transport: "Транспорт",
      clothing: "Наряды",
      other: "Другое",
    };
    return names[category] || category;
  }

  /**
   * Форматирование цены
   */
  private formatPrice(price: number): string {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} млн сум`;
    }
    if (price >= 1000) {
      return `${Math.round(price / 1000)} тыс сум`;
    }
    return `${price} сум`;
  }

  /**
   * Создание результата с ошибкой
   */
  private createErrorResult(message: string): AutoPackageResult {
    return {
      success: false,
      vendors: [],
      totalPrice: 0,
      totalMatchScore: 0,
      averageMatchScore: 0,
      budgetUsedPercent: 0,
      warnings: [message],
      suggestions: [],
      alternativeOptions: [],
    };
  }
}

/**
 * Хелпер для быстрого подбора
 */
export async function findAutoPackage(
  weddingPlanId: string,
  mode: 'budget' | 'quality' | 'balanced' = 'balanced'
): Promise<AutoPackageResult> {
  const service = new AutoPackageService({
    weddingPlanId,
    optimizationMode: mode,
    requiredCategories: ['venue', 'caterer', 'photographer', 'music'],
    optionalCategories: ['videographer', 'decorator', 'florist', 'makeup', 'transport'],
  });
  
  return service.findOptimalPackage();
}
