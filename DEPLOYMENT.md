# 🚀 WeddingTech UZ - Deployment Guide

**Текущая платформа:** Lovable  
**Статус:** Development

---

## 📦 Текущее состояние

Проект работает на платформе Lovable в dev режиме.

### ✅ Что уже готово:
- Frontend на React + Vite + TypeScript
- Design system с Tailwind CSS
- Landing page с 8 компонентами
- 4 AI-generated изображения
- Responsive дизайн

### ⏳ Что нужно для production:
- [ ] Подключить Lovable Cloud (backend)
- [ ] Настроить authentication
- [ ] Создать database schema
- [ ] Добавить edge functions
- [ ] Настроить CI/CD

---

## 🌐 Deployment на Lovable

### Текущий URL (Development):
```
https://lovable.dev/projects/6092f4a2-7d47-4c19-b20c-ae122ed6925f
```

### Шаги для публикации:

1. **В Lovable Editor:**
   - Нажать кнопку "Publish" (верхний правый угол)
   - Выбрать production URL
   - Подтвердить deployment

2. **Production URL будет:**
   ```
   https://yoursite.lovable.app
   ```

3. **Для custom domain:**
   - Зайти в Project > Settings > Domains
   - Добавить custom domain (например: weddingtech.uz)
   - Настроить DNS records
   - Примечание: Требуется платный план Lovable

---

## 🔗 GitHub Integration

Для подключения GitHub:

1. **В Lovable:**
   - Нажать кнопку GitHub (верхний правый угол)
   - Выбрать "Connect to GitHub"
   - Авторизовать Lovable GitHub App

2. **Создать репозиторий:**
   - Название: `wedding_lovable`
   - Visibility: Private (рекомендуется)

3. **Automatic Sync:**
   - Изменения в Lovable → автоматически push в GitHub
   - Push в GitHub → автоматически sync в Lovable

---

## 🛠️ Lovable Cloud Setup

Когда будете готовы к backend:

1. **Активировать Cloud:**
   ```
   В Lovable Editor:
   1. Открыть Cloud tab
   2. Нажать "Enable Lovable Cloud"
   3. Подождать provisioning (~2-3 минуты)
   ```

2. **Что включено:**
   - PostgreSQL database
   - Supabase Auth
   - File Storage
   - Edge Functions
   - Real-time subscriptions

3. **После активации:**
   - Получите connection strings
   - Создайте database schema
   - Настройте authentication providers

---

## 📊 Environment Variables

После активации Cloud, нужно будет добавить:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase (автоматически через Lovable Cloud)
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_KEY="..."

# AI Services (когда добавим)
OPENAI_API_KEY="sk-..."
REPLICATE_API_KEY="..."

# Payment Providers (когда добавим)
PAYME_MERCHANT_ID="..."
CLICK_MERCHANT_ID="..."
```

---

## 🔐 Security Checklist

Перед production:

- [ ] Включить Row Level Security (RLS) в Supabase
- [ ] Настроить CORS policies
- [ ] Добавить rate limiting
- [ ] Настроить backup стратегию
- [ ] Включить SSL/HTTPS (автоматически в Lovable)
- [ ] Добавить error monitoring (Sentry)
- [ ] Настроить logging

---

## 📈 Scaling Plan

### Phase 1: MVP (Текущая)
- Lovable hosting
- Lovable Cloud (Supabase)
- Базовый frontend

### Phase 2: Growth
- Custom domain
- Analytics integration
- Performance optimization
- SEO optimization

### Phase 3: Scale
- CDN для статики
- Optimize database queries
- Add caching layer (Redis)
- Multiple regions

---

## 🆘 Troubleshooting

### Проблема: Build fails
```bash
# Проверить:
1. package.json - все версии корректны?
2. TypeScript errors - есть ли ошибки типов?
3. Imports - все пути правильные?
```

### Проблема: Deployment stuck
```bash
# Решение:
1. Проверить Lovable status page
2. Очистить кеш браузера
3. Пересобрать проект
```

### Проблема: Images не загружаются
```bash
# Проверить:
1. Импорты - использовать ES6 imports из src/assets
2. Пути - относительные пути правильные?
3. Build - файлы включены в сборку?
```

---

## 📞 Support

**Lovable Documentation:**  
https://docs.lovable.dev/

**Lovable Discord:**  
https://discord.com/channels/1119885301872070706

**Project Issues:**  
GitHub Issues (после подключения GitHub)

---

**Last Updated:** 14 ноября 2025
