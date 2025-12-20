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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type VendorCategory = Database['public']['Enums']['vendor_category'];

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

interface VendorProfileFormProps {
  existingProfile?: any;
  onSuccess?: () => void;
}

export function VendorProfileForm({ existingProfile, onSuccess }: VendorProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    // Catering specific
    min_guests: existingProfile?.min_guests || 50,
    max_guests: existingProfile?.max_guests || 500,
    cuisine_types: existingProfile?.cuisine_types || [],
    dietary_options: existingProfile?.dietary_options || [],
    provides_staff: existingProfile?.provides_staff || false,
    // Music specific
    music_genres: existingProfile?.music_genres || [],
    equipment_included: existingProfile?.equipment_included || false,
    // Photo/Video specific
    experience_years: existingProfile?.experience_years || 1,
  });

  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    const current = formData[field] as string[];
    if (current.includes(item)) {
      setFormData({ ...formData, [field]: current.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...current, item] });
    }
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
        capacity_min: formData.category === "venue" ? formData.capacity_min : null,
        capacity_max: formData.category === "venue" ? formData.capacity_max : null,
        has_parking: formData.category === "venue" ? formData.has_parking : null,
        outdoor_available: formData.category === "venue" ? formData.outdoor_available : null,
        min_guests: formData.category === "caterer" ? formData.min_guests : null,
        max_guests: formData.category === "caterer" ? formData.max_guests : null,
        cuisine_types: formData.category === "caterer" ? formData.cuisine_types : [],
        dietary_options: formData.category === "caterer" ? formData.dietary_options : [],
        provides_staff: formData.category === "caterer" ? formData.provides_staff : null,
        music_genres: formData.category === "music" ? formData.music_genres : [],
        equipment_included: formData.category === "music" ? formData.equipment_included : null,
        experience_years: ["photographer", "videographer"].includes(formData.category) ? formData.experience_years : null,
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

  const renderCategoryFields = () => {
    switch (formData.category) {
      case "venue":
        return (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Параметры площадки</h3>
            
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
            
            <div className="grid grid-cols-2 gap-4">
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
            <h3 className="font-medium">Опыт работы</h3>
            
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
          </div>
        );

      default:
        return null;
    }
  };

  return (
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

        <Button 
          className="w-full" 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Сохранение..." : existingProfile ? "Сохранить изменения" : "Создать профиль"}
        </Button>
      </CardContent>
    </Card>
  );
}