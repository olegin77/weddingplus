# Weddinguz — Deployment Guide

**Status:** Production Ready | **Version:** 2.1.0

---

## Infrastructure

| Component | Platform | Status |
|-----------|----------|--------|
| Frontend | Lovable Cloud | ✅ Deployed |
| Backend | Lovable Cloud | ✅ Connected |
| Database | PostgreSQL | ✅ 28+ tables with RLS |
| Edge Functions | Deno (auto-deploy) | ✅ 15 functions |
| AI | Lovable AI Gateway | ✅ Active |
| PWA | Service Worker | ✅ Configured |

---

## URLs

| Environment | URL |
|-------------|-----|
| Preview | `https://id-preview--6092f4a2-7d47-4c19-b20c-ae122ed6925f.lovable.app` |
| Production | `https://wedding.lovable.app` |

---

## Deployment Process

### Frontend
1. Make changes in Lovable editor
2. Preview auto-updates in real-time
3. Click **Publish** → **Update** to deploy to production

### Backend (Edge Functions)
- Auto-deployed on save — no manual action needed

### Database
- Migrations applied via Lovable Cloud migration tool
- User approval required before execution

---

## Required Secrets

Configure in Lovable Project Settings → Cloud → Secrets:

| Secret | Service | Required |
|--------|---------|:--------:|
| `RESEND_API_KEY` | Email notifications | Optional |
| `TELEGRAM_BOT_TOKEN` | Telegram RSVP | Optional |
| `ELEVENLABS_API_KEY` | Voice RSVP | Optional |
| `PAYME_MERCHANT_ID` | Payme payments | Optional |
| `CLICK_SERVICE_ID` | Click payments | Optional |
| `CLICK_MERCHANT_ID` | Click payments | Optional |
| `UZUM_MERCHANT_ID` | Uzum payments | Optional |
| `APELSIN_MERCHANT_ID` | Apelsin payments | Optional |

> **Note:** `LOVABLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` are auto-configured.

---

## PWA Configuration

```json
{
  "name": "Weddinguz",
  "short_name": "Weddinguz",
  "theme_color": "#9CAF88",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait"
}
```

---

## Payment Webhooks

```
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=payme
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=click
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=uzum
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=apelsin
```

---

## Monitoring

- **Edge Function Logs:** Lovable Cloud → Functions → Logs
- **Database:** Lovable Cloud → Database → Tables
- **Auth:** Lovable Cloud → Users

---

## Self-Hosted Database

Полная схема базы данных доступна для развёртывания на собственном сервере:

| Файл | Описание |
|------|----------|
| [`database/schema.sql`](./database/schema.sql) | Полный SQL-дамп (36 таблиц, триггеры, RLS) |
| [`database/DATABASE_SETUP.md`](./database/DATABASE_SETUP.md) | Руководство по установке, ER-диаграмма, Docker |

```bash
# Быстрый старт
psql -U postgres -d weddinguz -f database/schema.sql
```

Подробнее: [DATABASE_SETUP.md](./database/DATABASE_SETUP.md)

---

## Custom Domain

To connect a custom domain:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Requires paid Lovable plan
