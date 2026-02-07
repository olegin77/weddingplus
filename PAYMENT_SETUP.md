# 💳 Настройка платежных систем — Weddinguz

## Обзор

Weddinguz интегрирован с основными узбекскими платежными системами:
- **Payme** — популярная платежная система
- **Click** — банковская платежная система
- **Uzum** — современный платежный сервис
- **Apelsin** — платежный процессинг

## Необходимые секреты

Добавьте в Lovable Project Settings → Cloud → Secrets:

| Секрет | Источник |
|--------|----------|
| `PAYME_MERCHANT_ID` | Личный кабинет Payme Business |
| `CLICK_SERVICE_ID` | Личный кабинет Click Merchant |
| `CLICK_MERCHANT_ID` | Личный кабинет Click Merchant |
| `UZUM_MERCHANT_ID` | Личный кабинет Uzum Gateway |
| `APELSIN_MERCHANT_ID` | Личный кабинет Apelsin API |

## Настройка вебхуков

```
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=payme
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=click
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=uzum
https://whrxhiyeysydhagrkjbe.supabase.co/functions/v1/payment-webhook?provider=apelsin
```

## Безопасность

- ✅ Все платежные данные обрабатываются провайдерами
- ✅ RLS policies защищают таблицу payments
- ✅ JWT authentication для инициации платежей
- ✅ Эскроу для безопасных транзакций
