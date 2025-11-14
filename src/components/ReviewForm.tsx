import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2 } from "lucide-react";

interface ReviewFormProps {
  vendorId: string;
  bookingId: string;
  onSuccess?: () => void;
}

const ReviewForm = ({ vendorId, bookingId, onSuccess }: ReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "Выберите рейтинг",
        description: "Пожалуйста, оцените услугу",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("reviews")
        .insert({
          vendor_id: vendorId,
          booking_id: bookingId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Отзыв опубликован!",
        description: "Спасибо за ваш отзыв"
      });

      // Reset form
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error: any) {
      console.error("Review submission error:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось опубликовать отзыв",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Ваша оценка *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className="text-sm text-muted-foreground">
            {rating === 1 && "Очень плохо"}
            {rating === 2 && "Плохо"}
            {rating === 3 && "Нормально"}
            {rating === 4 && "Хорошо"}
            {rating === 5 && "Отлично"}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="comment">Ваш отзыв (необязательно)</Label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Расскажите о вашем опыте работы с поставщиком..."
          rows={4}
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground">
          {comment.length}/1000 символов
        </p>
      </div>

      <Button type="submit" disabled={submitting || rating === 0} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Отправка...
          </>
        ) : (
          "Опубликовать отзыв"
        )}
      </Button>
    </form>
  );
};

export default ReviewForm;