# Weddinguz — Technical Overview

**Version:** 2.1.0 | **Last Updated:** 2026-02-07

---

## Architecture

```
┌─────────────────────────────────────────────┐
│                 Frontend                      │
│  React 18 + TypeScript + Vite + Tailwind     │
│  shadcn/ui + Framer Motion + i18next         │
├─────────────────────────────────────────────┤
│              Lovable Cloud                    │
│  PostgreSQL (28+ tables) + Auth + Storage    │
│  15 Edge Functions (Deno) + RLS Policies     │
├─────────────────────────────────────────────┤
│            External Services                  │
│  Lovable AI • Payme • Click • Uzum           │
│  Telegram Bot • ElevenLabs • Resend          │
└─────────────────────────────────────────────┘
```

---

## Pages (25+)

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Hero, Features, AI Showcase, Stats, Pricing, CTA |
| Auth | `/auth` | Login/Register with role selection |
| Dashboard | `/dashboard` | Overview with stats, quick actions |
| Marketplace | `/marketplace` | Vendor search with filters |
| Vendor Detail | `/vendor/:id` | Profile, portfolio, reviews, booking |
| Vendor Compare | `/vendor-compare` | Side-by-side comparison (up to 4) |
| Planner | `/planner` | Wedding plan management |
| AI Assistant | `/ai-assistant` | Chat, budget calc, vendor recs |
| AI Visualizer | `/ai-visualizer` | Wedding visualization with face swap |
| AI Invitations | `/ai-invitations` | Video invitation creator |
| AI Venue Designer | `/ai-venue-designer` | Venue decor visualization |
| Seating Chart | `/seating-chart` | Interactive drag & drop seating |
| Wedding Events | `/wedding-events` | Multi-event management |
| Communications | `/communications` | Telegram, Voice RSVP settings |
| Payments | `/payments` | Escrow dashboard, QR payments |
| Gifts | `/gifts` | Gift registry |
| Wedding Website | `/wedding-website` | Website builder |
| Recommendations | `/recommendations` | AI vendor recommendations |
| RSVP | `/rsvp/:token` | Public RSVP page |
| Vendor Dashboard | `/vendor-dashboard` | Vendor management panel |
| Profile | `/profile` | User profile |
| Settings | `/settings` | App settings |
| Onboarding | `/onboarding` | Setup wizard |
| Install | `/install` | PWA installation guide |
| Admin | `/admin` | Admin panel |

---

## Database Schema (28+ tables)

### Core
- `profiles` — User profiles (couple/vendor/admin)
- `user_roles` — Role assignments
- `wedding_plans` — Wedding plan data (budget, preferences, dates)
- `planning_milestones` — Planning progress tracker

### Vendors
- `vendor_profiles` — Business profiles with 40+ attributes
- `vendor_availability` — Calendar availability
- `vendor_recommendations` — AI-generated recommendations
- `favorite_vendors` — User favorites
- `venue_gallery` — Venue photos with metadata

### Bookings & Payments
- `bookings` — Service bookings
- `payments` — Payment records
- `escrow_transactions` — Escrow management
- `vendor_payouts` — Payout tracking
- `qr_payment_sessions` — QR payment sessions

### Guests
- `guests` — Guest list with relationships
- `guest_invitations` — Invitation tracking with tokens
- `guest_event_invitations` — Per-event RSVP

### Events & Seating
- `wedding_events` — Event management (nahorgi_osh, fotiha, nikoh, etc.)
- `seating_charts` — Seating layouts
- `seating_tables` — Table positions and shapes
- `table_assignments` — Guest-to-table mapping

### Communication
- `communication_settings` — Channel preferences
- `telegram_connections` — Bot configuration
- `telegram_rsvp_responses` — Bot responses
- `voice_rsvp_sessions` — Voice RSVP data

### Content
- `wedding_invitations` — Generated invitations
- `wedding_visualizations` — AI visualizations
- `venue_visualizations` — Venue decor renders
- `wedding_websites` — Website builder data

### Gamification & Gifts
- `achievements` / `user_achievements` — Achievement system
- `gift_registry_items` / `gift_contributions` — Gift registry
- `notification_preferences` — Notification settings
- `reviews` — Vendor reviews
- `budget_items` — Budget line items

---

## Edge Functions (15)

| Function | Purpose |
|----------|---------|
| `wedding-assistant` | AI chat (Lovable AI / Gemini 2.5 Flash) |
| `generate-wedding-visualization` | AI wedding image generation |
| `generate-wedding-invitation` | AI invitation creation |
| `generate-venue-decor` | AI venue decoration |
| `ai-seating-optimizer` | AI seating arrangement |
| `process-payment` | Payment processing |
| `payment-webhook` | Payment provider callbacks |
| `generate-qr-payment` | QR code generation |
| `scan-qr-payment` | QR scan payment page |
| `escrow-management` | Escrow operations |
| `send-email-notification` | Email dispatch |
| `export-wedding-plan-pdf` | PDF export |
| `get-exchange-rate` | USD/UZS rates |
| `telegram-webhook` | Telegram bot handler |
| `voice-rsvp` | Voice RSVP session management |

---

## Design System

### Colors (HSL)
- Primary: Rose Gold `15 60% 65%`
- Wedding Gold: `45 70% 60%`
- Wedding Burgundy: `340 50% 35%`
- Champagne: `30 60% 92%`

### Animations Policy
- ✅ Trigger-based (hover, tap, scroll-in-view)
- ✅ Background blobs (10s+ duration, low opacity)
- ❌ No fast infinite animations (pulse, blink, spin < 10s)

### Mobile
- Bottom navigation bar with glass effect
- iOS Safe Area (env(safe-area-inset-*))
- Static text fallbacks for complex animations
- Immediate isMobile detection (no flicker)

---

## Security

- Row Level Security (RLS) on all user tables
- JWT authentication via Lovable Cloud
- Escrow for vendor payments
- No raw SQL execution in edge functions
- CORS headers on all functions

---

## Localization

| Language | Code | Coverage |
|----------|------|----------|
| Russian | `ru` | 100% |
| Uzbek | `uz` | 100% |
| English | `en` | 100% |

---

## Performance

- Hardware-accelerated transforms
- Memoized heavy components
- CSS-only decorative animations
- Intersection Observer for scroll triggers
- PWA cache: 5MB limit
- `useReducedMotion` support
