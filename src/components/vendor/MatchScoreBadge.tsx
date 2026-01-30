/**
 * Компонент отображения процента совместимости вендора
 */

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, XCircle, AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import type { VendorMatchResult, MatchReason, ExclusionReason } from "@/types/vendor-attributes";
import { cn } from "@/lib/utils";

interface MatchScoreBadgeProps {
  matchResult?: VendorMatchResult;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MatchScoreBadge({
  matchResult,
  showDetails = false,
  size = "md",
  className,
}: MatchScoreBadgeProps) {
  if (!matchResult) return null;

  const { matchScore, excluded, exclusionReason, reasons, categoryScores } = matchResult;

  // Определяем цвет и стиль на основе score
  const getScoreStyle = (score: number) => {
    if (score >= 80) return { color: "text-green-600", bg: "bg-green-100", border: "border-green-200" };
    if (score >= 60) return { color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
    if (score >= 40) return { color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200" };
    return { color: "text-red-600", bg: "bg-red-100", border: "border-red-200" };
  };

  const scoreStyle = getScoreStyle(matchScore);

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5",
    md: "text-sm px-2 py-1",
    lg: "text-base px-3 py-1.5",
  };

  // Если исключён — показываем причину
  if (excluded && exclusionReason) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                "bg-muted text-muted-foreground border-muted-foreground/20 cursor-help",
                sizeClasses[size],
                className
              )}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Не подходит
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium text-destructive">Причина исключения:</p>
              <p>{exclusionReason.description}</p>
              {exclusionReason.vendorValue !== undefined && (
                <p className="text-xs text-muted-foreground">
                  У поставщика: {exclusionReason.vendorValue} | Нужно: {exclusionReason.requiredValue}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Компактный вариант — только badge
  if (!showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={cn(
                scoreStyle.bg,
                scoreStyle.border,
                scoreStyle.color,
                "cursor-help font-semibold",
                sizeClasses[size],
                className
              )}
            >
              <Sparkles className="h-3 w-3 mr-1" />
              {matchScore}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Совместимость</span>
                <span className={cn("font-bold", scoreStyle.color)}>{matchScore}%</span>
              </div>
              {reasons && reasons.length > 0 && (
                <ul className="space-y-1">
                  {reasons.slice(0, 3).map((reason, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs">
                      <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {reason.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Развёрнутый вариант с деталями
  return (
    <div className={cn("space-y-3", className)}>
      {/* Основной score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={cn("h-5 w-5", scoreStyle.color)} />
          <span className="font-medium">Совместимость</span>
        </div>
        <span className={cn("text-2xl font-bold", scoreStyle.color)}>{matchScore}%</span>
      </div>

      {/* Progress bar */}
      <Progress value={matchScore} className="h-2" />

      {/* Причины совпадения */}
      {reasons && reasons.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Почему подходит:</p>
          <ul className="space-y-1.5">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{reason.description}</span>
                {reason.score > 0 && (
                  <Badge variant="outline" className="ml-auto text-xs">
                    +{reason.score}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Детальные scores по категориям */}
      {categoryScores && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium text-muted-foreground">Детальная оценка:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <ScoreItem label="Стиль" score={categoryScores.style} max={25} />
            <ScoreItem label="Рейтинг" score={categoryScores.rating} max={25} />
            <ScoreItem label="Бюджет" score={categoryScores.budget} max={20} />
            <ScoreItem label="Опыт" score={categoryScores.experience} max={10} />
            <ScoreItem label="Специализация" score={categoryScores.categorySpecific} max={25} />
            <ScoreItem label="Верификация" score={categoryScores.verification} max={5} />
            {categoryScores.packages !== undefined && categoryScores.packages > 0 && (
              <ScoreItem label="Пакеты" score={categoryScores.packages} max={10} />
            )}
            {categoryScores.terms !== undefined && categoryScores.terms > 0 && (
              <ScoreItem label="Условия" score={categoryScores.terms} max={5} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, score, max }: { label: string; score: number; max: number }) {
  const percentage = Math.round((score / max) * 100);
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="font-medium w-6 text-right">{score}</span>
      </div>
    </div>
  );
}

/**
 * Компонент для отображения причины исключения
 */
export function ExclusionReasonCard({
  exclusionReason,
  className,
}: {
  exclusionReason: ExclusionReason;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20",
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-medium text-destructive">Не подходит для вашей свадьбы</p>
        <p className="text-sm text-muted-foreground mt-1">{exclusionReason.description}</p>
      </div>
    </div>
  );
}
