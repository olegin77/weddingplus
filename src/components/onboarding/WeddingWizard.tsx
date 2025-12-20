import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Check, Heart, ArrowRight, ArrowLeft, Users, Wallet, Utensils, Music, Camera, Sparkles, Car, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TOTAL_STEPS = 12;

const vibes = [
  { id: "classic", label: "Классическая", description: "Элегантность, розы, смокинги" },
  { id: "rustic", label: "Рустик", description: "Амбары, дерево, полевые цветы" },
  { id: "modern", label: "Современная", description: "Минимализм, городские площадки" },
  { id: "traditional", label: "Традиционная", description: "Национальные обычаи и стиль" },
  { id: "bohemian", label: "Бохо", description: "Природа, свобода, творчество" },
  { id: "glamorous", label: "Гламур", description: "Роскошь, блеск, шик" },
];

const venueTypes = [
  { id: "restaurant", label: "Ресторан" },
  { id: "banquet-hall", label: "Тойхона" },
  { id: "hotel", label: "Отель" },
  { id: "outdoor", label: "Открытая площадка" },
  { id: "historical", label: "Историческое место" },
  { id: "rooftop", label: "Крыша/терраса" },
];

const cuisineTypes = [
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
  { id: "lactose-free", label: "Без лактозы" },
];

const musicGenres = [
  { id: "pop", label: "Поп" },
  { id: "national", label: "Национальная" },
  { id: "jazz", label: "Джаз" },
  { id: "rock", label: "Рок" },
  { id: "classical", label: "Классическая" },
  { id: "electronic", label: "Электронная" },
  { id: "rnb", label: "R&B/Soul" },
];

const musicTypes = [
  { id: "dj", label: "DJ" },
  { id: "live-band", label: "Живая группа" },
  { id: "both", label: "DJ + Живая музыка" },
  { id: "traditional", label: "Традиционные музыканты" },
];

const photoStyles = [
  { id: "reportage", label: "Репортаж" },
  { id: "fine-art", label: "Fine Art" },
  { id: "traditional", label: "Постановочная" },
  { id: "documentary", label: "Документальная" },
  { id: "romantic", label: "Романтичная" },
];

const programElements = [
  { id: "first-dance", label: "Первый танец" },
  { id: "cake-cutting", label: "Торт" },
  { id: "bouquet-toss", label: "Бросание букета" },
  { id: "games", label: "Конкурсы и игры" },
  { id: "live-performance", label: "Живое выступление" },
  { id: "fireworks", label: "Салют/фейерверк" },
  { id: "photo-booth", label: "Фотозона" },
];

const categoryPriorities = [
  { id: "venue", label: "Площадка", icon: "🏛️" },
  { id: "catering", label: "Кейтеринг", icon: "🍽️" },
  { id: "photography", label: "Фото/Видео", icon: "📸" },
  { id: "music", label: "Музыка", icon: "🎵" },
  { id: "decoration", label: "Декор", icon: "💐" },
  { id: "attire", label: "Наряды", icon: "👗" },
];

const cities = [
  "Ташкент", "Самарканд", "Бухара", "Хива", "Наманган", 
  "Андижан", "Фергана", "Нукус", "Карши", "Термез"
];

export default function WeddingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Date & Location
    date: undefined as Date | undefined,
    city: "",
    
    // Step 2: Guests
    guests: [150],
    
    // Step 3: Budget
    budgetTotal: [50000000],
    
    // Step 4: Budget Breakdown (priorities)
    categoryPriorities: {} as Record<string, 'high' | 'medium' | 'low'>,
    
    // Step 5: Style
    vibe: "",
    
    // Step 6: Venue Preferences
    venueType: "",
    outdoorPreference: false,
    parkingNeeded: true,
    
    // Step 7: Cuisine
    cuisinePreferences: [] as string[],
    
    // Step 8: Dietary Requirements
    dietaryRequirements: [] as string[],
    
    // Step 9: Music
    musicPreferences: [] as string[],
    musicType: "",
    
    // Step 10: Photo/Video Style
    photoStyle: "",
    needsDrone: false,
    needsSDE: false,
    
    // Step 11: Program
    programPreferences: [] as string[],
    
    // Step 12: Time Preferences
    ceremonyTime: "14:00",
    receptionTime: "18:00",
    endTime: "23:00",
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const toggleArrayItem = (field: keyof typeof formData, item: string) => {
    const current = formData[field] as string[];
    if (current.includes(item)) {
      setFormData({ ...formData, [field]: current.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...current, item] });
    }
  };

  const setPriority = (category: string, priority: 'high' | 'medium' | 'low') => {
    setFormData({
      ...formData,
      categoryPriorities: {
        ...formData.categoryPriorities,
        [category]: priority,
      },
    });
  };

  const handleFinish = async () => {
    if (step === TOTAL_STEPS) {
      setIsSubmitting(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error("Войдите в систему для продолжения");
          navigate("/auth");
          return;
        }

        const { error } = await supabase.from("wedding_plans").insert({
          couple_user_id: user.id,
          wedding_date: formData.date ? format(formData.date, "yyyy-MM-dd") : null,
          venue_location: formData.city,
          estimated_guests: formData.guests[0],
          budget_total: formData.budgetTotal[0],
          style_preferences: [formData.vibe],
          theme: formData.vibe,
          venue_type_preference: formData.venueType,
          outdoor_preference: formData.outdoorPreference,
          parking_needed: formData.parkingNeeded,
          cuisine_preferences: formData.cuisinePreferences,
          dietary_requirements: formData.dietaryRequirements,
          music_preferences: formData.musicPreferences,
          program_preferences: formData.programPreferences,
          category_priorities: formData.categoryPriorities,
          time_preferences: {
            ceremony: formData.ceremonyTime,
            reception: formData.receptionTime,
            end: formData.endTime,
          },
          priorities: formData.categoryPriorities,
        });

        if (error) throw error;

        toast.success("План свадьбы создан!");
        setStep(TOTAL_STEPS + 1);
      } catch (error: any) {
        console.error("Error creating wedding plan:", error);
        toast.error(error.message || "Ошибка создания плана");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      handleNext();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.date && formData.city;
      case 2: return formData.guests[0] > 0;
      case 3: return formData.budgetTotal[0] > 0;
      case 4: return Object.keys(formData.categoryPriorities).length >= 3;
      case 5: return formData.vibe;
      case 6: return formData.venueType;
      case 7: return formData.cuisinePreferences.length > 0;
      case 8: return true; // Dietary is optional
      case 9: return formData.musicType;
      case 10: return formData.photoStyle;
      case 11: return true; // Program is optional
      case 12: return true;
      default: return true;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <Label>Когда свадьба?</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formData.date ? format(formData.date, "d MMMM yyyy") : <span>Выберите дату</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={formData.date}
              onSelect={(date) => setFormData({ ...formData, date })}
              initialFocus
              disabled={(date) => date < new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>В каком городе?</Label>
        <div className="grid grid-cols-2 gap-2">
          {cities.map((city) => (
            <Button
              key={city}
              variant={formData.city === city ? "default" : "outline"}
              className="justify-start"
              onClick={() => setFormData({ ...formData, city })}
            >
              <MapPin className="mr-2 h-4 w-4" />
              {city}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="text-center">
        <Users className="w-12 h-12 mx-auto text-primary mb-4" />
        <p className="text-4xl font-bold text-primary">{formData.guests[0]}</p>
        <p className="text-muted-foreground">гостей</p>
      </div>
      <Slider
        value={formData.guests}
        onValueChange={(val) => setFormData({ ...formData, guests: val })}
        min={20}
        max={1000}
        step={10}
        className="py-4"
      />
      <p className="text-sm text-muted-foreground text-center">
        {formData.guests[0] < 100 ? "Уютное торжество" :
          formData.guests[0] < 300 ? "Классическая свадьба" :
            formData.guests[0] < 500 ? "Большое торжество" : "Грандиозное событие!"}
      </p>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
      <div className="text-center">
        <Wallet className="w-12 h-12 mx-auto text-primary mb-4" />
        <p className="text-3xl font-bold text-primary">
          {formData.budgetTotal[0].toLocaleString()} сум
        </p>
        <p className="text-muted-foreground">общий бюджет</p>
      </div>
      <Slider
        value={formData.budgetTotal}
        onValueChange={(val) => setFormData({ ...formData, budgetTotal: val })}
        min={10000000}
        max={500000000}
        step={5000000}
        className="py-4"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>10 млн</span>
        <span>250 млн</span>
        <span>500 млн</span>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <p className="text-sm text-muted-foreground mb-4">
        Расставьте приоритеты: на что готовы потратить больше?
      </p>
      {categoryPriorities.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cat.icon}</span>
            <span className="font-medium">{cat.label}</span>
          </div>
          <div className="flex gap-1">
            {(['low', 'medium', 'high'] as const).map((priority) => (
              <Button
                key={priority}
                size="sm"
                variant={formData.categoryPriorities[cat.id] === priority ? "default" : "outline"}
                onClick={() => setPriority(cat.id, priority)}
                className="text-xs px-2"
              >
                {priority === 'low' ? '💰' : priority === 'medium' ? '💰💰' : '💰💰💰'}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep5 = () => (
    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-4">
      {vibes.map((vibe) => (
        <div
          key={vibe.id}
          className={cn(
            "border rounded-lg p-4 cursor-pointer transition-all hover:border-primary",
            formData.vibe === vibe.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-card"
          )}
          onClick={() => setFormData({ ...formData, vibe: vibe.id })}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{vibe.label}</h3>
              <p className="text-sm text-muted-foreground">{vibe.description}</p>
            </div>
            {formData.vibe === vibe.id && <Check className="h-5 w-5 text-primary" />}
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="grid grid-cols-2 gap-3">
        {venueTypes.map((type) => (
          <Button
            key={type.id}
            variant={formData.venueType === type.id ? "default" : "outline"}
            className="h-auto py-4 flex-col"
            onClick={() => setFormData({ ...formData, venueType: type.id })}
          >
            {type.label}
          </Button>
        ))}
      </div>
      
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="outdoor"
            checked={formData.outdoorPreference}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, outdoorPreference: checked as boolean })
            }
          />
          <Label htmlFor="outdoor">Предпочитаю открытое пространство</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="parking"
            checked={formData.parkingNeeded}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, parkingNeeded: checked as boolean })
            }
          />
          <Label htmlFor="parking">Нужна парковка для гостей</Label>
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <Utensils className="w-12 h-12 mx-auto text-primary mb-4" />
      <p className="text-center text-muted-foreground mb-4">Выберите предпочитаемую кухню</p>
      <div className="grid grid-cols-2 gap-3">
        {cuisineTypes.map((cuisine) => (
          <Button
            key={cuisine.id}
            variant={formData.cuisinePreferences.includes(cuisine.id) ? "default" : "outline"}
            onClick={() => toggleArrayItem('cuisinePreferences', cuisine.id)}
          >
            {cuisine.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep8 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <p className="text-center text-muted-foreground mb-4">
        Есть ли диетические ограничения у вас или гостей?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {dietaryOptions.map((option) => (
          <Button
            key={option.id}
            variant={formData.dietaryRequirements.includes(option.id) ? "default" : "outline"}
            onClick={() => toggleArrayItem('dietaryRequirements', option.id)}
          >
            {option.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-center text-muted-foreground pt-4">
        Можно пропустить, если ограничений нет
      </p>
    </div>
  );

  const renderStep9 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <Music className="w-12 h-12 mx-auto text-primary" />
      
      <div className="space-y-2">
        <Label>Тип музыкального сопровождения</Label>
        <div className="grid grid-cols-2 gap-3">
          {musicTypes.map((type) => (
            <Button
              key={type.id}
              variant={formData.musicType === type.id ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, musicType: type.id })}
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Любимые жанры</Label>
        <div className="flex flex-wrap gap-2">
          {musicGenres.map((genre) => (
            <Badge
              key={genre.id}
              variant={formData.musicPreferences.includes(genre.id) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleArrayItem('musicPreferences', genre.id)}
            >
              {genre.label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep10 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <Camera className="w-12 h-12 mx-auto text-primary" />
      
      <div className="space-y-2">
        <Label>Стиль съёмки</Label>
        <div className="grid grid-cols-2 gap-3">
          {photoStyles.map((style) => (
            <Button
              key={style.id}
              variant={formData.photoStyle === style.id ? "default" : "outline"}
              onClick={() => setFormData({ ...formData, photoStyle: style.id })}
            >
              {style.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="drone"
            checked={formData.needsDrone}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, needsDrone: checked as boolean })
            }
          />
          <Label htmlFor="drone">Хочу аэросъёмку с дрона</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="sde"
            checked={formData.needsSDE}
            onCheckedChange={(checked) => 
              setFormData({ ...formData, needsSDE: checked as boolean })
            }
          />
          <Label htmlFor="sde">Хочу видео в день свадьбы (SDE)</Label>
        </div>
      </div>
    </div>
  );

  const renderStep11 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
      <Sparkles className="w-12 h-12 mx-auto text-primary" />
      <p className="text-center text-muted-foreground mb-4">
        Какие элементы программы хотите включить?
      </p>
      <div className="grid grid-cols-2 gap-3">
        {programElements.map((element) => (
          <Button
            key={element.id}
            variant={formData.programPreferences.includes(element.id) ? "default" : "outline"}
            onClick={() => toggleArrayItem('programPreferences', element.id)}
            className="text-sm"
          >
            {element.label}
          </Button>
        ))}
      </div>
    </div>
  );

  const renderStep12 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <Clock className="w-12 h-12 mx-auto text-primary" />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Начало церемонии</Label>
          <Input
            type="time"
            value={formData.ceremonyTime}
            onChange={(e) => setFormData({ ...formData, ceremonyTime: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Начало банкета</Label>
          <Input
            type="time"
            value={formData.receptionTime}
            onChange={(e) => setFormData({ ...formData, receptionTime: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Планируемое окончание</Label>
          <Input
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
      <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <Heart className="w-8 h-8 text-primary fill-primary" />
      </div>
      <h2 className="text-2xl font-bold">Ваш план свадьбы готов!</h2>
      <p className="text-muted-foreground">
        Стиль: {vibes.find(v => v.id === formData.vibe)?.label} • {formData.guests[0]} гостей • {formData.city}
      </p>

      <div className="grid gap-4 text-left mt-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Что дальше?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Смотрите персональные рекомендации поставщиков</li>
              <li>Площадки для {formData.guests[0]} гостей</li>
              <li>Кейтеринг: {formData.cuisinePreferences.map(c => cuisineTypes.find(ct => ct.id === c)?.label).join(', ')}</li>
              <li>Декораторы в стиле {vibes.find(v => v.id === formData.vibe)?.label}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Button className="w-full mt-4" size="lg" onClick={() => navigate("/dashboard")}>
        Перейти к рекомендациям
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );

  const stepTitles: Record<number, { title: string; description: string }> = {
    1: { title: "Дата и место", description: "Когда и где состоится свадьба?" },
    2: { title: "Количество гостей", description: "Сколько человек вы ожидаете?" },
    3: { title: "Бюджет", description: "Какой общий бюджет на свадьбу?" },
    4: { title: "Приоритеты", description: "На что готовы потратить больше?" },
    5: { title: "Стиль свадьбы", description: "Какой стиль вам ближе?" },
    6: { title: "Тип площадки", description: "Какую площадку предпочитаете?" },
    7: { title: "Кухня", description: "Какую кухню предпочитаете?" },
    8: { title: "Диетические ограничения", description: "Есть ли особые требования к еде?" },
    9: { title: "Музыка", description: "Какую музыку вы любите?" },
    10: { title: "Фото и видео", description: "Какой стиль съёмки предпочитаете?" },
    11: { title: "Программа", description: "Что хотите включить в программу?" },
    12: { title: "Время", description: "Когда начнётся и закончится?" },
  };

  const renderStepContent = () => {
    switch (step) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      case 8: return renderStep8();
      case 9: return renderStep9();
      case 10: return renderStep10();
      case 11: return renderStep11();
      case 12: return renderStep12();
      default: return null;
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      {step <= TOTAL_STEPS ? (
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <Badge variant="secondary" className="text-xs">
                Шаг {step} из {TOTAL_STEPS}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-muted-foreground" 
                onClick={() => navigate("/dashboard")}
              >
                Пропустить
              </Button>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-4">
              <div 
                className="bg-primary h-2 rounded-full transition-all" 
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} 
              />
            </div>
            <CardTitle>{stepTitles[step]?.title}</CardTitle>
            <CardDescription>{stepTitles[step]?.description}</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto">
            {renderStepContent()}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" onClick={handleBack} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад
            </Button>
            <Button 
              onClick={handleFinish} 
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? "Сохранение..." : step === TOTAL_STEPS ? "Готово" : "Далее"} 
              {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        renderSummary()
      )}
    </div>
  );
}