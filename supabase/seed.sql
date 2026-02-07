-- Clean up existing data (optional, be careful in prod)
-- TRUNCATE vendor_profiles CASCADE;

-- 1. VENUES (5 items)
INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(
  gen_random_uuid(), gen_random_uuid(), 'Versailles Grand Hall', 'venue', 
  'Роскошный банкетный зал в стиле барокко для больших свадеб.', 
  10000000, 50000000, 'Tashkent', 4.9, true, 
  ARRAY['luxury', 'large', 'indoor', 'classic'], 
  '{
    "venueType": "banquet-hall",
    "capacity": {"min": 200, "max": 800},
    "plate_price_min": 40,
    "plate_price_max": 100,
    "allowed_alcohol": true,
    "hasParking": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Garden of Eden', 'venue', 
  'Уютный ресторан с садом для камерных свадеб.', 
  5000000, 15000000, 'Tashkent', 4.7, true, 
  ARRAY['outdoor', 'garden', 'cozy', 'romantic'], 
  '{
    "venueType": "outdoor",
    "capacity": {"min": 30, "max": 150},
    "plate_price_min": 25,
    "plate_price_max": 60,
    "allowed_alcohol": false,
    "hasParking": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Skyline Rooftop', 'venue', 
  'Современная площадка на крыше с видом на город.', 
  8000000, 25000000, 'Tashkent', 4.8, true, 
  ARRAY['modern', 'rooftop', 'view', 'party'], 
  '{
    "venueType": "rooftop",
    "capacity": {"min": 50, "max": 200},
    "plate_price_min": 35,
    "plate_price_max": 80,
    "allowed_alcohol": true,
    "hasParking": false
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'National Heritage Center', 'venue', 
  'Традиционный зал с национальным колоритом.', 
  4000000, 12000000, 'Samarkand', 4.6, false, 
  ARRAY['traditional', 'cultural', 'large'], 
  '{
    "venueType": "banquet-hall",
    "capacity": {"min": 150, "max": 600},
    "plate_price_min": 15,
    "plate_price_max": 40,
    "allowed_alcohol": false,
    "hasParking": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Lakeside Villa', 'venue', 
  'Загородная вилла у озера для выездных регистраций.', 
  15000000, 40000000, 'Charvak', 4.9, true, 
  ARRAY['nature', 'water', 'villa', 'luxury'], 
  '{
    "venueType": "outdoor",
    "capacity": {"min": 20, "max": 100},
    "plate_price_min": 50,
    "plate_price_max": 150,
    "allowed_alcohol": true,
    "hasAccommodation": true
  }'::jsonb
);

-- 2. PHOTOGRAPHERS (5 items)
INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(
  gen_random_uuid(), gen_random_uuid(), 'Alex Lens', 'photographer', 
  'Репортажная съемка, ловлю живые эмоции.', 
  500, 1200, 'Tashkent', 4.8, true, 
  ARRAY['reportage', 'emotional', 'candid'], 
  '{
    "style": "reportage",
    "hours_packages": [6, 10, 12],
    "drone_included": false,
    "sde_available": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Fine Art Weddings', 'photographer', 
  'Светлая, воздушная пленочная фотография.', 
  1500, 3000, 'Tashkent', 5.0, true, 
  ARRAY['fine-art', 'film', 'luxury', 'light'], 
  '{
    "style": "fine-art",
    "hours_packages": [8, 12],
    "drone_included": false,
    "providesAlbum": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Dark & Moody Tales', 'photographer', 
  'Кинематографичный стиль с глубокими тенями.', 
  800, 1500, 'Tashkent', 4.7, false, 
  ARRAY['dark-moody', 'cinematic', 'artistic'], 
  '{
    "style": "dark-moody",
    "hours_packages": [6, 10],
    "drone_included": true,
    "sde_available": false
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Classic Portraits', 'photographer', 
  'Традиционная постановочная фотография.', 
  400, 800, 'Tashkent', 4.5, true, 
  ARRAY['traditional', 'posed', 'studio'], 
  '{
    "style": "traditional",
    "hours_packages": [4, 8, 12],
    "drone_included": false,
    "providesAlbum": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Editorial Chic', 'photographer', 
  'Съемка как для обложки журнала Vogue.', 
  2000, 5000, 'Tashkent', 4.9, true, 
  ARRAY['editorial', 'fashion', 'high-end'], 
  '{
    "style": "editorial",
    "hours_packages": [10, 14],
    "drone_included": false,
    "hasSecondShooter": true
  }'::jsonb
);

-- 3. DECORATORS (5 items)
INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(
  gen_random_uuid(), gen_random_uuid(), 'Boho Dreams', 'decorator', 
  'Оформление в стиле бохо: пампасная трава, макраме.', 
  1000, 3000, 'Tashkent', 4.8, true, 
  ARRAY['boho', 'dry-flowers', 'modern'], 
  '{
    "style_tags": ["boho", "rustique"],
    "reuse_potential": true,
    "specialty": "flowers"
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Royal Flowers', 'decorator', 
  'Масштабные конструкции из живых цветов.', 
  5000, 20000, 'Tashkent', 5.0, true, 
  ARRAY['luxury', 'classic', 'grand'], 
  '{
    "style_tags": ["classic", "luxury"],
    "reuse_potential": false,
    "specialty": "full-decor",
    "provides3DVisualization": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Eco Weddings', 'decorator', 
  'Экологичный декор без пластика.', 
  800, 2000, 'Tashkent', 4.6, false, 
  ARRAY['eco', 'green', 'sustainable'], 
  '{
    "style_tags": ["eco", "minimalist"],
    "reuse_potential": true,
    "specialty": "structures"
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Neon & Lights', 'decorator', 
  'Световой декор и неоновые вывески.', 
  500, 1500, 'Tashkent', 4.7, true, 
  ARRAY['lighting', 'neon', 'party'], 
  '{
    "style_tags": ["modern", "industrial"],
    "reuse_potential": true,
    "specialty": "lighting"
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'National Decor', 'decorator', 
  'Оформление в национальном узбекском стиле.', 
  1500, 4000, 'Tashkent', 4.9, true, 
  ARRAY['national', 'traditional', 'textile'], 
  '{
    "style_tags": ["national", "traditional"],
    "reuse_potential": true,
    "specialty": "textile"
  }'::jsonb
);

-- 4. MUSICIANS (5 items)
INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(
  gen_random_uuid(), gen_random_uuid(), 'DJ Party Starter', 'music',
  'Топовый DJ для молодежных свадеб.', 
  300, 800, 'Tashkent', 4.8, true, 
  ARRAY['dj', 'party', 'pop'], 
  '{
    "type": "dj",
    "genres": ["pop", "house", "rnb"],
    "soundEquipmentIncluded": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Jazz Band "Soul"', 'music', 
  'Живой джаз для welcome-зоны и ужина.', 
  1000, 2500, 'Tashkent', 4.9, true, 
  ARRAY['live-band', 'jazz', 'classy'], 
  '{
    "type": "live-band",
    "genres": ["jazz", "blues", "lounge"],
    "soundEquipmentIncluded": false
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'National Orchestra', 'music', 
  'Карнай-сурнай и национальный ансамбль.', 
  500, 1500, 'Tashkent', 4.7, true, 
  ARRAY['traditional', 'national', 'live'], 
  '{
    "type": "orchestra",
    "genres": ["national", "folk"],
    "soundEquipmentIncluded": false
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Rock Covers', 'music', 
  'Драйвовая кавер-группа.', 
  1500, 3000, 'Tashkent', 4.8, false, 
  ARRAY['live-band', 'rock', 'energy'], 
  '{
    "type": "live-band",
    "genres": ["rock", "pop-rock"],
    "soundEquipmentIncluded": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Violin Duo', 'music', 
  'Романтичное сопровождение церемонии.', 
  200, 500, 'Tashkent', 4.9, true, 
  ARRAY['duo', 'classical', 'romantic'], 
  '{
    "type": "duo",
    "genres": ["classical", "pop-covers"],
    "soundEquipmentIncluded": false
  }'::jsonb
);

-- 5. MAKEUP & HAIR (5 items)
INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(
  gen_random_uuid(), gen_random_uuid(), 'Natural Beauty', 'makeup',
  'Подчеркиваю естественную красоту, без эффекта маски.', 
  100, 200, 'Tashkent', 4.9, true, 
  ARRAY['natural', 'nude', 'light'], 
  '{
    "style": ["natural", "fresh"],
    "services": ["makeup", "hair"],
    "trialIncluded": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Glamour Queen', 'makeup', 
  'Яркий вечерний макияж, стойкость 24 часа.', 
  150, 300, 'Tashkent', 4.8, true, 
  ARRAY['glamour', 'evening', 'bright'], 
  '{
    "style": ["glamour", "editorial"],
    "services": ["makeup"],
    "trialIncluded": false
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Wedding Stylist Pro', 'makeup', 
  'Полный образ: макияж + прическа + помощь с платьем.', 
  250, 500, 'Tashkent', 5.0, true, 
  ARRAY['full-look', 'hair', 'makeup'], 
  '{
    "style": ["classic", "romantic"],
    "services": ["makeup", "hair", "dressing"],
    "travelToClient": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Budget Beauty', 'makeup', 
  'Качественный макияж по доступной цене.', 
  50, 100, 'Tashkent', 4.5, false, 
  ARRAY['budget', 'simple'], 
  '{
    "style": ["classic"],
    "services": ["makeup"],
    "travelToClient": false
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Creative MUA', 'makeup', 
  'Необычные образы для смелых невест.', 
  200, 400, 'Tashkent', 4.7, true, 
  ARRAY['creative', 'art', 'unique'], 
  '{
    "style": ["editorial", "creative"],
    "services": ["makeup", "face-art"],
    "trialIncluded": true
  }'::jsonb
);

-- 6. HOSTS (5 items)
INSERT INTO vendor_profiles (
  id, user_id, business_name, category, description,
  price_range_min, price_range_max, location, rating,
  verified, styles, attributes
) VALUES
(
  gen_random_uuid(), gen_random_uuid(), 'Funny Guy', 'other',
  'Современный ведущий со стендап-юмором.', 
  500, 1000, 'Tashkent', 4.8, true, 
  ARRAY['comedy', 'modern', 'standup'], 
  '{
    "style": "comedy",
    "languages": ["russian"],
    "includesGames": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Elegant MC', 'other', 
  'Интеллигентное ведение, без пошлых конкурсов.', 
  800, 1500, 'Tashkent', 5.0, true, 
  ARRAY['elegant', 'classic', 'tactful'], 
  '{
    "style": "elegant",
    "languages": ["russian", "english"],
    "includesGames": false
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'National Tamada', 'other', 
  'Соблюдение всех традиций, опыт 20 лет.', 
  400, 1000, 'Tashkent', 4.6, true, 
  ARRAY['traditional', 'national', 'experienced'], 
  '{
    "style": "traditional",
    "languages": ["uzbek", "russian"],
    "includesGames": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Showman Max', 'other', 
  'Ведущий + шоу-программа + вокал.', 
  1200, 2500, 'Tashkent', 4.9, true, 
  ARRAY['show', 'singer', 'active'], 
  '{
    "style": "modern",
    "languages": ["russian", "uzbek"],
    "includesScenarios": true
  }'::jsonb
),
(
  gen_random_uuid(), gen_random_uuid(), 'Bilingual Host', 'other', 
  'Веду свадьбы на двух языках свободно.', 
  600, 1200, 'Tashkent', 4.8, true, 
  ARRAY['bilingual', 'modern'], 
  '{
    "style": "bilingual",
    "languages": ["russian", "english", "uzbek"],
    "includesGames": true
  }'::jsonb
);
