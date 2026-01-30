import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/DashboardLayout";
import EscrowDashboard from "@/components/payment/EscrowDashboard";
import QRPaymentGenerator from "@/components/payment/QRPaymentGenerator";
import { Shield, QrCode, CreditCard, History } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PaymentsDashboard() {
  // Check user role
  const { data: userRole } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check if vendor
      const { data: vendor } = await supabase
        .from("vendor_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (vendor) return "vendor";

      // Check if admin
      const { data: admin } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (admin) return "admin";

      return "couple";
    },
  });

  // Get payment history
  const { data: payments } = useQuery({
    queryKey: ["payments-history"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          booking:bookings(
            booking_date,
            vendor:vendor_profiles(business_name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data;
    },
  });

  const isVendor = userRole === "vendor";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Платежи</h1>
          <p className="text-muted-foreground">
            Управление платежами и защищённые транзакции
          </p>
        </div>

        <Tabs defaultValue="escrow" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="escrow" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Эскроу</span>
            </TabsTrigger>
            {isVendor && (
              <TabsTrigger value="qr" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span className="hidden sm:inline">QR-Pay</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">История</span>
            </TabsTrigger>
            <TabsTrigger value="methods" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Способы</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="escrow">
            <EscrowDashboard />
          </TabsContent>

          {isVendor && (
            <TabsContent value="qr">
              <QRPaymentGenerator />
            </TabsContent>
          )}

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>История платежей</CardTitle>
                <CardDescription>
                  Все ваши транзакции за последнее время
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments && payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {payment.booking?.vendor?.business_name || "Платёж"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payment.booking?.booking_date
                              ? new Date(payment.booking.booking_date).toLocaleDateString("ru-RU")
                              : new Date(payment.created_at).toLocaleDateString("ru-RU")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">
                            {Number(payment.amount).toLocaleString()} {payment.currency}
                          </p>
                          <Badge
                            variant={
                              payment.status === "completed"
                                ? "default"
                                : payment.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {payment.status === "completed"
                              ? "Оплачено"
                              : payment.status === "pending"
                              ? "Ожидает"
                              : payment.status === "processing"
                              ? "Обработка"
                              : "Ошибка"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Нет истории платежей
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="methods">
            <Card>
              <CardHeader>
                <CardTitle>Способы оплаты</CardTitle>
                <CardDescription>
                  Поддерживаемые платёжные системы Узбекистана
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-4xl">💳</div>
                    <div>
                      <p className="font-medium">Payme</p>
                      <p className="text-sm text-muted-foreground">
                        Популярная платёжная система
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-4xl">💰</div>
                    <div>
                      <p className="font-medium">Click</p>
                      <p className="text-sm text-muted-foreground">
                        Банковская платёжная система
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-4xl">🟣</div>
                    <div>
                      <p className="font-medium">Uzum</p>
                      <p className="text-sm text-muted-foreground">
                        Современный платёжный сервис
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="text-4xl">🍊</div>
                    <div>
                      <p className="font-medium">Apelsin</p>
                      <p className="text-sm text-muted-foreground">
                        Быстрые переводы
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Защита эскроу
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Все платежи проходят через систему эскроу. Средства удерживаются
                    до подтверждения выполнения услуги, защищая обе стороны сделки.
                    Комиссия платформы: 5%.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
