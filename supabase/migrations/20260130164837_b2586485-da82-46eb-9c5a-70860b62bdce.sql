-- Таблица для фото пустых залов (загружаются площадками)
CREATE TABLE public.venue_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  angle TEXT DEFAULT 'frontal' CHECK (angle IN ('frontal', 'side', 'top', 'panoramic')),
  room_name TEXT,
  capacity INTEGER,
  dimensions JSONB,
  lighting_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Таблица для AI-визуализаций декора в залах
CREATE TABLE public.venue_visualizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  venue_id UUID NOT NULL REFERENCES public.vendor_profiles(id),
  decorator_id UUID REFERENCES public.vendor_profiles(id),
  base_image_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  decor_elements JSONB DEFAULT '[]',
  generation_params JSONB DEFAULT '{}',
  comparison_group_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем RLS
ALTER TABLE public.venue_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_visualizations ENABLE ROW LEVEL SECURITY;

-- RLS для venue_gallery
CREATE POLICY "Venue gallery images are viewable by everyone"
  ON public.venue_gallery
  FOR SELECT
  USING (true);

CREATE POLICY "Venue owners can manage their gallery"
  ON public.venue_gallery
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.vendor_profiles vp
      WHERE vp.id = venue_gallery.venue_id
      AND vp.user_id = auth.uid()
    )
  );

-- RLS для venue_visualizations
CREATE POLICY "Users can view their own visualizations"
  ON public.venue_visualizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans wp
      WHERE wp.id = venue_visualizations.wedding_plan_id
      AND wp.couple_user_id = auth.uid()
    )
    OR wedding_plan_id IS NULL
  );

CREATE POLICY "Users can create visualizations for their wedding"
  ON public.venue_visualizations
  FOR INSERT
  WITH CHECK (
    wedding_plan_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.wedding_plans wp
      WHERE wp.id = venue_visualizations.wedding_plan_id
      AND wp.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own visualizations"
  ON public.venue_visualizations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans wp
      WHERE wp.id = venue_visualizations.wedding_plan_id
      AND wp.couple_user_id = auth.uid()
    )
  );

-- Триггеры для updated_at
CREATE TRIGGER update_venue_gallery_updated_at
  BEFORE UPDATE ON public.venue_gallery
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_venue_visualizations_updated_at
  BEFORE UPDATE ON public.venue_visualizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Индексы для производительности
CREATE INDEX idx_venue_gallery_venue_id ON public.venue_gallery(venue_id);
CREATE INDEX idx_venue_visualizations_wedding_plan_id ON public.venue_visualizations(wedding_plan_id);
CREATE INDEX idx_venue_visualizations_venue_id ON public.venue_visualizations(venue_id);
CREATE INDEX idx_venue_visualizations_comparison_group ON public.venue_visualizations(comparison_group_id);