-- =============================================
-- Phase 6: Premium Features - Gift Registry & Gamification
-- =============================================

-- Gift Registry: Wishlists and contributions
CREATE TABLE public.gift_registry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT DEFAULT 'other',
  priority INTEGER DEFAULT 0,
  is_purchased BOOLEAN DEFAULT false,
  external_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gift contributions from guests
CREATE TABLE public.gift_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_item_id UUID NOT NULL REFERENCES public.gift_registry_items(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  contributor_name TEXT,
  contributor_email TEXT,
  amount NUMERIC NOT NULL,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Gamification: Achievement system
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  description_en TEXT,
  description_ru TEXT,
  description_uz TEXT,
  icon TEXT DEFAULT '🏆',
  points INTEGER DEFAULT 10,
  category TEXT DEFAULT 'general',
  trigger_condition JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User achievements (earned)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  wedding_plan_id UUID REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  UNIQUE(user_id, achievement_id, wedding_plan_id)
);

-- Planning milestones for progress tracking
CREATE TABLE public.planning_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_milestones ENABLE ROW LEVEL SECURITY;

-- Gift Registry Policies
CREATE POLICY "Users can manage their gift registry" ON public.gift_registry_items
  FOR ALL USING (
    wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
  );

CREATE POLICY "Public can view published gift registry" ON public.gift_registry_items
  FOR SELECT USING (true);

-- Gift Contributions Policies
CREATE POLICY "Anyone can contribute to gifts" ON public.gift_contributions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view contributions to their gifts" ON public.gift_contributions
  FOR SELECT USING (
    gift_item_id IN (
      SELECT id FROM public.gift_registry_items 
      WHERE wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
    )
  );

-- Achievements Policies (public read)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- User Achievements Policies
CREATE POLICY "Users can view their achievements" ON public.user_achievements
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Planning Milestones Policies
CREATE POLICY "Users can manage their milestones" ON public.planning_milestones
  FOR ALL USING (
    wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
  );

-- Insert default achievements
INSERT INTO public.achievements (code, name_en, name_ru, name_uz, description_ru, icon, points, category) VALUES
  ('first_login', 'First Steps', 'Первые шаги', 'Birinchi qadamlar', 'Вы начали планирование свадьбы!', '👋', 10, 'onboarding'),
  ('profile_complete', 'Profile Complete', 'Профиль заполнен', 'Profil to''ldirildi', 'Заполнили все данные профиля', '✅', 20, 'onboarding'),
  ('first_vendor', 'First Contact', 'Первый контакт', 'Birinchi aloqa', 'Забронировали первого вендора', '🤝', 30, 'vendors'),
  ('budget_master', 'Budget Master', 'Мастер бюджета', 'Byudjet ustasi', 'Заполнили бюджет полностью', '💰', 50, 'planning'),
  ('guest_list_ready', 'Guest List Ready', 'Список готов', 'Mehmonlar ro''yxati tayyor', 'Добавили всех гостей', '📋', 40, 'guests'),
  ('seating_done', 'Seating Arranged', 'Рассадка готова', 'O''rindiqlar tayyor', 'Рассадили всех гостей', '🪑', 60, 'guests'),
  ('invitations_sent', 'Invitations Sent', 'Приглашения отправлены', 'Taklifnomalar yuborildi', 'Отправили все приглашения', '💌', 50, 'invitations'),
  ('website_live', 'Website Live', 'Сайт запущен', 'Sayt ishga tushdi', 'Опубликовали свадебный сайт', '🌐', 70, 'website'),
  ('ai_explorer', 'AI Explorer', 'AI Исследователь', 'AI Tadqiqotchi', 'Использовали все AI функции', '🤖', 100, 'special'),
  ('wedding_complete', 'Happily Ever After', 'Долго и счастливо', 'Baxtli yakun', 'Свадьба состоялась!', '💒', 200, 'special');

-- Trigger for updated_at
CREATE TRIGGER update_gift_registry_items_updated_at
  BEFORE UPDATE ON public.gift_registry_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planning_milestones_updated_at
  BEFORE UPDATE ON public.planning_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update gift item amount when contribution is made
CREATE OR REPLACE FUNCTION public.update_gift_current_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'completed' THEN
    UPDATE public.gift_registry_items 
    SET current_amount = current_amount + NEW.amount,
        is_purchased = (current_amount + NEW.amount >= target_amount)
    WHERE id = NEW.gift_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_gift_amount_on_contribution
  AFTER INSERT OR UPDATE ON public.gift_contributions
  FOR EACH ROW EXECUTE FUNCTION public.update_gift_current_amount();