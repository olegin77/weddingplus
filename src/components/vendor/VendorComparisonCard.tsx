import { Star, MapPin, Check, X, Trophy, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Database } from "@/integrations/supabase/types";
import type { VendorMatchResult } from "@/types/vendor-attributes";

type VendorProfile = Database["public"]["Tables"]["vendor_profiles"]["Row"];

interface VendorComparisonCardProps {
  vendor: VendorProfile;
  matchResult: VendorMatchResult;
  onRemove: () => void;
  onViewDetails: () => void;
}

const formatPrice = (price: number | null | undefined): string => {
  if (!price) return "Не указана";
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} млн сум`;
  }
  if (price >= 1000) {
    return `${Math.round(price / 1000)} тыс сум`;
  }
  return `${price} сум`;
};

export function VendorComparisonCard({
  vendor,
  matchResult,
  onRemove,
  onViewDetails,
}: VendorComparisonCardProps) {
  const categoryScores = matchResult.categoryScores || {
    style: 0,
    rating: 0,
    budget: 0,
    experience: 0,
    categorySpecific: 0,
    verification: 0,
  };

  const positiveReasons = matchResult.reasons?.filter(
    (r) => r.score > 10
  ) || [];

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-base line-clamp-1">
              {vendor.business_name}
            </CardTitle>
            {vendor.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                {vendor.location}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mt-1 -mr-2"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Match Score */}
        <div className="text-center py-3 bg-primary/5 rounded-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">
              {matchResult.matchScore}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">Совпадение</span>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Рейтинг</span>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">
              {vendor.rating?.toFixed(1) || "—"}
            </span>
            <span className="text-xs text-muted-foreground">
              ({vendor.total_reviews || 0})
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Цена от</span>
          <span className="font-medium">
            {formatPrice(vendor.starting_price)}
          </span>
        </div>

        {/* Experience */}
        {vendor.experience_years && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Опыт</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{vendor.experience_years} лет</span>
            </div>
          </div>
        )}

        {/* Capacity */}
        {(vendor.min_guests || vendor.max_guests) && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Гости</span>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {vendor.min_guests || 0} — {vendor.max_guests || "∞"}
              </span>
            </div>
          </div>
        )}

        {/* Category Scores */}
        <div className="space-y-2 pt-2 border-t">
          <h4 className="text-xs font-medium text-muted-foreground uppercase">
            Показатели
          </h4>
          
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs w-20 text-muted-foreground">Стиль</span>
              <Progress value={categoryScores.style} className="flex-1 h-1.5" />
              <span className="text-xs w-8 text-right">{categoryScores.style}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-20 text-muted-foreground">Бюджет</span>
              <Progress value={categoryScores.budget} className="flex-1 h-1.5" />
              <span className="text-xs w-8 text-right">{categoryScores.budget}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-20 text-muted-foreground">Рейтинг</span>
              <Progress value={categoryScores.rating} className="flex-1 h-1.5" />
              <span className="text-xs w-8 text-right">{categoryScores.rating}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs w-20 text-muted-foreground">Опыт</span>
              <Progress value={categoryScores.experience} className="flex-1 h-1.5" />
              <span className="text-xs w-8 text-right">{categoryScores.experience}</span>
            </div>
          </div>
        </div>

        {/* Styles */}
        {vendor.styles && vendor.styles.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">
              Стили
            </h4>
            <div className="flex flex-wrap gap-1">
              {vendor.styles.slice(0, 4).map((style) => (
                <Badge key={style} variant="secondary" className="text-xs">
                  {style}
                </Badge>
              ))}
              {vendor.styles.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{vendor.styles.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Positive Reasons */}
        {positiveReasons.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <h4 className="text-xs font-medium text-muted-foreground uppercase">
              Преимущества
            </h4>
            <ul className="space-y-1">
              {positiveReasons.slice(0, 3).map((reason, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-1.5 text-xs text-muted-foreground"
                >
                  <Check className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                  <span>{reason.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-auto"
          onClick={onViewDetails}
        >
          Подробнее
        </Button>
      </CardContent>
    </Card>
  );
}
