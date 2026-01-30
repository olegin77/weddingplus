import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, Copy, Download, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface QRSession {
  id: string;
  amount: number;
  currency: string;
  description: string | null;
  qr_token: string;
  qr_image_url: string | null;
  status: string;
  expires_at: string;
  paid_at: string | null;
  created_at: string;
}

interface QRGenerationResult {
  success: boolean;
  sessionId: string;
  qrToken: string;
  qrImageUrl: string;
  paymentUrl: string;
  amount: number;
  expiresAt: string;
  vendorName: string;
}

export function QRPaymentGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [generatedQR, setGeneratedQR] = useState<QRGenerationResult | null>(null);

  // Check if user is a vendor
  const { data: vendorProfile } = useQuery({
    queryKey: ["vendor-profile-check"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("vendor_profiles")
        .select("id, business_name")
        .eq("user_id", user.id)
        .single();

      return data;
    },
  });

  // Get QR sessions history
  const { data: qrSessions } = useQuery({
    queryKey: ["qr-sessions"],
    queryFn: async () => {
      if (!vendorProfile) return [];

      const { data, error } = await supabase
        .from("qr_payment_sessions")
        .select("*")
        .eq("vendor_id", vendorProfile.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as QRSession[];
    },
    enabled: !!vendorProfile,
  });

  const generateQR = useMutation({
    mutationFn: async () => {
      const numAmount = parseFloat(amount);
      if (!numAmount || numAmount <= 0) {
        throw new Error("Введите корректную сумму");
      }

      const { data, error } = await supabase.functions.invoke("generate-qr-payment", {
        body: {
          amount: numAmount,
          description: description || undefined,
          expiresInMinutes: 30,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "Ошибка генерации");

      return data as QRGenerationResult;
    },
    onSuccess: (data) => {
      setGeneratedQR(data);
      queryClient.invalidateQueries({ queryKey: ["qr-sessions"] });
      toast({
        title: "QR-код создан",
        description: "Покажите QR-код клиенту для оплаты",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyPaymentLink = () => {
    if (generatedQR?.paymentUrl) {
      navigator.clipboard.writeText(generatedQR.paymentUrl);
      toast({
        title: "Скопировано",
        description: "Ссылка на оплату скопирована в буфер обмена",
      });
    }
  };

  const downloadQR = () => {
    if (generatedQR?.qrImageUrl) {
      const link = document.createElement("a");
      link.href = generatedQR.qrImageUrl;
      link.download = `qr-payment-${generatedQR.qrToken}.png`;
      link.click();
    }
  };

  if (!vendorProfile) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            QR-платежи доступны только для поставщиков
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Генератор QR-платежей
          </CardTitle>
          <CardDescription>
            Создайте QR-код для быстрой оплаты. Клиент сканирует и платит с телефона.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedQR ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма (UZS)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Описание</Label>
                  <Input
                    id="description"
                    placeholder="Услуга фотографа"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={() => generateQR.mutate()}
                disabled={generateQR.isPending || !amount}
                className="w-full"
              >
                {generateQR.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <QrCode className="h-4 w-4 mr-2" />
                )}
                Сгенерировать QR-код
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* QR Display */}
              <div className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img
                    src={generatedQR.qrImageUrl}
                    alt="QR код для оплаты"
                    className="w-64 h-64"
                  />
                </div>

                <div className="text-center mt-4">
                  <p className="text-3xl font-bold">
                    {generatedQR.amount.toLocaleString()} UZS
                  </p>
                  <p className="text-muted-foreground">{generatedQR.vendorName}</p>
                  <div className="flex items-center justify-center gap-1 mt-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Действителен до {new Date(generatedQR.expiresAt).toLocaleTimeString("ru-RU")}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={copyPaymentLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Скопировать ссылку
                </Button>
                <Button variant="outline" onClick={downloadQR}>
                  <Download className="h-4 w-4 mr-2" />
                  Скачать QR
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setGeneratedQR(null);
                  setAmount("");
                  setDescription("");
                }}
              >
                Создать новый QR
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle>История QR-платежей</CardTitle>
        </CardHeader>
        <CardContent>
          {qrSessions && qrSessions.length > 0 ? (
            <div className="space-y-3">
              {qrSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      session.status === "paid" 
                        ? "bg-green-100 text-green-600"
                        : session.status === "expired"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-blue-100 text-blue-600"
                    }`}>
                      {session.status === "paid" ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : session.status === "expired" ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {Number(session.amount).toLocaleString()} {session.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.description || "Без описания"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={
                      session.status === "paid" 
                        ? "default" 
                        : session.status === "expired" 
                        ? "secondary"
                        : "outline"
                    }>
                      {session.status === "paid" 
                        ? "Оплачено"
                        : session.status === "expired"
                        ? "Истёк"
                        : "Активен"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(session.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Нет истории QR-платежей
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QRPaymentGenerator;
