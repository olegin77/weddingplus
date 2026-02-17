# Weddinguz - Локальная разработка

Руководство по настройке локального окружения для разработки.

## Быстрый старт

### 1. Установка зависимостей

```bash
# Node.js зависимости
npm install

# Supabase CLI (уже установлен в ~/.local/bin/)
~/.local/bin/supabase --version
```

### 2. Запуск локального Supabase

```bash
# Запустить все сервисы Supabase
~/.local/bin/supabase start

# Остановить сервисы
~/.local/bin/supabase stop

# Перезапустить с применением миграций
~/.local/bin/supabase db reset
```

После запуска Supabase будет доступен:
- **Studio**: http://127.0.0.1:54323
- **API**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

### 3. Настройка окружения

Файл `.env` уже настроен для локальной разработки:

```env
# Local Supabase
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
VITE_SUPABASE_PROJECT_ID=love-s-blueprint
```

### 4. Запуск приложения

```bash
# Запустить dev сервер
npm run dev

# Приложение будет доступно по адресу:
# http://localhost:8080
```

## Структура проекта

```
love-s-blueprint/
├── src/                    # Исходный код React приложения
│   ├── pages/             # Страницы
│   ├── components/        # Компоненты
│   ├── integrations/      # Интеграции (Supabase)
│   └── i18n/              # Переводы
├── supabase/
│   ├── functions/         # Edge Functions (Deno)
│   ├── migrations/        # Миграции базы данных
│   ├── config.toml        # Конфигурация Supabase
│   └── seed.sql           # Seed данные
├── database/
│   └── schema.sql         # Полная схема БД
├── nginx/                 # Конфигурация Nginx для продакшн
├── scripts/               # Скрипты деплоя
└── docker-compose.production.yml
```

## Работа с базой данных

### Миграции

```bash
# Создать новую миграцию
~/.local/bin/supabase migration new my_migration_name

# Применить миграции
~/.local/bin/supabase db reset

# Просмотр статуса миграций
~/.local/bin/supabase migration list
```

### Доступ к БД

```bash
# Через psql
~/.local/bin/supabase db psql

# Через Supabase Studio
# Откройте http://127.0.0.1:54323
```

### Seed данные

Seed данные автоматически загружаются при `supabase start` из файла `supabase/seed.sql`.

Включают:
- 2 тестовых пользователя (admin, couple)
- 30 поставщиков (6 категорий)

## Edge Functions

### Запуск локально

Edge functions автоматически доступны через локальный Supabase:

```bash
# Вызов функции
curl --request POST \
  'http://127.0.0.1:54321/functions/v1/function-name' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

### Список функций

- `ai-seating-optimizer` - Оптимизация рассадки гостей
- `payment-webhook` - Обработка платежных уведомлений
- `process-payment` - Обработка платежей
- `send-email-notification` - Отправка email
- `voice-rsvp` - Голосовое RSVP
- `wedding-assistant` - AI ассистент
- и другие (всего 17 функций)

## Тестирование

```bash
# Запустить тесты
npm test

# Запустить тесты в watch режиме
npm run test:watch

# Запустить coverage
npm run test:coverage
```

## Линтинг и форматирование

```bash
# Запустить линтер
npm run lint

# Исправить автоматически
npm run lint:fix
```

## Сборка

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Development build
npm run build:dev
```

## Частые команды

```bash
# Полный перезапуск локального окружения
~/.local/bin/supabase stop
~/.local/bin/supabase start

# Сброс БД с применением миграций
~/.local/bin/supabase db reset

# Просмотр логов
~/.local/bin/supabase logs

# Информация о локальном окружении
~/.local/bin/supabase status
```

## Пользователи для тестирования

После запуска `supabase start` доступны:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@weddinguz.uz | admin123 | Admin |
| couple@weddinguz.uz | couple123 | Couple |

## Порты

| Сервис | Порт | URL |
|--------|------|-----|
| Frontend (Vite) | 8080 | http://localhost:8080 |
| Supabase API | 54321 | http://127.0.0.1:54321 |
| Supabase Studio | 54323 | http://127.0.0.1:54323 |
| PostgreSQL | 54322 | postgresql://postgres:postgres@127.0.0.1:54322 |
| Mailpit | 54324 | http://127.0.0.1:54324 |

## Переключение между локальной и продакшн конфигурацией

### Для локальной разработки

```env
# .env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
```

### Для продакшн

```env
# .env.production
VITE_SUPABASE_URL=https://yourdomain.com/api
VITE_SUPABASE_PUBLISHABLE_KEY=your_production_key
```

## Troubleshooting

### Supabase не запускается

```bash
# Остановить все контейнеры
~/.local/bin/supabase stop

# Удалить volumes
docker volume prune

# Запустить снова
~/.local/bin/supabase start
```

### Порты заняты

```bash
# Проверить какие порты заняты
sudo lsof -i :54321
sudo lsof -i :54322

# Остановить Supabase
~/.local/bin/supabase stop

# Или изменить порты в supabase/config.toml
```

### Миграции не применяются

```bash
# Полный сброс БД
~/.local/bin/supabase db reset

# Проверить порядок миграций
ls -la supabase/migrations/
```

## Ресурсы

- [Supabase CLI Documentation](https://supabase.com/docs/guides/cli)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

## Следующие шаги

1. Изучите код в `src/pages/` и `src/components/`
2. Попробуйте создать миграцию
3. Добавьте новую edge function
4. Запустите тесты

Готовы к деплою? См. [DEPLOYMENT.md](./DEPLOYMENT.md)
