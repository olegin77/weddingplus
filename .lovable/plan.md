

# Полный аудит платформы Weddinguz: Обновление документации и оптимизация

---

## Результаты аудита

### 1. Ребрендинг не завершён

"WeddingTech" / "WeddingTech UZ" всё ещё присутствует в **14 файлах**:

| Файл | Количество упоминаний |
|------|-----------------------|
| `README.md` | ~12 |
| `PROGRESS.md` | ~10 |
| `PROJECT_CONCEPT.md` | ~5 |
| `PROJECT_OVERVIEW.md` | ~20 |
| `DEPLOYMENT.md` | ~8 |
| `CHANGELOG.md` | ~15 |
| `PWA_GUIDE.md` | ~10 |
| `EMAIL_SETUP.md` | ~6 |
| `PAYMENT_SETUP.md` | нужно проверить |
| `src/i18n/locales/uz.json` | 1 |
| `src/components/landing/CTA.tsx` | 1 |
| `supabase/functions/wedding-assistant/index.ts` | 1 |
| `supabase/functions/scan-qr-payment/index.ts` | 5 |
| `supabase/seed.sql` | нужно проверить |

### 2. Бесконечные анимации (repeat: Infinity) -- частично оставлены

Допустимые (фоновые, медленные 10s+):
- `Hero.tsx` -- 45s/50s blobs, только на десктопе -- **OK**
- `Features.tsx`, `HowItWorks.tsx`, `ParticleBackground.tsx` -- 10-30s фоновые блобы -- **OK**
- `CTA.tsx` -- фоновые 10-30s -- **OK**

Требующие внимания (быстрые/заметные):
| Файл | Проблема |
|------|----------|
| `src/components/landing/CTA.tsx` | `rotate: 360` за 4s + `scale [1,1.5,1]` за 2s + arrow `x: [0,4,0]` за 1.5s -- быстрая заметная пульсация |
| `src/components/landing/Stats.tsx` | `scale [1,1.5,1]` за 1.5s на иконках -- быстрая пульсация |
| `src/components/landing/FloatingBadge.tsx` | `y: [-5,5,-5]` за 4s -- заметное качание |
| `src/hooks/useScrollAnimation.ts` | `repeat: Infinity` за 4s/2s -- быстрые циклы |
| `src/index.css` | `.animate-spin-slow` -- 8s бесконечный вращение |
| `src/pages/Dashboard.tsx` | `animate-spin-slow` на лоадере -- **допустимо для лоадера** |

### 3. Документация устарела

| Документ | Статус | Проблемы |
|----------|--------|----------|
| `README.md` | Устарел | Название, версия, контакты, тесты "9 passing" (сейчас 18) |
| `PROGRESS.md` | Устарел | Название, дублированные секции, неактуальные "Known Issues" |
| `PROJECT_CONCEPT.md` | Устарел | Название, PWA manifest данные |
| `PROJECT_OVERVIEW.md` | Сильно устарел | Версия 0.9.0, 10+ страниц (сейчас 25+), 5 edge functions (сейчас 15+), 8 таблиц (сейчас 20+) |
| `DEPLOYMENT.md` | Сильно устарел | "Status: Development", backend "не подключен" |
| `CHANGELOG.md` | Устарел | Не содержит записи для 2.0, ребрендинг, мобильная оптимизация |
| `PWA_GUIDE.md` | Устарел | Название, theme color |
| `EMAIL_SETUP.md` | Устарел | Название, домен |
| `SETUP_SECRETS.md` | Частично устарел | Упоминание OpenAI (используется Lovable AI) |

### 4. Оставшиеся UI/UX проблемы

| Проблема | Файл |
|----------|------|
| CTA секция содержит быстро мигающую звёздочку Sparkles (4s rotate) | `CTA.tsx` |
| Stats иконки пульсируют с `scale [1,1.5,1]` за 1.5s | `Stats.tsx` |
| FloatingBadge заметно качается | `FloatingBadge.tsx` |

---

## План исправлений

### Часть 1: Завершение ребрендинга (2 файла кода + документация)

**Код:**
- `src/components/landing/CTA.tsx` -- заменить "WeddingTech UZ" на "Weddinguz"
- `src/i18n/locales/uz.json` -- заменить "WeddingTech UZ" на "Weddinguz"
- `supabase/functions/wedding-assistant/index.ts` -- заменить "WeddingTech UZ" на "Weddinguz"
- `supabase/functions/scan-qr-payment/index.ts` -- заменить все 5 упоминаний "WeddingTech UZ" на "Weddinguz"

### Часть 2: Убрать быстрые бесконечные анимации

| Файл | Действие |
|------|----------|
| `CTA.tsx` | Убрать `rotate: 360` за 4s, заменить `scale [1,1.5,1]` за 2s на hover-only, убрать `x [0,4,0]` arrow |
| `Stats.tsx` | Убрать `scale [1,1.5,1]` за 1.5s с иконок, оставить только initial animation |
| `FloatingBadge.tsx` | Заменить `repeat: Infinity` на единоразовую анимацию появления |
| `useScrollAnimation.ts` | Убрать `repeat: Infinity` из floatingVariants и pulseVariants |
| `AIShowcase.tsx` | Замедлить или сделать hover-only |

### Часть 3: Обновление всей документации

Полная перезапись 8 документов с актуальной информацией:

**README.md** -- обновить:
- Заголовок: "Weddinguz - AI-Powered Wedding Platform"
- Версия: 2.1.0
- Тесты: 18 passing
- Контакты: актуальный URL wedding.lovable.app
- Стек: актуальные зависимости и AI модели
- Структура проекта: 25+ страниц, 15+ edge functions, 20+ таблиц

**PROGRESS.md** -- обновить:
- Название: Weddinguz
- Добавить Phase 17: Mobile Optimization & Rebranding
- Убрать устаревшие "Known Issues" и "Ideas"
- Обновить статус "WEDDINGUZ 2.1 COMPLETE"

**PROJECT_CONCEPT.md** -- обновить:
- Заменить все WeddingTech на Weddinguz
- Обновить PWA manifest section
- Добавить секцию Mobile Optimization

**PROJECT_OVERVIEW.md** -- полная перезапись:
- Версия 2.1.0
- 25+ страниц
- 15+ Edge Functions
- 20+ таблиц БД
- Актуальный дизайн (Rose Gold + Champagne)
- Мобильная оптимизация (BottomNavigation, safe-area)

**DEPLOYMENT.md** -- обновить:
- Статус: Production Ready
- Backend: Lovable Cloud подключен и работает
- Published URL: wedding.lovable.app
- Убрать устаревшие TODO

**CHANGELOG.md** -- добавить:
- `[2.1.0]` -- Mobile optimization, rebranding, animation cleanup
- `[2.0.0]` -- Summary of all v2 features

**PWA_GUIDE.md** -- обновить:
- Заменить WeddingTech на Weddinguz
- Обновить theme_color на #9CAF88 (текущий)
- Актуальные скриншоты/инструкции

**EMAIL_SETUP.md** -- обновить:
- Заменить WeddingTech на Weddinguz
- Актуальные домены

**SETUP_SECRETS.md** -- обновить:
- Убрать OPENAI_API_KEY (используется Lovable AI)
- Добавить информацию о Lovable AI (не требует ключ)
- Обновить дату

---

## Файлы для изменения

| # | Файл | Тип | Описание |
|---|------|-----|----------|
| 1 | `src/components/landing/CTA.tsx` | Edit | Убрать быстрые infinite, заменить WeddingTech |
| 2 | `src/components/landing/Stats.tsx` | Edit | Убрать быстрые infinite на иконках |
| 3 | `src/components/landing/FloatingBadge.tsx` | Edit | Убрать infinite quality |
| 4 | `src/hooks/useScrollAnimation.ts` | Edit | Убрать repeat: Infinity |
| 5 | `src/components/landing/AIShowcase.tsx` | Edit | Замедлить/убрать infinite |
| 6 | `src/i18n/locales/uz.json` | Edit | WeddingTech -> Weddinguz |
| 7 | `supabase/functions/wedding-assistant/index.ts` | Edit | WeddingTech -> Weddinguz |
| 8 | `supabase/functions/scan-qr-payment/index.ts` | Edit | WeddingTech -> Weddinguz |
| 9 | `README.md` | Rewrite | Полное обновление |
| 10 | `PROGRESS.md` | Rewrite | Полное обновление |
| 11 | `PROJECT_CONCEPT.md` | Edit | Ребрендинг + обновления |
| 12 | `PROJECT_OVERVIEW.md` | Rewrite | Полное обновление |
| 13 | `DEPLOYMENT.md` | Rewrite | Полное обновление |
| 14 | `CHANGELOG.md` | Edit | Добавить 2.0 и 2.1 записи |
| 15 | `PWA_GUIDE.md` | Edit | Ребрендинг + обновления |
| 16 | `EMAIL_SETUP.md` | Edit | Ребрендинг |
| 17 | `SETUP_SECRETS.md` | Edit | Убрать OpenAI, обновить |

---

## Ожидаемый результат

1. **Бренд "Weddinguz"** -- единообразно во всех файлах (0 упоминаний WeddingTech)
2. **Нет быстрых мигающих анимаций** -- только медленные фоновые (10s+)
3. **Актуальная документация** -- все 8 .md файлов отражают текущее состояние v2.1
4. **Корректные данные** -- 18 тестов, 25+ страниц, 15+ edge functions, 20+ таблиц
5. **Актуальные инструкции** -- Lovable AI вместо OpenAI, правильные URL

