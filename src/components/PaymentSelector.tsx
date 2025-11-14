import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface PaymentSelectorProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
}

const PaymentSelector = ({ bookingId, amount, onSuccess }: PaymentSelectorProps) => {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const paymentProviders = [
    {
      id: 'payme',
      name: 'Payme',
      description: 'Оплата через Payme',
      logo: '💳'
    },
    {
      id: 'click',
      name: 'Click',
      description: 'Оплата через Click',
      logo: '💰'
    },
    {
      id: 'uzum',
      name: 'Uzum',
      description: 'Оплата через Uzum',
      logo: '🟣'
    },
    {
      id: 'apelsin',
      name: 'Apelsin',
      description: 'Оплата через Apelsin',
      logo: '🍊'
    }
  ];

  const handlePayment = async () => {
    if (!selectedProvider) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите способ оплаты",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          bookingId,
          amount,
          provider: selectedProvider,
          returnUrl: window.location.origin + '/dashboard'
        }
      });

      if (error) throw error;

      if (data.paymentUrl) {
        // Redirect to payment gateway
        window.location.href = data.paymentUrl;
      } else {
        toast({
          title: "Успешно",
          description: "Платеж обрабатывается"
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Ошибка оплаты",
        description: "Не удалось обработать платеж. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentProviders.map((provider) => (
          <Card
            key={provider.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedProvider === provider.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedProvider(provider.id)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{provider.logo}</span>
                {provider.name}
              </CardTitle>
              <CardDescription>{provider.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
        <div>
          <p className="text-sm text-muted-foreground">Сумма к оплате</p>
          <p className="text-2xl font-bold">{amount.toLocaleString()} UZS</p>
        </div>
        <Button 
          onClick={handlePayment} 
          disabled={!selectedProvider || isProcessing}
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Обработка...
            </>
          ) : (
            'Оплатить'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentSelector;