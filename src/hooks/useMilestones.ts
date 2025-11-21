import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

type WeddingPlan = Database['public']['Tables']['wedding_plans']['Row'];

interface MilestoneProgress {
  completionPercentage: number;
  bookedVendors: number;
  daysUntilWedding: number | null;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
}

const MILESTONES_STORAGE_KEY = "achieved_milestones";

export const useMilestones = (
  weddingPlan: WeddingPlan | null,
  bookedVendorsCount: number,
  totalVendorsNeeded: number
) => {
  const [achievedMilestones, setAchievedMilestones] = useState<Set<string>>(
    () => {
      const stored = localStorage.getItem(MILESTONES_STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }
  );

  const calculateProgress = (): MilestoneProgress => {
    if (!weddingPlan) {
      return { completionPercentage: 0, bookedVendors: 0, daysUntilWedding: null };
    }

    const items = [
      !!weddingPlan.wedding_date,
      !!weddingPlan.venue_location,
      !!weddingPlan.budget_total && weddingPlan.budget_total > 0,
      !!weddingPlan.estimated_guests && weddingPlan.estimated_guests > 0,
      !!(weddingPlan.style_preferences as string[])?.length || !!weddingPlan.theme,
      !!(weddingPlan.priorities as any),
      bookedVendorsCount >= totalVendorsNeeded,
    ];

    const completedCount = items.filter(Boolean).length;
    const completionPercentage = Math.round((completedCount / items.length) * 100);

    let daysUntilWedding: number | null = null;
    if (weddingPlan.wedding_date) {
      const weddingDate = new Date(weddingPlan.wedding_date);
      const today = new Date();
      daysUntilWedding = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      completionPercentage,
      bookedVendors: bookedVendorsCount,
      daysUntilWedding,
    };
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#f43f5e', '#ec4899', '#f97316', '#fbbf24'];

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const showMilestoneNotification = (milestone: Milestone) => {
    triggerConfetti();
    
    toast.success(milestone.title, {
      description: milestone.description,
      icon: milestone.icon,
      duration: 5000,
      className: "milestone-toast",
    });
  };

  const checkMilestones = () => {
    const progress = calculateProgress();
    const newAchievedMilestones = new Set(achievedMilestones);
    let hasNewMilestone = false;

    const milestones: Milestone[] = [
      {
        id: "first_step",
        title: "🎯 Отличное начало!",
        description: "Вы заполнили основную информацию о свадьбе",
        icon: "🎯",
        achieved: progress.completionPercentage >= 30,
      },
      {
        id: "half_way",
        title: "🎉 Половина пути пройдена!",
        description: "Ваш план свадьбы готов на 50%! Продолжайте в том же духе!",
        icon: "🎉",
        achieved: progress.completionPercentage >= 50,
      },
      {
        id: "almost_there",
        title: "💫 Почти готово!",
        description: "Осталось совсем немного - план готов на 75%!",
        icon: "💫",
        achieved: progress.completionPercentage >= 75,
      },
      {
        id: "fully_complete",
        title: "🎊 Поздравляем! План полностью готов!",
        description: "Вы заполнили все детали свадьбы на 100%!",
        icon: "🎊",
        achieved: progress.completionPercentage === 100,
      },
      {
        id: "all_vendors_booked",
        title: "✨ Команда мечты собрана!",
        description: `Вы забронировали всех ${totalVendorsNeeded} необходимых специалистов!`,
        icon: "✨",
        achieved: progress.bookedVendors >= totalVendorsNeeded,
      },
      {
        id: "one_month_left",
        title: "⏰ Осталось 30 дней!",
        description: "До вашей свадьбы остался всего месяц! Время последних приготовлений!",
        icon: "⏰",
        achieved: progress.daysUntilWedding !== null && progress.daysUntilWedding <= 30 && progress.daysUntilWedding > 0,
      },
      {
        id: "two_weeks_left",
        title: "🔔 Финальная прямая!",
        description: "Осталось всего 2 недели! Проверьте все детали еще раз!",
        icon: "🔔",
        achieved: progress.daysUntilWedding !== null && progress.daysUntilWedding <= 14 && progress.daysUntilWedding > 0,
      },
      {
        id: "one_week_left",
        title: "💍 Неделя до свадьбы!",
        description: "Ваш особенный день уже совсем близко! Наслаждайтесь последними приготовлениями!",
        icon: "💍",
        achieved: progress.daysUntilWedding !== null && progress.daysUntilWedding <= 7 && progress.daysUntilWedding > 0,
      },
    ];

    milestones.forEach((milestone) => {
      if (milestone.achieved && !achievedMilestones.has(milestone.id)) {
        newAchievedMilestones.add(milestone.id);
        showMilestoneNotification(milestone);
        hasNewMilestone = true;
      }
    });

    if (hasNewMilestone) {
      setAchievedMilestones(newAchievedMilestones);
      localStorage.setItem(
        MILESTONES_STORAGE_KEY,
        JSON.stringify(Array.from(newAchievedMilestones))
      );
    }
  };

  useEffect(() => {
    if (weddingPlan) {
      checkMilestones();
    }
  }, [weddingPlan, bookedVendorsCount]);

  return {
    achievedMilestones: Array.from(achievedMilestones),
    checkMilestones,
  };
};