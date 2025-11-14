import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get("payment_id");

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Оплата успешна!</CardTitle>
            <CardDescription>
              Ваш платеж был успешно обработан
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentId && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">ID транзакции</p>
                <p className="font-mono text-sm">{paymentId}</p>
              </div>
            )}
            <Button 
              onClick={() => navigate("/dashboard")} 
              className="w-full"
            >
              Вернуться в панель управления
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentSuccess;