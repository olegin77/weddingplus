import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, ArrowLeft, Calendar, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingForm } from "@/components/BookingForm";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";
import { useToast } from "@/hooks/use-toast";

interface VendorProfile {
  id: string;
  business_name: string;
  category: string;
  description: string;
  location: string;
  price_range_min: number;
  price_range_max: number;
  rating: number;
  total_reviews: number;
  verified: boolean;
  portfolio_images: string[] | null;
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

  useEffect(() => {
    fetchVendorDetails();
    checkUserBookings();
  }, [vendorId]);

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
        .single();

      if (vendorError) throw vendorError;

      setVendor(vendorData);
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Загрузка...</p>
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

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/marketplace")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-3xl">{vendor.business_name}</CardTitle>
                  {vendor.verified && (
                    <Badge variant="default">Проверен</Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-4 text-base">
                  <Badge variant="outline">{vendor.category}</Badge>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {vendor.location}
                  </span>
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Забронировать
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать бронирование</DialogTitle>
                  </DialogHeader>
                  <BookingForm
                    vendorId={vendor.id}
                    onSuccess={() => {
                      setDialogOpen(false);
                      toast({
                        title: "Успешно!",
                        description: "Запрос на бронирование отправлен",
                      });
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-semibold">{vendor.rating}</span>
                <span className="text-muted-foreground">({vendor.total_reviews} отзывов)</span>
              </div>
              <div className="text-lg font-semibold">
                ${vendor.price_range_min} - ${vendor.price_range_max}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">О нас</h3>
              <p className="text-muted-foreground">{vendor.description}</p>
            </div>

            {vendor.portfolio_images && vendor.portfolio_images.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Портфолио</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {vendor.portfolio_images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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