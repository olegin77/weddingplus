-- Расширение vendor_profiles для более детальной информации о услугах
-- Добавляем новые поля для пакетов, особенностей и детальных характеристик

-- 1. Добавляем поле для пакетов услуг (JSON массив)
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS packages jsonb DEFAULT '[]'::jsonb;

-- 2. Добавляем поле для дополнительных услуг
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS additional_services text[] DEFAULT ARRAY[]::text[];

-- 3. Добавляем поле для включённого оборудования
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS included_items text[] DEFAULT ARRAY[]::text[];

-- 4. Добавляем поле для специальных возможностей
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS special_features jsonb DEFAULT '{}'::jsonb;

-- 5. Добавляем поле для времени доставки (для фото/видео)
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS delivery_time_days integer;

-- 6. Добавляем поле для минимального времени бронирования (часы)
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS min_booking_hours integer DEFAULT 4;

-- 7. Добавляем поле для цены за гостя (для кейтеринга)
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS price_per_guest numeric;

-- 8. Добавляем поле для типа площадки
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS venue_type text;

-- 9. Добавляем поле для ограничений площадки
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS venue_restrictions jsonb DEFAULT '{}'::jsonb;

-- 10. Добавляем поле для технических особенностей
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS technical_features jsonb DEFAULT '{}'::jsonb;

-- 11. Добавляем поле для бонусов
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS bonuses text[] DEFAULT ARRAY[]::text[];

-- 12. Добавляем поле для сертификатов
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS certifications text[] DEFAULT ARRAY[]::text[];

-- 13. Добавляем поле для процента предоплаты
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS deposit_percentage integer DEFAULT 50;

-- 14. Добавляем поле для условий отмены
ALTER TABLE public.vendor_profiles 
ADD COLUMN IF NOT EXISTS cancellation_policy text;

-- Добавляем индексы для оптимизации поиска
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_packages ON public.vendor_profiles USING gin(packages);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_special_features ON public.vendor_profiles USING gin(special_features);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_venue_type ON public.vendor_profiles(venue_type);

-- Комментарии для документации
COMMENT ON COLUMN public.vendor_profiles.packages IS 'Массив пакетов услуг: [{name, hours, price, includes[], description}]';
COMMENT ON COLUMN public.vendor_profiles.additional_services IS 'Дополнительные услуги: "Второй фотограф", "Дрон", "Альбом" и т.д.';
COMMENT ON COLUMN public.vendor_profiles.included_items IS 'Что включено в стоимость: "оборудование", "персонал", "декор"';
COMMENT ON COLUMN public.vendor_profiles.special_features IS 'Специфичные для категории: {hasDrone, providesSDE, has3DVisualization}';
COMMENT ON COLUMN public.vendor_profiles.delivery_time_days IS 'Дней до получения материалов (фото/видео)';
COMMENT ON COLUMN public.vendor_profiles.min_booking_hours IS 'Минимальное время бронирования в часах';
COMMENT ON COLUMN public.vendor_profiles.price_per_guest IS 'Цена за гостя (кейтеринг)';
COMMENT ON COLUMN public.vendor_profiles.venue_type IS 'Тип площадки: restaurant, banquet-hall, outdoor, hotel';
COMMENT ON COLUMN public.vendor_profiles.venue_restrictions IS 'Ограничения: {soundLimit, fireworks, petFriendly}';
COMMENT ON COLUMN public.vendor_profiles.technical_features IS 'Технические: {hasProjector, hasSound, hasLighting, hasDanceFloor}';
COMMENT ON COLUMN public.vendor_profiles.bonuses IS 'Бонусы: "Шампанское для молодожёнов", "Скидка 10%"';
COMMENT ON COLUMN public.vendor_profiles.certifications IS 'Сертификаты: "Сертифицированный Nikon", "Официальный партнёр"';