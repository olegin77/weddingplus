import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

export const NotificationToast = () => {
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        async (payload) => {
          console.log('Booking change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const booking = payload.new;
            
            // Fetch vendor details
            const { data: vendor } = await supabase
              .from('vendor_profiles')
              .select('business_name')
              .eq('id', booking.vendor_id)
              .single();

            toast({
              title: "Новое бронирование!",
              description: `Получен запрос на бронирование от ${vendor?.business_name || 'поставщика'}.`,
              duration: 5000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const booking = payload.new;
            
            if (booking.status === 'confirmed') {
              toast({
                title: "Бронирование подтверждено!",
                description: "Поставщик подтвердил ваше бронирование.",
                duration: 5000,
              });
            } else if (booking.status === 'cancelled') {
              toast({
                title: "Бронирование отменено",
                description: "Бронирование было отменено.",
                duration: 5000,
                variant: "destructive",
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  return null;
};
