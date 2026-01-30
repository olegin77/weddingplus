// Типизация атрибутов вендоров для Smart Matching Engine
// Каждая категория вендоров имеет свой набор специфических характеристик

/**
 * Базовый интерфейс для всех атрибутов вендоров
 */
export interface BaseVendorAttributes {
  verifiedInfo?: boolean;
  emergencyContact?: string;
}

/**
 * Атрибуты для Фотографов
 * Логика: "Стиль + Время работы"
 */
export interface PhotographerAttributes extends BaseVendorAttributes {
  style: 'reportage' | 'fine-art' | 'traditional' | 'dark-moody' | 'romantic' | 'editorial';
  deliversInDays: number; // Сколько дней до получения материалов
  hasDrone: boolean; // Есть ли дрон для аэросъемки
  hasSecondShooter: boolean; // Второй фотограф в команде
  providesAlbum: boolean; // Предоставляет ли печатный альбом
  providesSDE: boolean; // Same Day Edit (монтаж в день свадьбы)
  equipmentBackup: boolean; // Резервное оборудование
  packages: {
    name: string; // Например: "4 часа", "Полный день"
    hours: number;
    price: number;
    includes: string[]; // ["200 обработанных фото", "онлайн галерея"]
  }[];
}

/**
 * Атрибуты для Видеографов
 * Похоже на фотографов, но с видео-специфичными полями
 */
export interface VideographerAttributes extends BaseVendorAttributes {
  style: 'cinematic' | 'documentary' | 'storytelling' | 'music-video';
  deliversInDays: number;
  hasDrone: boolean;
  hasStabilizer: boolean; // Стэдикам/гимбал
  provides4K: boolean;
  providesSDE: boolean;
  packages: {
    name: string;
    hours: number;
    price: number;
    includes: string[]; // ["3-5 мин клип", "полная церемония", "интервью"]
  }[];
}

/**
 * Атрибуты для Декораторов и Флористов
 * Логика: "Локация + Визуализация"
 */
export interface DecoratorAttributes extends BaseVendorAttributes {
  specialty: 'flowers' | 'balloons' | 'structures' | 'textile' | 'lighting' | 'full-decor';
  minBudget: number; // Минимальный заказ
  maxBudget?: number; // Максимальные проекты
  reuseItems: boolean; // Может ли переносить декор (церемония → банкет)
  provides3DVisualization: boolean; // 3D визуализация проекта
  hasOwnInventory: boolean; // Собственный инвентарь (арки, стойки)
  worksWith: string[]; // ["high-ceilings", "outdoor", "historical-venues"]
  servicesIncluded: {
    setup: boolean; // Установка
    teardown: boolean; // Демонтаж
    delivery: boolean;
  };
}

/**
 * Атрибуты для Музыкантов, Ведущих и Шоу
 * Логика: "Вайб + Технический райдер"
 */
export interface MusicianAttributes extends BaseVendorAttributes {
  type: 'dj' | 'live-band' | 'solo' | 'orchestra' | 'duo' | 'traditional';
  genres: string[]; // ['pop', 'jazz', 'national', 'rock', 'classical']
  languages: string[]; // ['russian', 'uzbek', 'english']
  soundEquipmentIncluded: boolean;
  lightingIncluded: boolean;
  technicalRider?: {
    powerRequired: string; // "220V, 3kW"
    spaceRequired: string; // "4x3 метра"
    setupTime: number; // минут
  };
  repertoireSize?: number; // Количество песен в репертуаре
  acceptsRequests: boolean; // Принимает ли заявки на песни
}

/**
 * Атрибуты для Ведущих (Тамада/MC)
 */
export interface HostAttributes extends BaseVendorAttributes {
  languages: string[];
  style: 'traditional' | 'modern' | 'comedy' | 'elegant' | 'bilingual';
  experienceYears: number;
  guestsCapacity: { min: number; max: number };
  includesGames: boolean;
  includesScenarios: boolean; // Готовые сценарии программы
  worksWithDJ: boolean; // Работает в связке с DJ
}

/**
 * Атрибуты для Транспорта
 * Логика: "Логистика + Класс"
 */
export interface TransportAttributes extends BaseVendorAttributes {
  vehicleType: 'sedan' | 'suv' | 'limousine' | 'vintage' | 'minibus' | 'bus' | 'luxury';
  capacity: number; // Количество пассажиров
  year?: number; // Год выпуска (для винтажных авто)
  color?: string;
  features: string[]; // ["кондиционер", "украшение включено", "шампанское"]
  minRentalHours: number;
  includedKilometers?: number; // Включенные км в пакет
  pricePerExtraKm?: number;
  hasDriver: boolean;
  driverLanguages?: string[];
}

/**
 * Атрибуты для Площадок (Venue)
 */
export interface VenueAttributes extends BaseVendorAttributes {
  venueType: 'restaurant' | 'banquet-hall' | 'outdoor' | 'hotel' | 'historical' | 'rooftop';
  capacity: { min: number; max: number };
  cateringIncluded: boolean;
  hasAccommodation: boolean; // Есть ли номера для гостей
  hasParking: boolean;
  parkingCapacity?: number;
  hasOutdoorSpace: boolean;
  restrictions: {
    soundLimit?: string; // "До 23:00" или "без ограничений"
    fireworks?: boolean;
    petFriendly?: boolean;
    alcoholAllowed?: boolean;
  };
  technicalFeatures: {
    hasProjector: boolean;
    hasSound: boolean;
    hasLighting: boolean;
    hasDanceFloor: boolean;
  };
  priceIncludes: string[]; // ["столы", "стулья", "посуда", "текстиль"]
}

/**
 * Атрибуты для Кейтеринга
 */
export interface CateringAttributes extends BaseVendorAttributes {
  cuisineTypes: string[]; // ['uzbek', 'european', 'asian', 'fusion']
  menuTypes: string[]; // ['buffet', 'plated', 'family-style', 'cocktail']
  dietaryOptions: string[]; // ['vegetarian', 'halal', 'gluten-free']
  minGuests: number;
  maxGuests: number;
  pricePerPerson: { min: number; max: number };
  includesStaff: boolean; // Официанты включены
  includesTableware: boolean; // Посуда включена
  tastingAvailable: boolean; // Дегустация доступна
}

/**
 * Атрибуты для Визажистов и Стилистов
 */
export interface BeautyAttributes extends BaseVendorAttributes {
  services: ('makeup' | 'hair' | 'nails' | 'trial')[];
  style: string[]; // ['natural', 'glamour', 'vintage', 'editorial']
  productBrands?: string[]; // Бренды косметики
  travelToClient: boolean; // Выезд к клиенту
  travelRadius?: number; // Радиус выезда в км
  trialIncluded: boolean; // Пробный образ включен в цену
  groupDiscounts: boolean; // Скидки на группу (невеста + подружки)
}

/**
 * Атрибуты для Тортов и Кондитерских
 */
export interface CakeAttributes extends BaseVendorAttributes {
  cakeTypes: string[]; // ['tiered', 'naked', 'cupcakes', 'dessert-bar']
  flavors: string[]; // ['vanilla', 'chocolate', 'red-velvet', 'fruit']
  dietaryOptions: string[]; // ['vegan', 'gluten-free', 'sugar-free']
  minWeight: number; // кг
  pricePerKg: number;
  customDesign: boolean;
  deliveryIncluded: boolean;
  setupIncluded: boolean;
  tastingAvailable: boolean;
}

/**
 * Тип-объединение всех возможных атрибутов
 */
export type VendorAttributes =
  | PhotographerAttributes
  | VideographerAttributes
  | DecoratorAttributes
  | MusicianAttributes
  | HostAttributes
  | TransportAttributes
  | VenueAttributes
  | CateringAttributes
  | BeautyAttributes
  | CakeAttributes;

/**
 * Мап категории вендора к типу атрибутов
 */
export type VendorAttributesMap = {
  photographer: PhotographerAttributes;
  videographer: VideographerAttributes;
  decorator: DecoratorAttributes;
  florist: DecoratorAttributes;
  musician: MusicianAttributes;
  host: HostAttributes;
  transport: TransportAttributes;
  venue: VenueAttributes;
  catering: CateringAttributes;
  makeup_artist: BeautyAttributes;
  cake: CakeAttributes;
};

/**
 * Причины совпадения для мэтчинга
 */
export interface MatchReason {
  type: 'style' | 'budget' | 'availability' | 'language' | 'feature' | 'location' | 'rating' | 'capacity' | 'cuisine' | 'dietary' | 'music' | 'parking' | 'outdoor' | 'experience' | 'verification';
  score: number; // Вклад в общий score (0-100)
  description: string; // Человекочитаемое объяснение
  isPositive?: boolean; // Позитивный или негативный фактор
}

/**
 * Типы жёстких фильтров (причины исключения)
 */
export type HardFilterType =
  | 'capacity_exceeded'   // Вместимость меньше чем гостей
  | 'capacity_too_large'  // Минимум гостей больше чем нужно
  | 'budget_exceeded'     // Цена выше бюджета
  | 'location_mismatch'   // Не работает в нужной локации
  | 'unavailable'         // Занят на дату свадьбы
  | 'min_guests_not_met'  // Не набирается минимум гостей
  | 'capacity_max'        // Alias for capacity check
  | 'capacity_min'        // Alias for min guests
  | 'location'            // Alias for location
  | 'availability';       // Alias for date availability

/**
 * Причина исключения поставщика
 */
export interface ExclusionReason {
  filter: HardFilterType;
  description: string;
  vendorValue?: string | number;
  requiredValue?: string | number;
}

/**
 * Результат мэтчинга вендора
 */
export interface VendorMatchResult {
  vendorId: string;
  matchScore: number; // 0-100
  reasons: MatchReason[];
  estimatedPrice?: number;
  availableOnDate: boolean;
  // Новые поля для hard filters
  excluded?: boolean;
  exclusionReason?: ExclusionReason;
  categoryScores?: {
    style: number;
    rating: number;
    budget: number;
    experience: number;
    categorySpecific: number;
    verification: number;
    packages?: number;
    terms?: number;
  };
}
