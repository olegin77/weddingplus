import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Star, MapPin, Heart, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const ITEMS_PER_PAGE = 12;

// Тематические изображения для категорий (надёжные источники)
const CATEGORY_IMAGES: Record<string, string> = {
  photographer: 'https://images.pexels.com/photos/3014856/pexels-photo-3014856.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  videographer: 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  decorator: 'https://images.pexels.com/photos/1616113/pexels-photo-1616113.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  florist: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  music: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  venue: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  caterer: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  transport: 'https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  makeup: 'https://images.pexels.com/photos/2113855/pexels-photo-2113855.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  clothing: 'https://images.pexels.com/photos/291759/pexels-photo-291759.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
  other: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop',
};

// Описания для демо-поставщиков
const DEMO_VENDORS = [
  { id: 'demo-1', business_name: 'Royal Palace Venue', category: 'venue', location: 'Ташкент', price_range_min: 15000000, price_range_max: 60000000, rating: 4.8, total_reviews: 124, verified: true, isDemo: true, description: 'Роскошный банкетный зал с панорамными окнами и изысканным интерьером. Вместимость до 500 гостей.' },
  { id: 'demo-2', business_name: 'Garden Bliss Venue', category: 'venue', location: 'Самарканд', price_range_min: 10000000, price_range_max: 35000000, rating: 4.6, total_reviews: 78, verified: true, isDemo: true, description: 'Живописная площадка с садом и фонтанами. Идеально для романтической свадьбы на природе.' },
  { id: 'demo-3', business_name: 'UzPhoto Studio', category: 'photographer', location: 'Ташкент', price_range_min: 5000000, price_range_max: 15000000, rating: 4.9, total_reviews: 210, verified: true, isDemo: true, description: 'Профессиональная свадебная фотография с 10-летним опытом. Создаём незабываемые моменты.' },
  { id: 'demo-4', business_name: 'Sam Video Pro', category: 'videographer', location: 'Самарканд', price_range_min: 7000000, price_range_max: 18000000, rating: 4.7, total_reviews: 95, verified: true, isDemo: true, description: 'Кинематографичная свадебная видеосъёмка с использованием дронов и современного оборудования.' },
  { id: 'demo-5', business_name: 'Flora Boutique', category: 'florist', location: 'Бухара', price_range_min: 3000000, price_range_max: 10000000, rating: 4.5, total_reviews: 62, verified: true, isDemo: true, description: 'Свежие цветы и авторские композиции для вашего особенного дня. Доставка по всему Узбекистану.' },
  { id: 'demo-6', business_name: 'Melody Band', category: 'music', location: 'Ташкент', price_range_min: 6000000, price_range_max: 20000000, rating: 4.7, total_reviews: 140, verified: true, isDemo: true, description: 'Живая музыка на любой вкус: от классики до современных хитов. Создаём атмосферу праздника!' },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [sortBy, setSortBy] = useState<string>("rating");
  const [vendors, setVendors] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchVendors();
    fetchFavorites();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        setVendors(DEMO_VENDORS);
      } else {
        setVendors(data);
      }
      
      // Extract unique locations
      const uniqueLocations = Array.from(new Set((data && data.length > 0 ? data : DEMO_VENDORS).map(v => v.location).filter(Boolean))) as string[];
      setLocations(uniqueLocations);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("favorite_vendors")
        .select("vendor_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(new Set(data?.map(f => f.vendor_id) || []));
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const toggleFavorite = async (vendorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Требуется авторизация",
          description: "Войдите, чтобы добавлять поставщиков в избранное",
          variant: "destructive",
        });
        return;
      }

      if (favorites.has(vendorId)) {
        const { error } = await supabase
          .from("favorite_vendors")
          .delete()
          .eq("user_id", user.id)
          .eq("vendor_id", vendorId);

        if (error) throw error;
        
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(vendorId);
          return newSet;
        });

        toast({
          title: "Удалено из избранного",
        });
      } else {
        const { error } = await supabase
          .from("favorite_vendors")
          .insert({ user_id: user.id, vendor_id: vendorId });

        if (error) throw error;
        
        setFavorites(prev => new Set(prev).add(vendorId));

        toast({
          title: "Добавлено в избранное",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить избранное",
        variant: "destructive",
      });
    }
  };

  const filteredVendors = useMemo(() => {
    return vendors
      .filter((vendor) => {
        const matchesSearch = vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "all" || vendor.category === selectedCategory;
        const matchesLocation = selectedLocation === "all" || vendor.location === selectedLocation;
        const matchesRating = vendor.rating >= minRating;
        const matchesPrice = 
          vendor.price_range_min >= priceRange[0] && 
          vendor.price_range_max <= priceRange[1];
        
        return matchesSearch && matchesCategory && matchesLocation && matchesRating && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "rating":
            return (b.rating || 0) - (a.rating || 0);
          case "price_low":
            return (a.price_range_min || 0) - (b.price_range_min || 0);
          case "price_high":
            return (b.price_range_max || 0) - (a.price_range_max || 0);
          case "name":
            return a.business_name.localeCompare(b.business_name);
          default:
            return 0;
        }
      });
  }, [vendors, searchQuery, selectedCategory, selectedLocation, minRating, priceRange, sortBy]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedLocation, minRating, priceRange, sortBy]);

  const totalPages = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Маркетплейс поставщиков</h1>
          <p className="text-muted-foreground mt-1">
            Найдите идеальных профессионалов для вашей свадьбы
          </p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск поставщиков..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full lg:w-[200px]">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                  <SelectItem value="price_low">Цена: низкая</SelectItem>
                  <SelectItem value="price_high">Цена: высокая</SelectItem>
                  <SelectItem value="name">По названию</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-full lg:w-auto"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Фильтры
              </Button>
            </div>

            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleContent className="space-y-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Категория</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все категории" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все категории</SelectItem>
                        <SelectItem value="venue">Площадка</SelectItem>
                        <SelectItem value="photographer">Фотограф</SelectItem>
                        <SelectItem value="videographer">Видеограф</SelectItem>
                        <SelectItem value="caterer">Кейтеринг</SelectItem>
                        <SelectItem value="florist">Флорист</SelectItem>
                        <SelectItem value="decorator">Декоратор</SelectItem>
                        <SelectItem value="music">Музыка</SelectItem>
                        <SelectItem value="makeup">Визаж</SelectItem>
                        <SelectItem value="clothing">Одежда</SelectItem>
                        <SelectItem value="transport">Транспорт</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Локация</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Все локации" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все локации</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Минимальный рейтинг: {minRating}★
                    </label>
                    <Slider
                      value={[minRating]}
                      onValueChange={(value) => setMinRating(value[0])}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Цена: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} сум
                    </label>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      max={100000000}
                      step={1000000}
                      className="w-full"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Загрузка...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Показано {paginatedVendors.length} из {filteredVendors.length} поставщиков
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedVendors.map((vendor) => (
                  <Card 
                    key={vendor.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/marketplace/${vendor.id}`)}
                  >
                    {/* Изображение поставщика */}
                    <div className="relative h-40 w-full overflow-hidden">
                      <img 
                        src={vendor.portfolio_images?.[0] || CATEGORY_IMAGES[vendor.category] || CATEGORY_IMAGES.other} 
                        alt={vendor.business_name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                      {vendor.verified && (
                        <Badge variant="default" className="absolute top-3 left-3">
                          Проверен
                        </Badge>
                      )}
                      {!vendor.isDemo && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => toggleFavorite(vendor.id, e)}
                          className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm hover:bg-background"
                        >
                          <Heart 
                            className={`w-5 h-5 ${
                              favorites.has(vendor.id) 
                                ? 'fill-primary text-primary' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </Button>
                      )}
                    </div>
                    
                    <CardHeader className="pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">{vendor.business_name}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Badge variant="outline">{vendor.category}</Badge>
                          <span className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" />
                            {vendor.location}
                          </span>
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Описание */}
                      {vendor.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {vendor.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        <span className="font-semibold text-sm">{vendor.rating}</span>
                        <span className="text-xs text-muted-foreground">
                          ({vendor.total_reviews} отзывов)
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div className="text-sm font-medium">
                          {vendor.price_range_min?.toLocaleString()} - {vendor.price_range_max?.toLocaleString()} сум
                        </div>
                        <Button size="sm">
                          Подробнее
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredVendors.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Поставщики не найдены. Попробуйте изменить фильтры.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first, last, current and adjacent pages
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            className="w-8 h-8 p-0"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </Button>
                        );
                      }
                      // Show ellipsis
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Marketplace;