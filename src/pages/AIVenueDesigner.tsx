import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Loader2, Sparkles, Building2, Palette, Eye, Download, ArrowLeft, Check, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWeddingPlanId } from "@/hooks/useWeddingPlanId";

const DECOR_STYLES = [
  { id: "traditional_uzbek", name: "Традиционный узбекский", description: "Национальные орнаменты, сюзане, золото и красный", icon: "🏛️" },
  { id: "modern_minimal", name: "Современный минимализм", description: "Чистые линии, шалфейно-зелёная гамма, свежая зелень", icon: "✨" },
  { id: "romantic_garden", name: "Романтический сад", description: "Изобилие цветов, розовые тона, гирлянды огней", icon: "🌸" },
  { id: "royal_luxury", name: "Королевская роскошь", description: "Золотые люстры, кристаллы, бархат", icon: "👑" },
  { id: "rustic_bohemian", name: "Рустик бохо", description: "Натуральное дерево, макраме, сухоцветы", icon: "🌿" },
  { id: "classic_elegant", name: "Классическая элегантность", description: "Белые розы, серебро, канделябры", icon: "💎" },
];

const DECOR_ELEMENTS = [
  { id: "floral_arch", name: "Цветочная арка", icon: "🌺" },
  { id: "table_centerpiece", name: "Центральная композиция", icon: "🕯️" },
  { id: "ceiling_draping", name: "Потолочный декор", icon: "✨" },
  { id: "aisle_decor", name: "Декор прохода", icon: "💐" },
  { id: "backdrop", name: "Фотозона", icon: "📷" },
  { id: "entrance", name: "Декор входа", icon: "🚪" },
];

const COLOR_PALETTES = [
  { id: "sage_cream", colors: ["#9CAF88", "#F5F5DC", "#FFFFFF"], name: "Шалфей и крем" },
  { id: "blush_gold", colors: ["#F4C2C2", "#D4AF37", "#FFFFFF"], name: "Румянец и золото" },
  { id: "navy_gold", colors: ["#001F3F", "#D4AF37", "#FFFFFF"], name: "Тёмно-синий и золото" },
  { id: "dusty_rose", colors: ["#DCAE96", "#8B7355", "#F5F5F5"], name: "Пыльная роза" },
  { id: "emerald_gold", colors: ["#046307", "#D4AF37", "#F5F5F5"], name: "Изумруд и золото" },
  { id: "burgundy_blush", colors: ["#722F37", "#F4C2C2", "#FFFFFF"], name: "Бордо и румянец" },
];

export default function AIVenueDesigner() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { weddingPlanId, isLoading: planLoading } = useWeddingPlanId();
  
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [selectedVenueImage, setSelectedVenueImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string>("modern_minimal");
  const [selectedElements, setSelectedElements] = useState<string[]>(["floral_arch", "table_centerpiece"]);
  const [selectedPalette, setSelectedPalette] = useState<string>("sage_cream");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("venue");

  // Fetch venues with gallery images
  const { data: venues, isLoading: venuesLoading } = useQuery({
    queryKey: ["venues-with-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select(`
          id,
          business_name,
          location,
          rating,
          portfolio_images,
          venue_gallery:venue_gallery(id, image_url, angle, room_name, capacity)
        `)
        .eq("category", "venue")
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  // Generate visualization mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVenueImage || !selectedVenue) {
        throw new Error("Выберите зал для визуализации");
      }

      const palette = COLOR_PALETTES.find(p => p.id === selectedPalette);

      const { data, error } = await supabase.functions.invoke("generate-venue-decor", {
        body: {
          venueImageUrl: selectedVenueImage,
          venueId: selectedVenue,
          weddingPlanId,
          style: selectedStyle,
          decorElements: selectedElements,
          colorPalette: palette?.colors || [],
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      setGeneratedImage(data.visualization.resultImageUrl);
      toast.success("Визуализация готова!");
      queryClient.invalidateQueries({ queryKey: ["venue-visualizations"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ошибка генерации");
    },
  });

  // Fetch user's previous visualizations
  const { data: previousVisualizations } = useQuery({
    queryKey: ["venue-visualizations", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return [];
      const { data, error } = await supabase
        .from("venue_visualizations")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!weddingPlanId,
  });

  const toggleElement = (elementId: string) => {
    setSelectedElements(prev => 
      prev.includes(elementId)
        ? prev.filter(e => e !== elementId)
        : [...prev, elementId]
    );
  };

  const handleVenueSelect = (venueId: string, imageUrl: string) => {
    setSelectedVenue(venueId);
    setSelectedVenueImage(imageUrl);
    setActiveTab("style");
  };

  const handleGenerate = () => {
    if (!selectedVenueImage) {
      toast.error("Сначала выберите фото зала");
      setActiveTab("venue");
      return;
    }
    generateMutation.mutate();
  };

  if (planLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              AI Дизайнер залов
            </h1>
            <p className="text-muted-foreground">
              Увидьте декор выбранного оформителя в реальном зале до бронирования
            </p>
          </div>
        </div>

        {/* Info Banner */}
        <Card className="glass-card border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 p-4">
            <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">Как это работает?</p>
              <p className="text-muted-foreground">
                1. Выберите зал тойхоны → 2. Выберите стиль декора → 3. Настройте элементы → 4. AI создаст реалистичную визуализацию вашей свадьбы
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Configuration */}
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="venue" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Зал</span>
                </TabsTrigger>
                <TabsTrigger value="style" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <span className="hidden sm:inline">Стиль</span>
                </TabsTrigger>
                <TabsTrigger value="elements" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden sm:inline">Элементы</span>
                </TabsTrigger>
              </TabsList>

              {/* Venue Selection Tab */}
              <TabsContent value="venue" className="mt-4">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Выберите зал</CardTitle>
                    <CardDescription>
                      Выберите фото пустого зала для визуализации декора
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {venuesLoading ? (
                      <div className="flex justify-center p-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : venues && venues.length > 0 ? (
                      <div className="space-y-4">
                        {venues.map((venue: any) => {
                          const images = venue.venue_gallery?.length > 0 
                            ? venue.venue_gallery.map((g: any) => g.image_url)
                            : venue.portfolio_images?.slice(0, 4) || [];
                          
                          if (images.length === 0) return null;

                          return (
                            <div key={venue.id} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{venue.business_name}</p>
                                  <p className="text-sm text-muted-foreground">{venue.location}</p>
                                </div>
                                {venue.rating && (
                                  <Badge variant="secondary">⭐ {venue.rating}</Badge>
                                )}
                              </div>
                              <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex gap-2">
                                  {images.map((img: string, idx: number) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleVenueSelect(venue.id, img)}
                                      className={`relative flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                                        selectedVenueImage === img 
                                          ? "border-primary ring-2 ring-primary/20" 
                                          : "border-transparent hover:border-primary/50"
                                      }`}
                                    >
                                      <img
                                        src={img}
                                        alt={`${venue.business_name} ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                      />
                                      {selectedVenueImage === img && (
                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                          <Check className="w-6 h-6 text-primary-foreground bg-primary rounded-full p-1" />
                                        </div>
                                      )}
                                    </button>
                                  ))}
                                </div>
                                <ScrollBar orientation="horizontal" />
                              </ScrollArea>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Площадки пока не загрузили фото залов</p>
                        <p className="text-sm">Вы можете использовать AI Визуализатор на странице /ai-visualizer</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Style Selection Tab */}
              <TabsContent value="style" className="mt-4">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Стиль декора</CardTitle>
                    <CardDescription>
                      Выберите общий стиль оформления вашего торжества
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {DECOR_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all ${
                            selectedStyle === style.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-2xl">{style.icon}</span>
                          <p className="font-medium mt-1 text-sm">{style.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {style.description}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Color Palette */}
                    <div className="mt-6">
                      <p className="text-sm font-medium mb-3">Цветовая палитра</p>
                      <div className="grid grid-cols-3 gap-2">
                        {COLOR_PALETTES.map((palette) => (
                          <button
                            key={palette.id}
                            onClick={() => setSelectedPalette(palette.id)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              selectedPalette === palette.id
                                ? "border-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="flex gap-1 mb-1">
                              {palette.colors.map((color, idx) => (
                                <div
                                  key={idx}
                                  className="w-5 h-5 rounded-full border border-border/50"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">{palette.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Elements Selection Tab */}
              <TabsContent value="elements" className="mt-4">
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Элементы декора</CardTitle>
                    <CardDescription>
                      Выберите элементы, которые хотите добавить в зал
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {DECOR_ELEMENTS.map((element) => (
                        <button
                          key={element.id}
                          onClick={() => toggleElement(element.id)}
                          className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                            selectedElements.includes(element.id)
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <span className="text-xl">{element.icon}</span>
                          <span className="text-sm font-medium">{element.name}</span>
                          {selectedElements.includes(element.id) && (
                            <Check className="w-4 h-4 text-primary ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!selectedVenueImage || generateMutation.isPending}
              className="w-full btn-gradient h-12 text-lg"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Генерируем визуализацию...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Создать визуализацию
                </>
              )}
            </Button>
          </div>

          {/* Right: Preview */}
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Предпросмотр
                </CardTitle>
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                      <img
                        src={generatedImage}
                        alt="AI-generated venue decoration"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = generatedImage;
                          link.download = `wedding-venue-${Date.now()}.png`;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Скачать
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setGeneratedImage(null)}
                      >
                        Создать новую
                      </Button>
                    </div>
                  </div>
                ) : selectedVenueImage ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Исходное фото зала:</p>
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
                      <img
                        src={selectedVenueImage}
                        alt="Selected venue"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      Нажмите "Создать визуализацию" чтобы увидеть декор
                    </p>
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-muted/50 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Выберите зал для начала</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Previous Visualizations */}
            {previousVisualizations && previousVisualizations.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ваши визуализации</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="w-full">
                    <div className="flex gap-3 pb-2">
                      {previousVisualizations.map((viz: any) => (
                        <button
                          key={viz.id}
                          onClick={() => setGeneratedImage(viz.result_image_url)}
                          className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border hover:border-primary transition-colors"
                        >
                          <img
                            src={viz.result_image_url}
                            alt="Previous visualization"
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                    <ScrollBar orientation="horizontal" />
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
