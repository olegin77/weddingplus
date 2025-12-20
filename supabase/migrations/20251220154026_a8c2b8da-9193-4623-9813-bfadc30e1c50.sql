-- Добавить конкретные поля в vendor_profiles для эффективной фильтрации
ALTER TABLE public.vendor_profiles
ADD COLUMN IF NOT EXISTS capacity_min integer,
ADD COLUMN IF NOT EXISTS capacity_max integer,
ADD COLUMN IF NOT EXISTS cuisine_types text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS dietary_options text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS music_genres text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS equipment_included boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS experience_years integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_parking boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS outdoor_available boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS provides_staff boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS min_guests integer,
ADD COLUMN IF NOT EXISTS max_guests integer;

-- Расширить wedding_plans для хранения детальных предпочтений пары
ALTER TABLE public.wedding_plans
ADD COLUMN IF NOT EXISTS cuisine_preferences text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS dietary_requirements text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS music_preferences text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS ceremony_type text,
ADD COLUMN IF NOT EXISTS venue_type_preference text,
ADD COLUMN IF NOT EXISTS outdoor_preference boolean,
ADD COLUMN IF NOT EXISTS parking_needed boolean,
ADD COLUMN IF NOT EXISTS budget_breakdown jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS category_priorities jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS program_preferences text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS time_preferences jsonb DEFAULT '{}'::jsonb;

-- Создать индексы для эффективного поиска
CREATE INDEX IF NOT EXISTS idx_vendor_capacity ON public.vendor_profiles(capacity_min, capacity_max);
CREATE INDEX IF NOT EXISTS idx_vendor_cuisine ON public.vendor_profiles USING GIN(cuisine_types);
CREATE INDEX IF NOT EXISTS idx_vendor_music ON public.vendor_profiles USING GIN(music_genres);
CREATE INDEX IF NOT EXISTS idx_vendor_styles ON public.vendor_profiles USING GIN(styles);
CREATE INDEX IF NOT EXISTS idx_vendor_category_rating ON public.vendor_profiles(category, rating DESC);

-- Обновить существующие площадки с данными из атрибутов
UPDATE public.vendor_profiles
SET 
  capacity_min = COALESCE((attributes->>'capacity')::integer - 50, 50),
  capacity_max = COALESCE((attributes->>'capacity')::integer, 200),
  has_parking = COALESCE((attributes->>'parking')::boolean, false),
  outdoor_available = COALESCE((attributes->>'outdoor')::boolean, false)
WHERE category = 'venue' AND capacity_max IS NULL;

-- Обновить кейтеринг с данными из атрибутов
UPDATE public.vendor_profiles
SET 
  min_guests = 50,
  max_guests = 500,
  provides_staff = true
WHERE category = 'caterer' AND min_guests IS NULL;