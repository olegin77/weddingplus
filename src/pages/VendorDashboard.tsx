import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingManagement } from "@/components/vendor/BookingManagement";
import { PortfolioManagement } from "@/components/vendor/PortfolioManagement";
import { VendorProfileForm } from "@/components/vendor/VendorProfileForm";
import { DollarSign, Calendar, Star, TrendingUp } from "lucide-react";

const VendorDashboard = () => {
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
    rating: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setVendorProfile(profile);

      if (!profile) {
        setLoading(false);
        return;
      }

      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("vendor_id", profile.id);

      const totalRevenue = bookingsData?.reduce((sum, b) => {
        if (b.status === "confirmed" || b.status === "completed") {
          return sum + (b.price || 0);
        }
        return sum;
      }, 0) || 0;

      setStats({
        totalBookings: bookingsData?.length || 0,
        pendingBookings: bookingsData?.filter((b) => b.status === "pending").length || 0,
        revenue: totalRevenue,
        rating: profile.rating || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground mt-1">Управляйте вашими услугами и бронированиями</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Загрузка...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Всего бронирований</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">За все время</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ожидают ответа</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">Требуют действия</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Доход</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Подтверждено</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Рейтинг</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
                  <p className="text-xs text-muted-foreground">Средняя оценка</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="bookings">
              <TabsList>
                <TabsTrigger value="bookings">Бронирования</TabsTrigger>
                <TabsTrigger value="profile">Профиль</TabsTrigger>
                <TabsTrigger value="portfolio">Портфолио</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings">
                <BookingManagement />
              </TabsContent>

              <TabsContent value="profile">
                <VendorProfileForm 
                  existingProfile={vendorProfile} 
                  onSuccess={fetchStats} 
                />
              </TabsContent>

              <TabsContent value="portfolio">
                <PortfolioManagement />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorDashboard;