-- WeddingPlus Marketplace - Расширенные seed данные
-- Большой реалистичный каталог поставщиков

-- Очистка старых vendors
TRUNCATE vendor_profiles CASCADE;

-- =====================
-- VENUES (Площадки) - 15 items
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
-- Премиум залы
(gen_random_uuid(), gen_random_uuid(), 'Grand Palace Hall', 'venue',
  'Роскошный банкетный зал в центре Ташкента. Вместимость до 1000 гостей. Мраморные полы, хрустальные люстры, панорамные окна.',
  15000000, 80000000, 'Tashkent', 4.9, true,
  ARRAY['luxury', 'large', 'indoor', 'classic', 'vip'],
  '{"venueType": "banquet-hall", "capacity": {"min": 300, "max": 1000}, "hasParking": true, "allowed_alcohol": true, "plate_price_min": 50, "plate_price_max": 150}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Crystal Ballroom', 'venue',
  'Элитный зал с панорамным видом на город. Современный дизайн, премиум сервис. Идеально для стильных свадеб.',
  20000000, 100000000, 'Tashkent', 5.0, true,
  ARRAY['luxury', 'modern', 'view', 'premium'],
  '{"venueType": "ballroom", "capacity": {"min": 200, "max": 800}, "hasParking": true, "allowed_alcohol": true, "plate_price_min": 80, "plate_price_max": 200}'::jsonb
),

-- Средний класс
(gen_random_uuid(), gen_random_uuid(), 'Silk Road Restaurant', 'venue',
  'Ресторан с национальным колоритом. Традиционный интерьер, узбекская и европейская кухня. Летняя веранда.',
  8000000, 30000000, 'Tashkent', 4.7, true,
  ARRAY['traditional', 'cozy', 'ethnic', 'garden'],
  '{"venueType": "restaurant", "capacity": {"min": 50, "max": 300}, "hasParking": true, "allowed_alcohol": false, "plate_price_min": 30, "plate_price_max": 70}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Green Garden Complex', 'venue',
  'Загородный комплекс с садом и бассейном. Идеально для летних свадеб. Детская площадка, беседки.',
  12000000, 45000000, 'Tashkent Region', 4.8, true,
  ARRAY['outdoor', 'garden', 'nature', 'family'],
  '{"venueType": "outdoor", "capacity": {"min": 100, "max": 500}, "hasParking": true, "hasAccommodation": true, "plate_price_min": 35, "plate_price_max": 80}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Sky Lounge Rooftop', 'venue',
  'Панорамная площадка на крыше с видом 360°. Современный дизайн, вечерняя подсветка города.',
  10000000, 40000000, 'Tashkent', 4.9, true,
  ARRAY['modern', 'rooftop', 'view', 'sunset', 'romantic'],
  '{"venueType": "rooftop", "capacity": {"min": 50, "max": 250}, "hasParking": false, "allowed_alcohol": true, "plate_price_min": 45, "plate_price_max": 100}'::jsonb
),

-- Бюджетные варианты
(gen_random_uuid(), gen_random_uuid(), 'Central Banquet Hall', 'venue',
  'Классический банкетный зал в центре. Хорошее соотношение цена-качество. Опытный персонал.',
  5000000, 20000000, 'Tashkent', 4.5, false,
  ARRAY['classic', 'affordable', 'central'],
  '{"venueType": "banquet-hall", "capacity": {"min": 100, "max": 400}, "hasParking": true, "plate_price_min": 20, "plate_price_max": 50}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Oasis Garden', 'venue',
  'Уютный сад для камерных торжеств. Фонтаны, живая музыка, домашняя атмосфера.',
  4000000, 15000000, 'Tashkent', 4.6, false,
  ARRAY['garden', 'cozy', 'intimate', 'small'],
  '{"venueType": "garden", "capacity": {"min": 30, "max": 150}, "hasParking": true, "plate_price_min": 25, "plate_price_max": 60}'::jsonb
),

-- Загородные
(gen_random_uuid(), gen_random_uuid(), 'Mountain View Resort', 'venue',
  'Загородный курорт в горах Чимгана. Живописная природа, свежий воздух, номера для гостей.',
  18000000, 60000000, 'Chimgan', 4.9, true,
  ARRAY['nature', 'mountain', 'resort', 'luxury'],
  '{"venueType": "resort", "capacity": {"min": 50, "max": 300}, "hasParking": true, "hasAccommodation": true, "plate_price_min": 60, "plate_price_max": 140}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Charvak Lake Villa', 'venue',
  'Вилла на берегу Чарвакского водохранилища. Невероятные виды, закаты на воде, яхт-клуб.',
  20000000, 70000000, 'Charvak', 5.0, true,
  ARRAY['water', 'villa', 'exclusive', 'scenic'],
  '{"venueType": "villa", "capacity": {"min": 40, "max": 200}, "hasParking": true, "hasAccommodation": true, "yacht_available": true, "plate_price_min": 70, "plate_price_max": 180}'::jsonb
),

-- Национальные
(gen_random_uuid(), gen_random_uuid(), 'Samarkand Heritage Hall', 'venue',
  'Традиционный зал в исторической части Самарканда. Национальный декор, восточное гостеприимство.',
  6000000, 25000000, 'Samarkand', 4.7, true,
  ARRAY['traditional', 'cultural', 'historic', 'ethnic'],
  '{"venueType": "heritage", "capacity": {"min": 150, "max": 600}, "hasParking": true, "plate_price_min": 25, "plate_price_max": 65}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Bukhara Plaza', 'venue',
  'Современный комплекс в Бухаре. Сочетание национальных традиций и современного комфорта.',
  7000000, 28000000, 'Bukhara', 4.6, false,
  ARRAY['traditional', 'modern', 'comfortable'],
  '{"venueType": "plaza", "capacity": {"min": 100, "max": 500}, "hasParking": true, "plate_price_min": 28, "plate_price_max": 70}'::jsonb
),

-- Необычные форматы
(gen_random_uuid(), gen_random_uuid(), 'Art Loft Space', 'venue',
  'Лофт пространство для креативных свадеб. Высокие потолки, кирпичные стены, свободная планировка.',
  8000000, 25000000, 'Tashkent', 4.8, true,
  ARRAY['loft', 'creative', 'modern', 'industrial', 'hipster'],
  '{"venueType": "loft", "capacity": {"min": 60, "max": 200}, "hasParking": false, "allowed_alcohol": true, "plate_price_min": 40, "plate_price_max": 90}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Botanical Garden Pavilion', 'venue',
  'Павильон в ботаническом саду. Свадьба среди цветов и зелени. Фотозоны с редкими растениями.',
  9000000, 32000000, 'Tashkent', 4.9, true,
  ARRAY['garden', 'botanical', 'nature', 'flowers', 'photogenic'],
  '{"venueType": "pavilion", "capacity": {"min": 80, "max": 350}, "hasParking": true, "plate_price_min": 35, "plate_price_max": 75}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Aqua Park Wedding Zone', 'venue',
  'Уникальная площадка в аквапарке. Бассейны, горки для гостей, развлечения на весь день.',
  15000000, 50000000, 'Tashkent', 4.7, false,
  ARRAY['unique', 'water', 'entertainment', 'family'],
  '{"venueType": "aquapark", "capacity": {"min": 100, "max": 400}, "hasParking": true, "entertainment_included": true, "plate_price_min": 45, "plate_price_max": 95}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Vintage Mansion', 'venue',
  'Старинный особняк с антикварной мебелью. Камин, библиотека, винный погреб. Для ценителей классики.',
  12000000, 45000000, 'Tashkent', 4.8, true,
  ARRAY['vintage', 'classic', 'antique', 'elegant', 'historic'],
  '{"venueType": "mansion", "capacity": {"min": 40, "max": 180}, "hasParking": true, "fireplace": true, "wine_cellar": true, "plate_price_min": 55, "plate_price_max": 120}'::jsonb
);

-- =====================
-- PHOTOGRAPHERS - 20 items
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
-- Премиум фотографы
(gen_random_uuid(), gen_random_uuid(), 'Alexander Ivanov Photography', 'photographer',
  'Международный фотограф. Публикации в Vogue, Harper''s Bazaar. Авторский стиль, постановочные кадры.',
  3000, 8000, 'Tashkent', 5.0, true,
  ARRAY['fine-art', 'fashion', 'editorial', 'luxury'],
  '{"style": "fine-art", "hours_packages": [10, 12, 14], "drone_included": true, "album_included": true, "video_included": false}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Timur Lens Studio', 'photographer',
  'Эмоциональная репортажная съёмка. Ловлю живые моменты, искренние эмоции. Портфолио 200+ свадеб.',
  1500, 4000, 'Tashkent', 4.9, true,
  ARRAY['reportage', 'emotional', 'candid', 'natural'],
  '{"style": "reportage", "hours_packages": [8, 10, 12], "drone_included": false, "sde_available": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Malika Art Photos', 'photographer',
  'Женский взгляд на свадебную фотографию. Нежные кадры, романтика, детали. Специализация на невестах.',
  1200, 3500, 'Tashkent', 4.8, true,
  ARRAY['romantic', 'soft', 'details', 'bride-focused'],
  '{"style": "romantic", "hours_packages": [6, 8, 10], "drone_included": false, "female_photographer": true}'::jsonb
),

-- Средний сегмент
(gen_random_uuid(), gen_random_uuid(), 'Classic Wedding Photos', 'photographer',
  'Классическая постановочная фотография. Традиционные кадры, семейные портреты, групповые фото.',
  800, 2000, 'Tashkent', 4.6, true,
  ARRAY['classic', 'traditional', 'posed', 'family'],
  '{"style": "classic", "hours_packages": [6, 8], "drone_included": false, "prints_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Urban Stories Photo', 'photographer',
  'Городская фотография. Съёмки на улицах, в парках, на крышах. Современный стиль.',
  1000, 2800, 'Tashkent', 4.7, false,
  ARRAY['urban', 'street', 'modern', 'lifestyle'],
  '{"style": "urban", "hours_packages": [6, 8, 10], "drone_included": false, "location_scouting": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Nature & Love Photography', 'photographer',
  'Специализация на выездных фотосессиях на природе. Закаты, горы, поля цветов.',
  1200, 3200, 'Tashkent', 4.8, true,
  ARRAY['nature', 'outdoor', 'sunset', 'landscape'],
  '{"style": "nature", "hours_packages": [8, 10], "drone_included": true, "travel_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Studio 7 Photography', 'photographer',
  'Студийная и выездная фотосъёмка. Своя студия для предсвадебной фотосессии.',
  900, 2500, 'Tashkent', 4.5, false,
  ARRAY['studio', 'versatile', 'professional'],
  '{"style": "studio", "hours_packages": [6, 8], "own_studio": true, "engagement_session": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Moment Catchers', 'photographer',
  'Команда из двух фотографов. Полное покрытие события, не упустим ни одной детали.',
  1800, 4500, 'Tashkent', 4.9, true,
  ARRAY['reportage', 'team', 'comprehensive'],
  '{"style": "reportage", "photographers_count": 2, "hours_packages": [10, 12], "drone_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Black & White Masters', 'photographer',
  'Специализация на чёрно-белой фотографии. Художественные кадры, игра света и тени.',
  1100, 3000, 'Tashkent', 4.7, false,
  ARRAY['artistic', 'bw', 'dramatic', 'cinematic'],
  '{"style": "artistic", "hours_packages": [8, 10], "color_photos": false, "prints_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Samarkand Lens', 'photographer',
  'Фотограф из Самарканда. Знаю лучшие локации с древней архитектурой. Уникальные исторические фоны.',
  800, 2200, 'Samarkand', 4.8, true,
  ARRAY['historic', 'architectural', 'cultural'],
  '{"style": "architectural", "hours_packages": [8, 10], "historic_locations": true}'::jsonb
),

-- Бюджетные
(gen_random_uuid(), gen_random_uuid(), 'Start Wedding Photo', 'photographer',
  'Начинающий фотограф с отличным портфолио. Доступные цены, креативный подход.',
  500, 1500, 'Tashkent', 4.4, false,
  ARRAY['beginner', 'affordable', 'creative'],
  '{"style": "mixed", "hours_packages": [6, 8], "portfolio_discount": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Budget Pro Photos', 'photographer',
  'Качественная фотосъёмка по доступным ценам. Быстрая обработка, все исходники в подарок.',
  600, 1800, 'Tashkent', 4.3, false,
  ARRAY['affordable', 'fast', 'practical'],
  '{"style": "reportage", "hours_packages": [6, 8], "raw_files_included": true, "quick_delivery": true}'::jsonb
),

-- Специализированные
(gen_random_uuid(), gen_random_uuid(), 'Drone Wedding Films', 'photographer',
  'Аэрофотосъёмка и видео с дрона. Панорамные виды, уникальные ракурсы, кинематографичные кадры.',
  1500, 4000, 'Tashkent', 4.9, true,
  ARRAY['drone', 'aerial', 'cinematic', 'video'],
  '{"style": "aerial", "hours_packages": [4, 6, 8], "4k_video": true, "photo_and_video": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Night Photography Pro', 'photographer',
  'Специалист по вечерним и ночным съёмкам. Работа со светом, фейерверки, огненное шоу.',
  1300, 3500, 'Tashkent', 4.7, true,
  ARRAY['night', 'evening', 'lighting', 'fireworks'],
  '{"style": "night", "hours_packages": [4, 6], "fireworks_experience": true, "lighting_equipment": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Polaroid Memories', 'photographer',
  'Живые моментальные снимки Polaroid для гостей. Ретро стиль, мгновенные фото на память.',
  400, 1200, 'Tashkent', 4.5, false,
  ARRAY['polaroid', 'instant', 'retro', 'fun'],
  '{"style": "polaroid", "hours_packages": [4, 6, 8], "instant_prints": true, "photo_booth": true}'::jsonb
),

-- Региональные
(gen_random_uuid(), gen_random_uuid(), 'Fergana Valley Photography', 'photographer',
  'Фотограф из Ферганской долины. Национальный колорит, традиционные обряды, этнические мотивы.',
  700, 2000, 'Fergana', 4.6, false,
  ARRAY['ethnic', 'traditional', 'regional'],
  '{"style": "ethnic", "hours_packages": [8, 10], "traditional_ceremonies": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Khiva Heritage Photos', 'photographer',
  'Съёмки на фоне древних памятников Хивы. Восточная сказка, архитектура, история.',
  900, 2500, 'Khiva', 4.7, true,
  ARRAY['heritage', 'architectural', 'oriental'],
  '{"style": "architectural", "hours_packages": [8, 10], "unesco_sites": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Andijan Modern Photo', 'photographer',
  'Современная фотография в Андижане. Репортаж, постановка, обработка в день свадьбы.',
  650, 1900, 'Andijan', 4.4, false,
  ARRAY['modern', 'reportage', 'same-day'],
  '{"style": "modern", "hours_packages": [6, 8], "same_day_edit": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Namangan Wedding Art', 'photographer',
  'Художественная фотография. Каждый кадр - произведение искусства. Авторская обработка.',
  850, 2300, 'Namangan', 4.6, false,
  ARRAY['artistic', 'creative', 'fine-art'],
  '{"style": "artistic", "hours_packages": [8, 10], "artistic_processing": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Termez Sun Photography', 'photographer',
  'Южное солнце, яркие краски, тёплые тона. Специализация на летних свадьбах.',
  700, 2100, 'Termez', 4.5, false,
  ARRAY['sunny', 'bright', 'warm', 'summer'],
  '{"style": "bright", "hours_packages": [6, 8], "summer_specialist": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Nukus Desert Photography', 'photographer',
  'Уникальные локации пустыни Каракалпакстана. Закаты в песках, юрточные camp, этнический колорит.',
  1000, 2800, 'Nukus', 4.7, true,
  ARRAY['desert', 'unique', 'ethnic', 'adventure'],
  '{"style": "desert", "hours_packages": [8, 10, 12], "unique_locations": true, "camping_included": false}'::jsonb
);

-- Продолжение следует...
-- Добавим decorators, music, makeup, videographers в следующей части

-- =====================
-- VIDEOGRAPHERS - 15 items
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Cinematic Wedding Films', 'videographer',
  'Свадебное кино как в Голливуде. 4K съёмка, дрон, стедикам, цветокоррекция. Трейлер в подарок.',
  2500, 7000, 'Tashkent', 5.0, true,
  ARRAY['cinematic', 'hollywood', '4k', 'premium'],
  '{"equipment": ["4k-camera", "drone", "steadicam"], "delivery_days": 30, "trailer_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Love Story Productions', 'videographer',
  'Документальный стиль. История вашей любви от утра до вечера. Интервью с гостями.',
  1800, 4500, 'Tashkent', 4.9, true,
  ARRAY['documentary', 'storytelling', 'emotional'],
  '{"equipment": ["4k-camera", "audio"], "delivery_days": 25, "interviews_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Quick Edit Video', 'videographer',
  'Same Day Edit - видео готово в день свадьбы! Показ на банкете, восторг гарантирован.',
  2000, 5000, 'Tashkent', 4.8, true,
  ARRAY['same-day-edit', 'fast', 'live-screening'],
  '{"equipment": ["4k-camera"], "delivery_days": 0, "same_day_edit": true, "live_screening": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Drone Masters Uzbekistan', 'videographer',
  'Аэровидеосъёмка. Панорамы, облёты, необычные ракурсы. Сертифицированные пилоты.',
  1500, 3500, 'Tashkent', 4.7, true,
  ARRAY['drone', 'aerial', 'panoramic'],
  '{"equipment": ["drone-4k", "fpv-drone"], "delivery_days": 20, "certified_pilots": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Retro VHS Wedding', 'videographer',
  'Винтажная видеосъёмка в стиле 90-х. VHS эффект, ретро фильтры, ностальгия.',
  800, 2000, 'Tashkent', 4.5, false,
  ARRAY['retro', 'vintage', 'vhs', 'nostalgic'],
  '{"style": "retro", "delivery_days": 15, "vhs_effect": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Muslim Wedding Films', 'videographer',
  'Съёмка никоха и традиционных обрядов. Уважение к традициям, халяльный подход.',
  1200, 3000, 'Tashkent', 4.8, true,
  ARRAY['traditional', 'muslim', 'nikoh', 'respectful'],
  '{"style": "traditional", "delivery_days": 30, "nikoh_specialist": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Multi-Camera Productions', 'videographer',
  '5 камер одновременно. Полное покрытие: молодые, гости, детали, общий план, эмоции.',
  2200, 5500, 'Tashkent', 4.9, true,
  ARRAY['multi-camera', 'comprehensive', 'professional'],
  '{"equipment": ["5-cameras", "audio"], "delivery_days": 35, "camera_count": 5}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Night Vision Weddings', 'videographer',
  'Специалисты по вечерним торжествам. Работа со светом, огненные шоу, фейерверки.',
  1400, 3800, 'Tashkent', 4.7, false,
  ARRAY['night', 'evening', 'fireworks', 'lighting'],
  '{"equipment": ["low-light-camera"], "delivery_days": 25, "fireworks_experience": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Budget Video Tashkent', 'videographer',
  'Доступная видеосъёмка без потери качества. Full HD, базовая обработка, быстрая доставка.',
  600, 1800, 'Tashkent', 4.3, false,
  ARRAY['affordable', 'fullhd', 'basic'],
  '{"equipment": ["fullhd-camera"], "delivery_days": 20, "basic_edit": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Pro Wedding Cinema', 'videographer',
  'Профессиональная команда. RED камера, кинематограф, голливудский монтаж.',
  4000, 10000, 'Tashkent', 5.0, true,
  ARRAY['cinema', 'red-camera', 'premium', 'hollywood'],
  '{"equipment": ["red-camera", "cinema-lenses"], "delivery_days": 45, "color_grading": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Samarkand Video Studio', 'videographer',
  'Видеостудия в Самарканде. Съёмка на фоне Регистана, мечетей, медресе.',
  1000, 2800, 'Samarkand', 4.6, false,
  ARRAY['regional', 'historic', 'architectural'],
  '{"equipment": ["4k-camera"], "delivery_days": 30, "historic_locations": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Live Stream Weddings', 'videographer',
  'Прямая трансляция свадьбы в интернет. Родственники из других городов смогут смотреть онлайн.',
  1500, 3500, 'Tashkent', 4.8, true,
  ARRAY['live-stream', 'online', 'broadcast'],
  '{"equipment": ["streaming-setup"], "delivery_days": 10, "live_streaming": true, "youtube_facebook": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Highlight Reels Studio', 'videographer',
  'Короткие динамичные ролики для Instagram и TikTok. Vertical video, тренды, вирусный контент.',
  1200, 3200, 'Tashkent', 4.7, true,
  ARRAY['social-media', 'instagram', 'tiktok', 'vertical'],
  '{"equipment": ["mobile-optimized"], "delivery_days": 7, "vertical_video": true, "social_ready": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Documentary Wedding Films', 'videographer',
  'Документальный подход. Без постановки, только жизнь. Как она есть - искренняя и настоящая.',
  1600, 4200, 'Tashkent', 4.8, true,
  ARRAY['documentary', 'authentic', 'natural', 'unscripted'],
  '{"equipment": ["4k-camera", "audio"], "delivery_days": 35, "no_staging": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Animation Wedding Studio', 'videographer',
  'Добавляем анимацию и графику в видео. Титры, переходы, эффекты, мультипликация.',
  1800, 4500, 'Tashkent', 4.6, false,
  ARRAY['animation', 'graphics', 'effects', 'creative'],
  '{"equipment": ["4k-camera"], "delivery_days": 40, "animation_included": true, "graphics_design": true}'::jsonb
);


-- =====================
-- DECORATORS - 15 items  
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Luxury Event Decor', 'decorator',
  'Премиальное оформление. Живые цветы, дизайнерская мебель, авторские концепции. Работаем с мировыми брендами.',
  10000000, 50000000, 'Tashkent', 5.0, true,
  ARRAY['luxury', 'premium', 'flowers', 'designer'],
  '{"services": ["full-decor", "flowers", "furniture", "lighting"], "provides3DVisualization": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Flower Paradise', 'decorator',
  'Цветочная сказка. Арки из роз, композиции, букеты. Свой питомник, свежие цветы ежедневно.',
  5000000, 25000000, 'Tashkent', 4.9, true,
  ARRAY['flowers', 'romantic', 'garden', 'roses'],
  '{"specialty": "flowers", "own_greenhouse": true, "rose_arches": true, "flower_walls": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Modern Minimalist Decor', 'decorator',
  'Минимализм и стиль. Чистые линии, геометрия, монохром. Для современных пар.',
  4000000, 18000000, 'Tashkent', 4.7, true,
  ARRAY['minimalist', 'modern', 'geometric', 'simple'],
  '{"style": "minimalist", "reuse_potential": true, "eco_materials": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Boho Dreams Decoration', 'decorator',
  'Бохо стиль. Макраме, пампасная трава, натуральные ткани, винтажная мебель. Свободная атмосфера.',
  3500000, 15000000, 'Tashkent', 4.8, false,
  ARRAY['boho', 'natural', 'vintage', 'pampas'],
  '{"style": "boho", "pampas_grass": true, "macrame": true, "vintage_furniture": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Oriental Elegance', 'decorator',
  'Восточный стиль. Национальные орнаменты, сюзане, ковры, пиалы. Аутентичный Узбекистан.',
  4000000, 20000000, 'Tashkent', 4.9, true,
  ARRAY['oriental', 'ethnic', 'traditional', 'suzani'],
  '{"style": "oriental", "suzani_textiles": true, "national_patterns": true, "tea_ceremony": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Balloon Magic', 'decorator',
  'Воздушные шары всех видов. Арки, фигуры, гелиевые облака, фотозоны. Яркий праздник.',
  1500000, 8000000, 'Tashkent', 4.5, false,
  ARRAY['balloons', 'colorful', 'fun', 'budget'],
  '{"specialty": "balloons", "helium_balloons": true, "balloon_arches": true, "installations": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'LED & Light Show', 'decorator',
  'Световое оформление. LED экраны, проекции, лазерное шоу, неоновые надписи. Вау-эффект!',
  6000000, 28000000, 'Tashkent', 4.9, true,
  ARRAY['lighting', 'led', 'modern', 'tech', 'show'],
  '{"equipment": ["led-screens", "projectors", "lasers"], "light_show": true, "video_mapping": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Eco Green Weddings', 'decorator',
  'Эко-оформление. Переработанные материалы, живые растения, никакого пластика. Сохраним планету!',
  3000000, 12000000, 'Tashkent', 4.6, true,
  ARRAY['eco', 'green', 'sustainable', 'natural'],
  '{"style": "eco", "recycled_materials": true, "no_plastic": true, "plants_for_guests": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Fairy Tale Decor', 'decorator',
  'Сказочное оформление. Замки из ткани, карета, троны, волшебная атмосфера. Для мечтателей.',
  5000000, 22000000, 'Tashkent', 4.7, false,
  ARRAY['fairytale', 'fantasy', 'magical', 'princess'],
  '{"style": "fairytale", "carriage": true, "thrones": true, "castle_decor": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Rustic Charm', 'decorator',
  'Рустик стиль. Дерево, мешковина, полевые цветы, винтажные детали. Уютная деревенская романтика.',
  2800000, 12000000, 'Tashkent', 4.6, false,
  ARRAY['rustic', 'wood', 'vintage', 'countryside'],
  '{"style": "rustic", "wood_elements": true, "wildflowers": true, "burlap": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Crystal & Mirrors Studio', 'decorator',
  'Зеркальные элементы, хрусталь, стекло. Блеск и роскошь. Инстаграмные фотозоны.',
  7000000, 30000000, 'Tashkent', 4.8, true,
  ARRAY['glamorous', 'mirrors', 'crystal', 'luxury'],
  '{"specialty": "mirrors-crystal", "instagram_zones": true, "reflective_surfaces": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Paper Art Decorations', 'decorator',
  'Бумажные цветы и декор. Уникально, доступно, не вянет. Огромные инсталляции.',
  2000000, 9000000, 'Tashkent', 4.4, false,
  ARRAY['paper', 'creative', 'affordable', 'unique'],
  '{"specialty": "paper-flowers", "giant_flowers": true, "never_wilts": true, "eco_friendly": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Textile Dreams', 'decorator',
  'Драпировки, балдахины, ткани. Превращаем любой зал в дворец. Богатые фактуры.',
  3500000, 16000000, 'Tashkent', 4.7, true,
  ARRAY['textile', 'draping', 'elegant', 'soft'],
  '{"specialty": "textiles", "ceiling_draping": true, "fabric_walls": true, "canopy": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Industrial Chic Decor', 'decorator',
  'Лофт стиль. Металл, дерево, кирпич, эдисон лампы. Для нестандартных площадок.',
  3000000, 13000000, 'Tashkent', 4.6, false,
  ARRAY['industrial', 'loft', 'metal', 'edison'],
  '{"style": "industrial", "metal_elements": true, "edison_bulbs": true, "reclaimed_wood": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Neon Party Decor', 'decorator',
  'Неоновое оформление для вечеринок. Яркие цвета, LED надписи, дискотека 80-х.',
  4000000, 18000000, 'Tashkent', 4.7, true,
  ARRAY['neon', 'party', 'colorful', '80s', 'disco'],
  '{"style": "neon", "led_signs": true, "colorful_lighting": true, "party_atmosphere": true}'::jsonb
);


-- =====================
-- MUSIC (Музыка) - 20 items
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(gen_random_uuid(), gen_random_uuid(), 'DJ Maestro', 'music',
  'Топ DJ Узбекистана. 15 лет опыта, 500+ свадеб. Своя аппаратура, световое шоу, читаю толпу.',
  1500, 4000, 'Tashkent', 5.0, true,
  ARRAY['dj', 'electronic', 'party', 'professional'],
  '{"equipment": ["professional-dj-setup", "lights"], "music_styles": ["pop", "dance", "house"], "mc_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Jazz Quartet "Silk"', 'music',
  'Живой джаз. Саксофон, контрабас, фортепиано, вокал. Элегантная атмосфера для утончённых пар.',
  2000, 5000, 'Tashkent', 4.9, true,
  ARRAY['jazz', 'live', 'elegant', 'sophisticated'],
  '{"band_size": 4, "instruments": ["saxophone", "bass", "piano", "vocals"], "repertoire_size": 100}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Узбекский Народный Ансамбль', 'music',
  'Национальная музыка. Дойра, дутар, карнай. Традиционные песни и танцы. Аутентично!',
  1200, 3500, 'Tashkent', 4.8, true,
  ARRAY['traditional', 'folk', 'ethnic', 'national'],
  '{"instruments": ["doira", "dutar", "karnay"], "traditional_dances": true, "national_costumes": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'String Orchestra "Harmony"', 'music',
  'Струнный оркестр. Скрипки, виолончели, классическая музыка. Романтика и возвышенность.',
  3000, 7000, 'Tashkent', 4.9, true,
  ARRAY['classical', 'orchestra', 'strings', 'romantic'],
  '{"musicians_count": 12, "instruments": ["violin", "cello", "viola"], "classical_repertoire": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Rock Cover Band "Wedding Rocks"', 'music',
  'Живой рок! Каверы известных хитов. Энергия, драйв, незабываемое шоу.',
  1800, 4500, 'Tashkent', 4.7, false,
  ARRAY['rock', 'covers', 'energy', 'live'],
  '{"band_size": 5, "instruments": ["guitar", "bass", "drums", "vocals"], "cover_songs": 200}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Acoustic Duo "Two Hearts"', 'music',
  'Гитара и вокал. Романтические песни, душевные мелодии. Идеально для церемонии.',
  800, 2500, 'Tashkent', 4.6, false,
  ARRAY['acoustic', 'duo', 'romantic', 'intimate'],
  '{"musicians_count": 2, "instruments": ["guitar", "vocals"], "ceremony_specialist": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'DJ + Saxophone Live', 'music',
  'Уникальное сочетание: диджей + живой саксофон. Современно и стильно.',
  2200, 5500, 'Tashkent', 4.9, true,
  ARRAY['dj', 'saxophone', 'live', 'fusion', 'modern'],
  '{"format": "dj-live-instrument", "instruments": ["saxophone"], "lighting_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Piano & Violin Duo', 'music',
  'Фортепиано и скрипка. Классика, романсы, современная музыка в классической обработке.',
  1500, 4000, 'Tashkent', 4.7, true,
  ARRAY['classical', 'piano', 'violin', 'elegant'],
  '{"musicians_count": 2, "instruments": ["piano", "violin"], "classical_modern_mix": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Pop Cover Band "Party Mix"', 'music',
  'Поп-музыка и хиты. Танцевальные треки, хиты из charts. Зажигательное веселье.',
  1600, 4200, 'Tashkent', 4.6, false,
  ARRAY['pop', 'covers', 'dance', 'party'],
  '{"band_size": 4, "repertoire": "pop-hits", "dance_music": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Latin Dance Band', 'music',
  'Латиноамериканская музыка. Сальса, бачата, меренге. Танцы до утра!',
  2000, 5000, 'Tashkent', 4.8, true,
  ARRAY['latin', 'salsa', 'dance', 'exotic'],
  '{"music_style": "latin", "dance_instructor": true, "percussion": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Bollywood Music Show', 'music',
  'Болливудское шоу. Индийские песни, танцы, яркие костюмы. Экзотика и веселье.',
  1800, 4500, 'Tashkent', 4.7, false,
  ARRAY['bollywood', 'indian', 'exotic', 'colorful'],
  '{"music_style": "bollywood", "dancers_included": true, "traditional_costumes": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'DJ Student Mix', 'music',
  'Молодой диджей, свежий взгляд. Современные треки, доступные цены. TikTok хиты.',
  600, 1800, 'Tashkent', 4.3, false,
  ARRAY['dj', 'young', 'modern', 'affordable', 'tiktok'],
  '{"experience_years": 2, "social_media_music": true, "budget_friendly": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Karaoke Wedding Fun', 'music',
  'Караоке на свадьбе! Профессиональная система, 10000 песен, микрофоны для гостей.',
  1000, 3000, 'Tashkent', 4.5, false,
  ARRAY['karaoke', 'interactive', 'fun', 'entertainment'],
  '{"equipment": "professional-karaoke", "song_database": 10000, "multiple_mics": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Traditional Doira Ensemble', 'music',
  'Ансамбль дойрачи. Ритмичные узбекские мелодии. Для традиционных свадеб и обрядов.',
  800, 2500, 'Tashkent', 4.7, true,
  ARRAY['traditional', 'doira', 'ethnic', 'rhythmic'],
  '{"musicians_count": 6, "traditional_instruments": true, "national_ceremonies": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Violin Solo Artist', 'music',
  'Скрипач-виртуоз. Церемония, фуршет, романтические моменты. Классика и современность.',
  700, 2000, 'Tashkent', 4.6, false,
  ARRAY['violin', 'solo', 'classical', 'ceremony'],
  '{"musician": "solo", "ceremony_music": true, "repertoire_versatile": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Harpist Angel', 'music',
  'Арфистка. Волшебные звуки арфы для церемонии и коктейля. Редкий и изысканный инструмент.',
  1200, 3500, 'Tashkent', 4.8, true,
  ARRAY['harp', 'angelic', 'ceremony', 'rare', 'elegant'],
  '{"instrument": "harp", "ceremony_specialist": true, "classical_modern": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'EDM Wedding Party', 'music',
  'Электронная танцевальная музыка. Басы, лазеры, дым-машина. Клубная атмосфера.',
  1800, 4800, 'Tashkent', 4.7, false,
  ARRAY['edm', 'electronic', 'club', 'party', 'young'],
  '{"music_style": "edm", "lighting_show": true, "smoke_machine": true, "young_audience": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Live Banda Orchestra', 'music',
  'Banda/Brass band. Духовые инструменты, марши, веселье. Энергичные мелодии.',
  1500, 4000, 'Tashkent', 4.6, false,
  ARRAY['banda', 'brass', 'marching', 'energetic'],
  '{"musicians_count": 8, "instruments": ["trumpet", "trombone", "tuba"], "outdoor_performances": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Retro Disco 80s', 'music',
  'Дискотека 80-х годов! Ретро хиты, диско-шар, костюмы эпохи. Ностальгия и веселье.',
  1200, 3200, 'Tashkent', 4.5, false,
  ARRAY['disco', 'retro', '80s', 'nostalgic', 'fun'],
  '{"music_era": "80s", "disco_ball": true, "retro_costumes": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'World Music Fusion', 'music',
  'Микс культур. Индия, Латинская Америка, Восток, Африка. Мультикультурные свадьбы.',
  2000, 5200, 'Tashkent', 4.8, true,
  ARRAY['world', 'fusion', 'multicultural', 'exotic'],
  '{"music_styles": ["indian", "latin", "oriental", "african"], "multicultural": true}'::jsonb
);


-- =====================
-- MAKEUP (Визаж и стилисты) - 15 items
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Luxury Bridal Beauty', 'makeup',
  'Топ визажист. Работа с невестами знаменитостей. Airbrush, HD макияж, стойкость 24 часа.',
  500, 1500, 'Tashkent', 5.0, true,
  ARRAY['luxury', 'bridal', 'airbrush', 'hd', 'celebrity'],
  '{"services": ["makeup", "hair", "trial"], "airbrush": true, "hd_makeup": true, "celebrity_clients": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Natural Glow Studio', 'makeup',
  'Естественная красота. Nude макияж, лёгкие волны, свежий образ. Подчеркнём вашу природную красоту.',
  250, 800, 'Tashkent', 4.8, true,
  ARRAY['natural', 'nude', 'fresh', 'minimal'],
  '{"style": "natural", "services": ["makeup", "hair"], "eco_cosmetics": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Glamour Queen MUA', 'makeup',
  'Гламурный макияж. Смоки айс, стрелки, яркие губы. Голливудские волны. Будете звездой!',
  350, 1000, 'Tashkent', 4.7, true,
  ARRAY['glamour', 'bold', 'hollywood', 'dramatic'],
  '{"style": "glamour", "services": ["makeup", "hair", "lashes"], "false_lashes": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Oriental Beauty Artist', 'makeup',
  'Восточный макияж. Яркие глаза, стрелки, брови. Традиционный и современный стиль.',
  280, 850, 'Tashkent', 4.6, false,
  ARRAY['oriental', 'traditional', 'bold-eyes'],
  '{"style": "oriental", "services": ["makeup", "hair", "henna"], "henna_art": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Full Bridal Service', 'makeup',
  'Полный образ невесты. Макияж + причёска + помощь с платьем + украшения. Всё включено.',
  400, 1200, 'Tashkent', 4.9, true,
  ARRAY['full-service', 'bridal', 'comprehensive'],
  '{"services": ["makeup", "hair", "styling", "accessories"], "dress_assistance": true, "full_day": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Men''s Grooming Expert', 'makeup',
  'Мужской груминг. Стрижка, борода, укладка для жениха и свидетелей. Мужской спа.',
  150, 500, 'Tashkent', 4.5, false,
  ARRAY['mens', 'grooming', 'barber', 'groom'],
  '{"services": ["haircut", "beard", "styling"], "male_specialist": true, "spa_treatments": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Korean Beauty Style', 'makeup',
  'Корейский стиль красоты. Фарфоровая кожа, градиентные губы, свежий образ. K-beauty тренды.',
  320, 950, 'Tashkent', 4.8, true,
  ARRAY['korean', 'kbeauty', 'fresh', 'dewy', 'youthful'],
  '{"style": "korean", "services": ["makeup", "hair"], "korean_products": true, "dewy_skin": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Vintage Glam Hair & Makeup', 'makeup',
  'Винтажный стиль. 20-е, 50-е, 60-е годы. Ретро волны, красные губы, стрелки.',
  300, 900, 'Tashkent', 4.6, false,
  ARRAY['vintage', 'retro', '50s', 'pinup'],
  '{"style": "vintage", "services": ["makeup", "hair"], "retro_specialist": true, "era_authentic": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Mother of Bride Specialist', 'makeup',
  'Макияж для мам и бабушек. Возрастной макияж, элегантность, классика. Деликатность.',
  200, 600, 'Tashkent', 4.7, true,
  ARRAY['mature', 'elegant', 'classic', 'age-appropriate'],
  '{"style": "age-appropriate", "services": ["makeup", "hair"], "senior_specialist": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Bridal Party Team', 'makeup',
  'Команда визажистов. Одновременно красим невесту + 5 подружек. Быстро и качественно.',
  250, 700, 'Tashkent', 4.6, false,
  ARRAY['team', 'group', 'bridesmaids', 'fast'],
  '{"team_size": 3, "services": ["makeup", "hair"], "group_discount": true, "simultaneous": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Makeup School Studio', 'makeup',
  'Студия при школе визажа. Работают выпускники под руководством мастера. Доступные цены.',
  180, 550, 'Tashkent', 4.3, false,
  ARRAY['affordable', 'learning', 'budget'],
  '{"style": "versatile", "services": ["makeup", "hair"], "student_rates": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Express Beauty Bar', 'makeup',
  'Быстрая красота. Макияж за 30 минут, причёска за 45. Для тех кто спешит.',
  200, 650, 'Tashkent', 4.4, false,
  ARRAY['express', 'fast', 'quick', 'efficient'],
  '{"services": ["makeup", "hair"], "express_service": true, "time_guarantee": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Vegan & Organic Beauty', 'makeup',
  'Только органическая и vegan косметика. Без химии, натуральные продукты. Эко-сознательность.',
  300, 900, 'Tashkent', 4.7, true,
  ARRAY['vegan', 'organic', 'eco', 'natural'],
  '{"products": "vegan-organic", "services": ["makeup", "hair"], "allergy_safe": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Mobile Beauty Team', 'makeup',
  'Выездной сервис. Приедем к вам домой с оборудованием. Комфорт в родных стенах.',
  280, 850, 'Tashkent', 4.6, false,
  ARRAY['mobile', 'home-service', 'convenient'],
  '{"services": ["makeup", "hair"], "mobile_service": true, "equipment_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Hijab & Modest Beauty', 'makeup',
  'Макияж для мусульманских невест. Скромность и красота. Уважение к традициям.',
  250, 750, 'Tashkent', 4.8, true,
  ARRAY['modest', 'muslim', 'hijab', 'respectful'],
  '{"style": "modest", "services": ["makeup", "hijab-styling"], "muslim_traditions": true}'::jsonb
);


-- =====================
-- CATERERS (Кейтеринг) - 15 items
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Royal Catering Service', 'caterer',
  'Премиум кейтеринг. Авторское меню от шеф-повара. Европейская, азиатская, узбекская кухня. Безупречный сервис.',
  50, 150, 'Tashkent', 5.0, true,
  ARRAY['premium', 'chef', 'international', 'luxury'],
  '{"cuisines": ["european", "asian", "uzbek"], "chef_service": true, "waiters_included": true, "min_guests": 50}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Plov Master Catering', 'caterer',
  'Традиционный узбекский плов. Готовим на месте в казане. Шашлык, самса, лагман. Аутентично!',
  25, 60, 'Tashkent', 4.9, true,
  ARRAY['traditional', 'uzbek', 'plov', 'authentic'],
  '{"specialty": "plov", "live_cooking": true, "traditional_dishes": true, "halal": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'European Gourmet', 'caterer',
  'Европейская кухня. Фуршетные столы, банкетное меню, кэнди-бар. Презентация блюд - искусство.',
  40, 100, 'Tashkent', 4.8, true,
  ARRAY['european', 'gourmet', 'presentation', 'buffet'],
  '{"cuisines": ["french", "italian"], "buffet_service": true, "candy_bar": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'BBQ & Grill Masters', 'caterer',
  'Барбекю и гриль. Стейки, рёбра, овощи на углях. Живое приготовление, аромат костра.',
  30, 75, 'Tashkent', 4.7, false,
  ARRAY['bbq', 'grill', 'outdoor', 'live-cooking'],
  '{"specialty": "bbq", "live_grilling": true, "outdoor_setup": true, "meat_specialist": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Vegan Feast Catering', 'caterer',
  'Веганское и вегетарианское меню. Креативные блюда без мяса. Здоровое питание, вкусно и красиво.',
  35, 80, 'Tashkent', 4.6, true,
  ARRAY['vegan', 'vegetarian', 'healthy', 'creative'],
  '{"dietary": ["vegan", "vegetarian"], "organic": true, "allergy_friendly": true}'::jsonb
);

-- =====================
-- FLORISTS (Флористы) - 10 items
-- =====================

INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(gen_random_uuid(), gen_random_uuid(), 'Rose Garden Florist', 'florist',
  'Букет невесты, бутоньерки, композиции. Только свежие цветы из Голландии и Эквадора.',
  200, 800, 'Tashkent', 4.9, true,
  ARRAY['roses', 'bridal', 'imported', 'fresh'],
  '{"specialty": "bridal-bouquet", "flower_sources": ["holland", "ecuador"], "delivery_included": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Wildflower Studio', 'florist',
  'Полевые цветы, рустик стиль. Натуральная красота, эко-флористика, сезонные цветы.',
  150, 500, 'Tashkent', 4.7, false,
  ARRAY['wildflowers', 'rustic', 'eco', 'seasonal'],
  '{"style": "rustic", "seasonal_flowers": true, "eco_friendly": true}'::jsonb
),
(gen_random_uuid(), gen_random_uuid(), 'Orchid Paradise', 'florist',
  'Орхидеи, экзотика, редкие цветы. Роскошные композиции для премиум свадеб.',
  300, 1200, 'Tashkent', 4.8, true,
  ARRAY['orchids', 'exotic', 'luxury', 'rare'],
  '{"specialty": "orchids", "exotic_flowers": true, "luxury_arrangements": true}'::jsonb
);

