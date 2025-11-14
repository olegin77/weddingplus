import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import PaymentSelector from "./PaymentSelector";

interface BookingFormProps {
  vendorId: string;
  onSuccess?: () => void;
}

export const BookingForm = ({ vendorId, onSuccess }: BookingFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [weddingPlans, setWeddingPlans] = useState<any[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    wedding_plan_id: "",
    booking_date: "",
    price: "",
    notes: "",
  });

  useEffect(() => {
    fetchWeddingPlans();
  }, []);

  const fetchWeddingPlans = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("wedding_plans")
      .select("*")
      .eq("couple_user_id", user.id);

    if (!error && data) {
      setWeddingPlans(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: booking, error } = await supabase.from("bookings").insert({
        vendor_id: vendorId,
        couple_user_id: user.id,
        wedding_plan_id: formData.wedding_plan_id,
        booking_date: formData.booking_date,
        price: parseFloat(formData.price),
        notes: formData.notes,
        status: "pending",
        payment_status: "pending",
      }).select().single();

      if (error) throw error;

      toast({
        title: "Бронирование создано",
        description: "Теперь выберите способ оплаты",
      });

      setCreatedBookingId(booking.id);
      setShowPayment(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать бронирование",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wedding_plan">Свадебный план</Label>
        <Select
          value={formData.wedding_plan_id}
          onValueChange={(value) => setFormData({ ...formData, wedding_plan_id: value })}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Выберите план" />
          </SelectTrigger>
          <SelectContent>
            {weddingPlans.map((plan) => (
              <SelectItem key={plan.id} value={plan.id}>
                {plan.theme || "Без темы"} - {new Date(plan.wedding_date).toLocaleDateString("ru-RU")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="booking_date">Дата бронирования</Label>
        <Input
          id="booking_date"
          type="datetime-local"
          value={formData.booking_date}
          onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Цена</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          placeholder="Введите цену"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Примечания</Label>
        <Textarea
          id="notes"
          placeholder="Дополнительная информация..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Отправка..." : "Создать бронирование"}
      </Button>
    </form>

    <Dialog open={showPayment} onOpenChange={setShowPayment}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Оплата бронирования</DialogTitle>
        </DialogHeader>
        {createdBookingId && (
          <PaymentSelector
            bookingId={createdBookingId}
            amount={parseFloat(formData.price)}
            onSuccess={() => {
              setShowPayment(false);
              onSuccess?.();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  </>
  );
};