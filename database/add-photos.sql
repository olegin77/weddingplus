-- Добавление фотографий всем vendors

UPDATE vendor_profiles SET 
  portfolio_images = ARRAY[
    'https://picsum.photos/seed/' || substring(id::text, 1, 8) || '/800/600',
    'https://picsum.photos/seed/' || substring(id::text, 9, 8) || '/800/600',
    'https://picsum.photos/seed/' || substring(id::text, 17, 8) || '/800/600'
  ]
WHERE portfolio_images IS NULL OR array_length(portfolio_images, 1) IS NULL;

-- Для venues - используем Unsplash wedding venue фото
UPDATE vendor_profiles SET portfolio_images = ARRAY[
  'https://images.unsplash.com/photo-1519167758481-83f29da8c169?w=800&q=80',
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800&q=80'
] WHERE category = 'venue' AND (portfolio_images IS NULL OR array_length(portfolio_images, 1) < 2);

-- Для photographers - свадебные фото
UPDATE vendor_profiles SET portfolio_images = ARRAY[
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&q=80'
] WHERE category = 'photographer' LIMIT 10;

SELECT 'Photos added to' as info, COUNT(*) as vendors 
FROM vendor_profiles 
WHERE portfolio_images IS NOT NULL;
