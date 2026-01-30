import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Star, MapPin, ArrowLeft, Calendar, MessageSquare, 
  Clock, Users, Package, Gift, CheckCircle, Shield,
  Phone, Globe, Award, Heart, GitCompare, Share2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookingForm } from "@/components/BookingForm";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";
import { ImageGallery } from "@/components/ImageGallery";
import { MatchScoreBadge } from "@/components/vendor/MatchScoreBadge";
import { useToast } from "@/hooks/use-toast";
import { useVendorComparison } from "@/hooks/useVendorComparison";
import { VendorMatchingEngine } from "@/lib/matching-engine";
import type { VendorMatchResult } from "@/types/vendor-attributes";
import { cn } from "@/lib/utils";

interface ServicePackage {
  name: string;
  price: number;
  hours?: number;
  includes: string[];
  description?: string;
}

interface VendorProfile {
  id: string;
  business_name: string;
  category: string;
  description: string;
  location: string;
  price_range_min: number;
  price_range_max: number;
  starting_price: number;
  rating: number;
  total_reviews: number;
  verified: boolean;
  portfolio_images: string[] | null;
  styles: string[] | null;
  packages: ServicePackage[] | null;
  bonuses: string[] | null;
  special_features: Record<string, boolean> | null;
  deposit_percentage: number | null;
  cancellation_policy: string | null;
  experience_years: number | null;
  delivery_time_days: number | null;
  languages: string[] | null;
  certifications: string[] | null;
  service_area: string[] | null;
  min_guests: number | null;
  max_guests: number | null;
  capacity_min: number | null;
  capacity_max: number | null;
}

const VendorDetail = () => {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [userCompletedBookings, setUserCompletedBookings] = useState<string[]>([]);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [matchResult, setMatchResult] = useState<VendorMatchResult | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const { addToComparison, isInComparison, removeFromComparison, canAddToComparison } = useVendorComparison();

  useEffect(() => {
    fetchVendorDetails();
    checkUserBookings();
    checkFavorite();
    loadMatchScore();
  }, [vendorId]);

  const loadMatchScore = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: weddingPlan } = await supabase
      .from('wedding_plans')
      .select('id')
      .eq('couple_user_id', user.id)
      .maybeSingle();

    if (weddingPlan && vendorId) {
      const params = await VendorMatchingEngine.getWeddingParams(weddingPlan.id);
      if (params) {
        // Fetch vendor and calculate match
        const { data: vendorData } = await supabase
          .from('vendor_profiles')
          .select('*')
          .eq('id', vendorId)
          .single();
        
        if (vendorData) {
          const matches = await VendorMatchingEngine.findMatches(
            params,
            { category: vendorData.category as any, availableOnDate: params.weddingDate },
            { limit: 100 }
          );
          const match = matches.find(m => m.vendorId === vendorId);
          if (match) setMatchResult(match);
        }
      }
    }
  };

  const checkFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !vendorId) return;

    const { data } = await supabase
      .from('favorite_vendors')
      .select('id')
      .eq('user_id', user.id)
      .eq('vendor_id', vendorId)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !vendorId) {
      toast({ title: "Войдите для добавления в избранное", variant: "destructive" });
      return;
    }

    if (isFavorite) {
      await supabase.from('favorite_vendors').delete().eq('user_id', user.id).eq('vendor_id', vendorId);
      setIsFavorite(false);
      toast({ title: "Удалено из избранного" });
    } else {
      await supabase.from('favorite_vendors').insert({ user_id: user.id, vendor_id: vendorId });
      setIsFavorite(true);
      toast({ title: "Добавлено в избранное" });
    }
  };

  const checkUserBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: bookings } = await supabase
        .from("bookings")
        .select("id")
        .eq("vendor_id", vendorId)
        .eq("couple_user_id", user.id)
        .eq("status", "completed");

      setUserCompletedBookings(bookings?.map(b => b.id) || []);
    } catch (error) {
      console.error("Error checking bookings:", error);
    }
  };

  const fetchVendorDetails = async () => {
    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("id", vendorId)
        .maybeSingle();

      if (vendorError) throw vendorError;

      // Cast the data to our local VendorProfile type
      setVendor(vendorData as unknown as VendorProfile);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные поставщика",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `${(price / 1000000).toFixed(1)} млн`;
    if (price >= 1000) return `${(price / 1000).toFixed(0)} тыс`;
    return price.toLocaleString();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!vendor) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-muted-foreground">Поставщик не найден</p>
          <Button onClick={() => navigate("/marketplace")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к маркетплейсу
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const packages = (vendor.packages as ServicePackage[]) || [];
  const bonuses = vendor.bonuses || [];
  const specialFeatures = vendor.special_features || {};
  const activeFeatures = Object.entries(specialFeatures).filter(([_, value]) => value);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        {/* Back button and actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/marketplace")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Назад</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={toggleFavorite}>
              <Heart className={cn("w-4 h-4", isFavorite && "fill-primary text-primary")} />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                if (isInComparison(vendor.id)) {
                  removeFromComparison(vendor.id);
                } else {
                  addToComparison({ id: vendor.id, category: vendor.category, business_name: vendor.business_name });
                }
              }}
              disabled={!isInComparison(vendor.id) && !canAddToComparison(vendor.category)}
            >
              <GitCompare className={cn("w-4 h-4", isInComparison(vendor.id) && "text-primary")} />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Main info card */}
        <Card className="overflow-hidden">
          {/* Hero section with images */}
          {vendor.portfolio_images && vendor.portfolio_images.length > 0 && (
            <div className="relative h-64 md:h-80 w-full">
              <img 
                src={vendor.portfolio_images[0]} 
                alt={vendor.business_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {vendor.verified && (
                    <Badge className="bg-primary/90">
                      <Shield className="w-3 h-3 mr-1" />
                      Проверен
                    </Badge>
                  )}
                  {matchResult && <MatchScoreBadge matchResult={matchResult} size="md" />}
                </div>
              </div>
            </div>
          )}

          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl md:text-3xl">{vendor.business_name}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-3 text-base">
                  <Badge variant="outline">{vendor.category}</Badge>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {vendor.location}
                  </span>
                  {vendor.experience_years && (
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {vendor.experience_years} лет опыта
                    </span>
                  )}
                </CardDescription>
              </div>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full md:w-auto">
                    <Calendar className="w-4 h-4 mr-2" />
                    Забронировать
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Создать бронирование</DialogTitle>
                  </DialogHeader>
                  <BookingForm
                    vendorId={vendor.id}
                    onSuccess={() => {
                      setDialogOpen(false);
                      toast({ title: "Успешно!", description: "Запрос на бронирование отправлен" });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Rating and price */}
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-semibold text-lg">{vendor.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-muted-foreground">({vendor.total_reviews} отзывов)</span>
              </div>
              <div className="text-lg font-semibold">
                от {formatPrice(vendor.starting_price || vendor.price_range_min)} сум
              </div>
              {(vendor.max_guests || vendor.capacity_max) && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  до {vendor.max_guests || vendor.capacity_max} гостей
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">О нас</h3>
              <p className="text-muted-foreground">{vendor.description || 'Описание отсутствует'}</p>
            </div>

            {/* Styles */}
            {vendor.styles && vendor.styles.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Стили работы</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.styles.map((style) => (
                    <Badge key={style} variant="secondary">{style}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Service area */}
            {vendor.service_area && vendor.service_area.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Регионы работы</h3>
                <div className="flex flex-wrap gap-2">
                  {vendor.service_area.map((area) => (
                    <Badge key={area} variant="outline">{area}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Match Score Details */}
        {matchResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Совместимость с вашей свадьбой</CardTitle>
            </CardHeader>
            <CardContent>
              <MatchScoreBadge matchResult={matchResult} showDetails />
            </CardContent>
          </Card>
        )}

        {/* Packages */}
        {packages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Пакеты услуг
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {packages.map((pkg, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(pkg.price)} сум
                      </div>
                      {pkg.hours && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {pkg.hours} часов
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>
                      )}
                      {pkg.includes && pkg.includes.length > 0 && (
                        <ul className="space-y-1.5">
                          {pkg.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bonuses and Features */}
        {(bonuses.length > 0 || activeFeatures.length > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {bonuses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="w-5 h-5 text-primary" />
                    Бонусы и подарки
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {bonuses.map((bonus, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        {bonus}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {activeFeatures.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="w-5 h-5 text-primary" />
                    Особенности
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {activeFeatures.map(([key]) => (
                      <Badge key={key} variant="secondary" className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Terms and Conditions */}
        {(vendor.deposit_percentage || vendor.cancellation_policy || vendor.delivery_time_days) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Условия работы</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vendor.deposit_percentage && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Предоплата</p>
                      <p className="text-sm text-muted-foreground">{vendor.deposit_percentage}%</p>
                    </div>
                  </div>
                )}
                {vendor.delivery_time_days && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Срок готовности</p>
                      <p className="text-sm text-muted-foreground">{vendor.delivery_time_days} дней</p>
                    </div>
                  </div>
                )}
                {vendor.languages && vendor.languages.length > 0 && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Языки</p>
                      <p className="text-sm text-muted-foreground">{vendor.languages.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
              {vendor.cancellation_policy && (
                <div className="mt-4 p-3 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-1">Политика отмены</p>
                  <p className="text-sm text-muted-foreground">{vendor.cancellation_policy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Portfolio Gallery */}
        {vendor.portfolio_images && vendor.portfolio_images.length > 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Портфолио</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageGallery 
                images={vendor.portfolio_images} 
                alt={`${vendor.business_name} portfolio`} 
              />
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Отзывы ({vendor.total_reviews})</CardTitle>
              {userCompletedBookings.length > 0 && (
                <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Оставить отзыв
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Оставить отзыв</DialogTitle>
                    </DialogHeader>
                    <ReviewForm
                      vendorId={vendor.id}
                      bookingId={userCompletedBookings[0]}
                      onSuccess={() => {
                        setReviewDialogOpen(false);
                        setReviewRefreshTrigger(prev => prev + 1);
                        fetchVendorDetails();
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ReviewsList 
              vendorId={vendor.id} 
              refreshTrigger={reviewRefreshTrigger}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default VendorDetail;