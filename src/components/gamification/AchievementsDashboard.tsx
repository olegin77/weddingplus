import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Lock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface AchievementsDashboardProps {
  weddingPlanId: string;
}

interface Achievement {
  id: string;
  code: string;
  name_ru: string;
  description_ru: string | null;
  icon: string;
  points: number;
  category: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  earned_at: string;
  achievements: Achievement;
}

const CATEGORY_LABELS: Record<string, string> = {
  onboarding: "Начало пути",
  vendors: "Работа с вендорами",
  planning: "Планирование",
  guests: "Гости",
  invitations: "Приглашения",
  website: "Свадебный сайт",
  special: "Особые достижения",
};

export function AchievementsDashboard({ weddingPlanId }: AchievementsDashboardProps) {
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: allAchievements } = useQuery({
    queryKey: ["all-achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });

  const { data: userAchievements } = useQuery({
    queryKey: ["user-achievements", user?.id, weddingPlanId],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select("*, achievements(*)")
        .eq("user_id", user.id)
        .eq("wedding_plan_id", weddingPlanId);

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user?.id,
  });

  const earnedIds = new Set(userAchievements?.map((ua) => ua.achievement_id) || []);
  const totalPoints = userAchievements?.reduce((sum, ua) => sum + (ua.achievements?.points || 0), 0) || 0;
  const maxPoints = allAchievements?.reduce((sum, a) => sum + a.points, 0) || 0;

  const groupedAchievements = allAchievements?.reduce((groups, achievement) => {
    const category = achievement.category;
    if (!groups[category]) groups[category] = [];
    groups[category].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500 rounded-full">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ваши достижения</h3>
                <p className="text-sm text-muted-foreground">
                  {earnedIds.size} из {allAchievements?.length || 0} получено
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-2xl font-bold text-amber-600">
                <Star className="h-6 w-6 fill-amber-500 text-amber-500" />
                {totalPoints}
              </div>
              <p className="text-xs text-muted-foreground">очков</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Прогресс</span>
              <span className="font-medium">{Math.round((totalPoints / maxPoints) * 100)}%</span>
            </div>
            <Progress value={(totalPoints / maxPoints) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      {groupedAchievements && Object.entries(groupedAchievements).map(([category, achievements]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            {CATEGORY_LABELS[category] || category}
          </h3>
          
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement, index) => {
              const isEarned = earnedIds.has(achievement.id);
              const earnedData = userAchievements?.find((ua) => ua.achievement_id === achievement.id);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`transition-all ${
                    isEarned 
                      ? "border-amber-300 bg-amber-50/50 dark:bg-amber-950/20" 
                      : "opacity-60 grayscale"
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`text-3xl ${isEarned ? "" : "opacity-50"}`}>
                          {isEarned ? achievement.icon : <Lock className="h-8 w-8 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-sm truncate">
                              {achievement.name_ru}
                            </h4>
                            <Badge variant={isEarned ? "default" : "outline"} className="shrink-0">
                              <Star className="h-3 w-3 mr-1" />
                              {achievement.points}
                            </Badge>
                          </div>
                          {achievement.description_ru && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {achievement.description_ru}
                            </p>
                          )}
                          {isEarned && earnedData && (
                            <p className="text-xs text-amber-600 mt-2">
                              ✓ Получено {new Date(earnedData.earned_at).toLocaleDateString("ru-RU")}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {(!allAchievements || allAchievements.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Достижения загружаются...</h3>
            <p className="text-sm text-muted-foreground">
              Скоро здесь появятся ваши награды
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
