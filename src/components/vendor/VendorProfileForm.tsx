import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { Plus, Trash2, ChevronDown, Package, Gift, Sparkles, DollarSign } from "lucide-react";

type VendorCategory = Database['public']['Enums']['vendor_category'];

interface ServicePackage {
  name: string;
  price: number;
  hours?: number;
  includes: string[];
  description?: string;
}

interface SpecialFeatures {
  hasDrone?: boolean;
  providesSDE?: boolean;
  provides3DVisualization?: boolean;
  hasPhotoZone?: boolean;
  providesAlbum?: boolean;
  providesRawFiles?: boolean;
  hasLiveMusic?: boolean;
  providesLighting?: boolean;
  providesProjector?: boolean;
  hasVIPRoom?: boolean;
  providesDecorSetup?: boolean;
  hasWeddingCoordinator?: boolean;
}

const categories: { id: VendorCategory; label: string }[] = [
  { id: "venue", label: "Площадка (Тойхона)" },
  { id: "caterer", label: "Кейтеринг" },
  { id: "photographer", label: "Фотограф" },
  { id: "videographer", label: "Видеограф" },
  { id: "florist", label: "Флорист" },
  { id: "decorator", label: "Декоратор" },
  { id: "music", label: "Музыка / DJ" },
  { id: "makeup", label: "Визажист" },
  { id: "transport", label: "Транспорт" },
  { id: "clothing", label: "Наряды" },
];

const cities = [
  "Ташкент", "Самарканд", "Бухара", "Хива", "Наманган", 
  "Андижан", "Фергана", "Нукус", "Карши", "Термез"
];

const styleOptions = [
  "classic", "modern", "rustic", "traditional", "bohemian", "glamorous", "minimalist", "romantic"
];

const cuisineOptions = [
  { id: "uzbek", label: "Узбекская" },
  { id: "european", label: "Европейская" },
  { id: "asian", label: "Азиатская" },
  { id: "fusion", label: "Фьюжн" },
  { id: "international", label: "Международная" },
];

const dietaryOptions = [
  { id: "halal", label: "Халяль" },
  { id: "vegetarian", label: "Вегетарианское" },
  { id: "vegan", label: "Веганское" },
  { id: "gluten-free", label: "Без глютена" },
];

const musicGenreOptions = [
  { id: "pop", label: "Поп" },
  { id: "national", label: "Национальная" },
  { id: "jazz", label: "Джаз" },
  { id: "rock", label: "Рок" },
  { id: "classical", label: "Классическая" },
  { id: "electronic", label: "Электронная" },
];

// Специальные фичи по категориям
const SPECIAL_FEATURES_BY_CATEGORY: Record<VendorCategory, { id: keyof SpecialFeatures; label: string; description: string }[]> = {
  photographer: [
    { id: "hasDrone", label: "Съёмка с дрона", description: "Аэросъёмка квадрокоптером" },
    { id: "providesSDE", label: "SDE (Same Day Edit)", description: "Монтаж клипа в день свадьбы" },
    { id: "providesAlbum", label: "Фотоальбом", description: "Печать свадебного альбома" },
    { id: "providesRawFiles", label: "RAW файлы", description: "Исходники для самостоятельной обработки" },
    { id: "hasPhotoZone", label: "Фотозона", description: "Организация фотозоны на площадке" },
  ],
  videographer: [
    { id: "hasDrone", label: "Съёмка с дрона", description: "Аэросъёмка квадрокоптером" },
    { id: "providesSDE", label: "SDE (Same Day Edit)", description: "Монтаж клипа в день свадьбы" },
    { id: "providesRawFiles", label: "RAW файлы", description: "Исходники для самостоятельной обработки" },
  ],
  venue: [
    { id: "hasVIPRoom", label: "VIP комната", description: "Отдельная комната для молодожёнов" },
    { id: "hasPhotoZone", label: "Фотозона", description: "Оборудованная фотозона" },
    { id: "hasWeddingCoordinator", label: "Координатор", description: "Свадебный координатор включён" },
    { id: "providesProjector", label: "Проектор/Экран", description: "AV оборудование в зале" },
  ],
  decorator: [
    { id: "provides3DVisualization", label: "3D визуализация", description: "Предварительная 3D модель декора" },
    { id: "providesDecorSetup", label: "Монтаж/демонтаж", description: "Установка и уборка декора" },
    { id: "hasPhotoZone", label: "Фотозона", description: "Создание фотозоны" },
  ],
  florist: [
    { id: "provides3DVisualization", label: "3D визуализация", description: "Предварительная визуализация" },
    { id: "providesDecorSetup", label: "Установка", description: "Доставка и установка" },
  ],
  music: [
    { id: "hasLiveMusic", label: "Живая музыка", description: "Живое исполнение" },
    { id: "providesLighting", label: "Световое шоу", description: "Профессиональное освещение" },
    { id: "providesProjector", label: "Проектор/Экран", description: "Видеопроекция включена" },
  ],
  caterer: [],
  makeup: [],
  transport: [],
  clothing: [],
  other: [],
};

// Бонусы по категориям
const BONUS_OPTIONS_BY_CATEGORY: Record<VendorCategory, { id: string; label: string }[]> = {
  photographer: [
    { id: "free_engagement", label: "Бесплатная Love Story съёмка" },
    { id: "second_shooter", label: "Второй фотограф бесплатно" },
    { id: "extra_hours", label: "+2 часа бесплатно" },
    { id: "printed_photos", label: "50 напечатанных фото" },
    { id: "online_gallery", label: "Онлайн галерея" },
  ],
  videographer: [
    { id: "teaser", label: "Тизер в подарок" },
    { id: "second_camera", label: "Вторая камера бесплатно" },
    { id: "extra_hours", label: "+2 часа бесплатно" },
    { id: "instagram_cut", label: "Монтаж для Instagram" },
    { id: "usb_box", label: "USB в подарочной коробке" },
  ],
  venue: [
    { id: "free_decoration", label: "Базовый декор в подарок" },
    { id: "bridal_suite", label: "Комната невесты бесплатно" },
    { id: "extended_hours", label: "+2 часа аренды" },
    { id: "free_parking", label: "Бесплатная парковка" },
    { id: "sound_system", label: "Звуковая система включена" },
  ],
  caterer: [
    { id: "free_cake", label: "Свадебный торт в подарок" },
    { id: "champagne", label: "Шампанское для тоста" },
    { id: "kids_menu", label: "Детское меню бесплатно" },
    { id: "extra_staff", label: "Доп. официант бесплатно" },
    { id: "tasting", label: "Бесплатная дегустация" },
  ],
  decorator: [
    { id: "free_consultation", label: "Бесплатная консультация" },
    { id: "photo_zone", label: "Фотозона в подарок" },
    { id: "candles", label: "Свечи включены" },
    { id: "table_numbers", label: "Номерки на столы" },
  ],
  florist: [
    { id: "free_boutonniere", label: "Бутоньерка жениха в подарок" },
    { id: "free_delivery", label: "Бесплатная доставка" },
    { id: "extra_bouquet", label: "Дублёр букета" },
    { id: "flower_arch", label: "Скидка на арку" },
  ],
  music: [
    { id: "extra_hour", label: "+1 час бесплатно" },
    { id: "microphones", label: "Доп. микрофоны включены" },
    { id: "special_effects", label: "Спецэффекты в подарок" },
    { id: "playlist", label: "Индивидуальный плейлист" },
  ],
  makeup: [
    { id: "trial", label: "Бесплатная репетиция" },
    { id: "touch_up", label: "Коррекция макияжа включена" },
    { id: "accessories", label: "Украшения для причёски" },
  ],
  transport: [
    { id: "decoration", label: "Украшение авто включено" },
    { id: "champagne", label: "Шампанское в машине" },
    { id: "extra_hour", label: "+1 час бесплатно" },
  ],
  clothing: [
    { id: "alterations", label: "Подгонка включена" },
    { id: "cleaning", label: "Химчистка после" },
    { id: "accessories", label: "Аксессуары в подарок" },
  ],
  other: [],
};

interface VendorProfileFormProps {
  existingProfile?: any;
  onSuccess?: () => void;
}

export function VendorProfileForm({ existingProfile, onSuccess }: VendorProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);
  const [bonusesOpen, setBonusesOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    business_name: existingProfile?.business_name || "",
    category: (existingProfile?.category as VendorCategory) || "venue",
    description: existingProfile?.description || "",
    location: existingProfile?.location || "",
    service_area: existingProfile?.service_area || [],
    starting_price: existingProfile?.starting_price || 0,
    price_range_min: existingProfile?.price_range_min || 0,
    price_range_max: existingProfile?.price_range_max || 0,
    styles: existingProfile?.styles || [],
    languages: existingProfile?.languages || ["russian"],
    // Venue specific
    capacity_min: existingProfile?.capacity_min || 50,
    capacity_max: existingProfile?.capacity_max || 200,
    has_parking: existingProfile?.has_parking || false,
    outdoor_available: existingProfile?.outdoor_available || false,
    venue_type: existingProfile?.venue_type || "",
    // Catering specific
    min_guests: existingProfile?.min_guests || 50,
    max_guests: existingProfile?.max_guests || 500,
    cuisine_types: existingProfile?.cuisine_types || [],
    dietary_options: existingProfile?.dietary_options || [],
    provides_staff: existingProfile?.provides_staff || false,
    price_per_guest: existingProfile?.price_per_guest || 0,
    // Music specific
    music_genres: existingProfile?.music_genres || [],
    equipment_included: existingProfile?.equipment_included || false,
    min_booking_hours: existingProfile?.min_booking_hours || 4,
    // Photo/Video specific
    experience_years: existingProfile?.experience_years || 1,
    delivery_time_days: existingProfile?.delivery_time_days || 30,
    // New fields
    packages: (existingProfile?.packages as ServicePackage[]) || [],
    bonuses: existingProfile?.bonuses || [],
    special_features: (existingProfile?.special_features as SpecialFeatures) || {},
    certifications: existingProfile?.certifications || [],
    deposit_percentage: existingProfile?.deposit_percentage || 50,
    cancellation_policy: existingProfile?.cancellation_policy || "",
    additional_services: existingProfile?.additional_services || [],
  });

  // Добавить новый пакет
  const addPackage = () => {
    setFormData({
      ...formData,
      packages: [...formData.packages, { name: "", price: 0, hours: 0, includes: [], description: "" }],
    });
  };

  // Обновить пакет
  const updatePackage = (index: number, field: keyof ServicePackage, value: any) => {
    const updated = [...formData.packages];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, packages: updated });
  };

  // Удалить пакет
  const removePackage = (index: number) => {
    setFormData({
      ...formData,
      packages: formData.packages.filter((_, i) => i !== index),
    });
  };

  // Добавить/удалить включённую услугу в пакет
  const togglePackageInclude = (packageIndex: number, item: string) => {
    const pkg = formData.packages[packageIndex];
    const includes = pkg.includes.includes(item)
      ? pkg.includes.filter((i) => i !== item)
      : [...pkg.includes, item];
    updatePackage(packageIndex, "includes", includes);
  };

  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    const current = formData[field] as string[];
    if (current.includes(item)) {
      setFormData({ ...formData, [field]: current.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...current, item] });
    }
  };

  const toggleSpecialFeature = (featureId: keyof SpecialFeatures) => {
    setFormData({
      ...formData,
      special_features: {
        ...formData.special_features,
        [featureId]: !formData.special_features[featureId],
      },
    });
  };

  const handleSubmit = async () => {
    if (!formData.business_name || !formData.category) {
      toast.error("Заполните обязательные поля");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Войдите в систему");
        return;
      }

      const profileData = {
        user_id: user.id,
        business_name: formData.business_name,
        category: formData.category,
        description: formData.description,
        location: formData.location,
        service_area: formData.service_area,
        starting_price: formData.starting_price,
        price_range_min: formData.price_range_min,
        price_range_max: formData.price_range_max,
        styles: formData.styles,
        languages: formData.languages,
        // Venue
        capacity_min: formData.category === "venue" ? formData.capacity_min : null,
        capacity_max: formData.category === "venue" ? formData.capacity_max : null,
        has_parking: formData.category === "venue" ? formData.has_parking : null,
        outdoor_available: formData.category === "venue" ? formData.outdoor_available : null,
        venue_type: formData.category === "venue" ? formData.venue_type : null,
        // Catering
        min_guests: formData.category === "caterer" ? formData.min_guests : null,
        max_guests: formData.category === "caterer" ? formData.max_guests : null,
        cuisine_types: formData.category === "caterer" ? formData.cuisine_types : [],
        dietary_options: formData.category === "caterer" ? formData.dietary_options : [],
        provides_staff: formData.category === "caterer" ? formData.provides_staff : null,
        price_per_guest: formData.category === "caterer" ? formData.price_per_guest : null,
        // Music
        music_genres: formData.category === "music" ? formData.music_genres : [],
        equipment_included: formData.category === "music" ? formData.equipment_included : null,
        min_booking_hours: formData.category === "music" ? formData.min_booking_hours : null,
        // Photo/Video
        experience_years: ["photographer", "videographer"].includes(formData.category) ? formData.experience_years : null,
        delivery_time_days: ["photographer", "videographer"].includes(formData.category) ? formData.delivery_time_days : null,
        // New fields - cast to Json for Supabase compatibility
        packages: formData.packages as unknown as Database["public"]["Tables"]["vendor_profiles"]["Update"]["packages"],
        bonuses: formData.bonuses,
        special_features: formData.special_features as unknown as Database["public"]["Tables"]["vendor_profiles"]["Update"]["special_features"],
        certifications: formData.certifications,
        deposit_percentage: formData.deposit_percentage,
        cancellation_policy: formData.cancellation_policy,
        additional_services: formData.additional_services,
      };

      if (existingProfile?.id) {
        const { error } = await supabase
          .from("vendor_profiles")
          .update(profileData)
          .eq("id", existingProfile.id);
        
        if (error) throw error;
        toast.success("Профиль обновлён");
      } else {
        const { error } = await supabase
          .from("vendor_profiles")
          .insert(profileData);
        
        if (error) throw error;
        toast.success("Профиль создан");
      }

      onSuccess?.();
    } catch (error: any) {
      console.error("Error saving vendor profile:", error);
      toast.error(error.message || "Ошибка сохранения");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Рендер секции пакетов услуг
  const renderPackagesSection = () => (
    <Collapsible open={packagesOpen} onOpenChange={setPackagesOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Пакеты услуг</CardTitle>
                {formData.packages.length > 0 && (
                  <Badge variant="secondary">{formData.packages.length}</Badge>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${packagesOpen ? 'rotate-180' : ''}`} />
            </div>
            <CardDescription>Создайте пакеты с разной ценой и составом услуг</CardDescription>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            {formData.packages.map((pkg, index) => (
              <Card key={index} className="border-dashed">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Пакет #{index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePackage(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Название</Label>
                      <Input
                        value={pkg.name}
                        onChange={(e) => updatePackage(index, "name", e.target.value)}
                        placeholder="Стандарт / Премиум / VIP"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Цена (сум)</Label>
                      <Input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => updatePackage(index, "price", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  
                  {["photographer", "videographer", "music"].includes(formData.category) && (
                    <div className="space-y-1">
                      <Label className="text-xs">Часов работы</Label>
                      <Input
                        type="number"
                        value={pkg.hours || 0}
                        onChange={(e) => updatePackage(index, "hours", Number(e.target.value))}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Описание</Label>
                    <Textarea
                      value={pkg.description || ""}
                      onChange={(e) => updatePackage(index, "description", e.target.value)}
                      placeholder="Краткое описание пакета..."
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Что включено</Label>
                    <div className="flex flex-wrap gap-1">
                      {pkg.includes.map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs gap-1">
                          {item}
                          <button
                            type="button"
                            className="ml-1 hover:text-destructive"
                            onClick={() => togglePackageInclude(index, item)}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Добавить услугу..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const input = e.target as HTMLInputElement;
                            if (input.value.trim()) {
                              togglePackageInclude(index, input.value.trim());
                              input.value = "";
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button variant="outline" className="w-full gap-2" onClick={addPackage}>
              <Plus className="h-4 w-4" />
              Добавить пакет
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );

  // Рендер секции бонусов
  const renderBonusesSection = () => {
    const categoryBonuses = BONUS_OPTIONS_BY_CATEGORY[formData.category] || [];
    if (categoryBonuses.length === 0) return null;

    return (
      <Collapsible open={bonusesOpen} onOpenChange={setBonusesOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Бонусы и подарки</CardTitle>
                  {formData.bonuses.length > 0 && (
                    <Badge variant="secondary">{formData.bonuses.length}</Badge>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${bonusesOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>Что вы дарите клиентам дополнительно</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-2">
                {categoryBonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.bonuses.includes(bonus.id)
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:bg-muted/50"
                    }`}
                    onClick={() => toggleArrayItem("bonuses", bonus.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={formData.bonuses.includes(bonus.id)} />
                      <span className="text-sm">{bonus.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  // Рендер секции специальных фич
  const renderSpecialFeaturesSection = () => {
    const categoryFeatures = SPECIAL_FEATURES_BY_CATEGORY[formData.category] || [];
    if (categoryFeatures.length === 0) return null;

    return (
      <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Специальные возможности</CardTitle>
                  {Object.values(formData.special_features).filter(Boolean).length > 0 && (
                    <Badge variant="secondary">
                      {Object.values(formData.special_features).filter(Boolean).length}
                    </Badge>
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>Особые услуги и возможности, выделяющие вас</CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {categoryFeatures.map((feature) => (
                <div
                  key={feature.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <div className="font-medium text-sm">{feature.label}</div>
                    <div className="text-xs text-muted-foreground">{feature.description}</div>
                  </div>
                  <Switch
                    checked={formData.special_features[feature.id] || false}
                    onCheckedChange={() => toggleSpecialFeature(feature.id)}
                  />
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  // Рендер секции условий бронирования
  const renderBookingTermsSection = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Условия бронирования</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Предоплата (%)</Label>
            <div className="flex items-center gap-3">
              <Slider
                value={[formData.deposit_percentage]}
                onValueChange={([val]) => setFormData({ ...formData, deposit_percentage: val })}
                min={0}
                max={100}
                step={10}
                className="flex-1"
              />
              <span className="w-12 text-right font-medium">{formData.deposit_percentage}%</span>
            </div>
          </div>
          
          {["photographer", "videographer"].includes(formData.category) && (
            <div className="space-y-2">
              <Label>Срок сдачи (дней)</Label>
              <Input
                type="number"
                value={formData.delivery_time_days}
                onChange={(e) => setFormData({ ...formData, delivery_time_days: Number(e.target.value) })}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Политика отмены</Label>
          <Textarea
            value={formData.cancellation_policy}
            onChange={(e) => setFormData({ ...formData, cancellation_policy: e.target.value })}
            placeholder="Опишите условия отмены бронирования..."
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );

  const renderCategoryFields = () => {
    switch (formData.category) {
      case "venue":
        return (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Параметры площадки</h3>
            
            <div className="space-y-2">
              <Label>Тип площадки</Label>
              <Select
                value={formData.venue_type}
                onValueChange={(value) => setFormData({ ...formData, venue_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toyxona">Тойхона</SelectItem>
                  <SelectItem value="restaurant">Ресторан</SelectItem>
                  <SelectItem value="hotel">Отель</SelectItem>
                  <SelectItem value="outdoor">Открытая площадка</SelectItem>
                  <SelectItem value="loft">Лофт</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Мин. вместимость</Label>
                <Input
                  type="number"
                  value={formData.capacity_min}
                  onChange={(e) => setFormData({ ...formData, capacity_min: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Макс. вместимость</Label>
                <Input
                  type="number"
                  value={formData.capacity_max}
                  onChange={(e) => setFormData({ ...formData, capacity_max: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="parking"
                checked={formData.has_parking}
                onCheckedChange={(checked) => setFormData({ ...formData, has_parking: checked as boolean })}
              />
              <Label htmlFor="parking">Есть парковка</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="outdoor"
                checked={formData.outdoor_available}
                onCheckedChange={(checked) => setFormData({ ...formData, outdoor_available: checked as boolean })}
              />
              <Label htmlFor="outdoor">Есть открытое пространство</Label>
            </div>
          </div>
        );

      case "caterer":
        return (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Параметры кейтеринга</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Мин. гостей</Label>
                <Input
                  type="number"
                  value={formData.min_guests}
                  onChange={(e) => setFormData({ ...formData, min_guests: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Макс. гостей</Label>
                <Input
                  type="number"
                  value={formData.max_guests}
                  onChange={(e) => setFormData({ ...formData, max_guests: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Цена за гостя</Label>
                <Input
                  type="number"
                  value={formData.price_per_guest}
                  onChange={(e) => setFormData({ ...formData, price_per_guest: Number(e.target.value) })}
                  placeholder="сум"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Типы кухни</Label>
              <div className="flex flex-wrap gap-2">
                {cuisineOptions.map((cuisine) => (
                  <Badge
                    key={cuisine.id}
                    variant={formData.cuisine_types.includes(cuisine.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("cuisine_types", cuisine.id)}
                  >
                    {cuisine.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Диетические опции</Label>
              <div className="flex flex-wrap gap-2">
                {dietaryOptions.map((option) => (
                  <Badge
                    key={option.id}
                    variant={formData.dietary_options.includes(option.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("dietary_options", option.id)}
                  >
                    {option.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="staff"
                checked={formData.provides_staff}
                onCheckedChange={(checked) => setFormData({ ...formData, provides_staff: checked as boolean })}
              />
              <Label htmlFor="staff">Предоставляем персонал (официанты)</Label>
            </div>
          </div>
        );

      case "music":
        return (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Параметры музыки</h3>
            
            <div className="space-y-2">
              <Label>Жанры</Label>
              <div className="flex flex-wrap gap-2">
                {musicGenreOptions.map((genre) => (
                  <Badge
                    key={genre.id}
                    variant={formData.music_genres.includes(genre.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("music_genres", genre.id)}
                  >
                    {genre.label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Мин. часов бронирования: {formData.min_booking_hours}</Label>
              <Slider
                value={[formData.min_booking_hours]}
                onValueChange={(val) => setFormData({ ...formData, min_booking_hours: val[0] })}
                min={1}
                max={12}
                step={1}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="equipment"
                checked={formData.equipment_included}
                onCheckedChange={(checked) => setFormData({ ...formData, equipment_included: checked as boolean })}
              />
              <Label htmlFor="equipment">Звуковое оборудование включено</Label>
            </div>
          </div>
        );

      case "photographer":
      case "videographer":
        return (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Параметры {formData.category === "photographer" ? "фотографа" : "видеографа"}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Лет опыта: {formData.experience_years}</Label>
                <Slider
                  value={[formData.experience_years]}
                  onValueChange={(val) => setFormData({ ...formData, experience_years: val[0] })}
                  min={1}
                  max={20}
                  step={1}
                />
              </div>
              <div className="space-y-2">
                <Label>Срок сдачи материалов (дней)</Label>
                <Input
                  type="number"
                  value={formData.delivery_time_days}
                  onChange={(e) => setFormData({ ...formData, delivery_time_days: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{existingProfile ? "Редактировать профиль" : "Создать профиль поставщика"}</CardTitle>
          <CardDescription>
            Заполните информацию о ваших услугах для лучшего подбора клиентов
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Название бизнеса *</Label>
              <Input
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Например: Grand Palace Wedding Hall"
              />
            </div>

            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as VendorCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Расскажите о ваших услугах..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Город</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите город" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Зона обслуживания</Label>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Badge
                    key={city}
                    variant={formData.service_area.includes(city) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayItem("service_area", city)}
                  >
                    {city}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Цены</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Стартовая цена</Label>
                <Input
                  type="number"
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: Number(e.target.value) })}
                  placeholder="сум"
                />
              </div>
              <div className="space-y-2">
                <Label>Мин. цена</Label>
                <Input
                  type="number"
                  value={formData.price_range_min}
                  onChange={(e) => setFormData({ ...formData, price_range_min: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Макс. цена</Label>
                <Input
                  type="number"
                  value={formData.price_range_max}
                  onChange={(e) => setFormData({ ...formData, price_range_max: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Styles */}
          <div className="space-y-2 border-t pt-4">
            <Label>Стили работы</Label>
            <div className="flex flex-wrap gap-2">
              {styleOptions.map((style) => (
                <Badge
                  key={style}
                  variant={formData.styles.includes(style) ? "default" : "outline"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleArrayItem("styles", style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category-specific fields */}
          {renderCategoryFields()}
        </CardContent>
      </Card>

      {/* Пакеты услуг */}
      {renderPackagesSection()}

      {/* Бонусы */}
      {renderBonusesSection()}

      {/* Специальные возможности */}
      {renderSpecialFeaturesSection()}

      {/* Условия бронирования */}
      {renderBookingTermsSection()}

      {/* Submit */}
      <Button 
        className="w-full h-12 text-lg" 
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Сохранение..." : existingProfile ? "Сохранить изменения" : "Создать профиль"}
      </Button>
    </div>
  );
}