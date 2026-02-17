# DigitalOcean Deployment - Quick Start

## Шаг 1: Создание Droplet

### Через веб-интерфейс DigitalOcean

1. Войдите на https://cloud.digitalocean.com
2. Нажмите **Create** → **Droplets**
3. Выберите конфигурацию:

```
Image:          Ubuntu 22.04 LTS x64
Plan:           Basic
CPU Options:    Regular - $24/mo (4GB RAM, 2 vCPU, 80GB SSD)
Datacenter:     New York 1 (или ближайший к вам)
Authentication: SSH Key (добавьте свой публичный ключ)
Hostname:       weddingplus-prod
```

4. Нажмите **Create Droplet**
5. Дождитесь создания и получите IP адрес

## Шаг 2: Подключение и настройка

### Скопируйте IP адрес droplet и подключитесь:

```bash
# Замените YOUR_DROPLET_IP на реальный IP
export DROPLET_IP="YOUR_DROPLET_IP"

# Подключитесь по SSH
ssh root@$DROPLET_IP
```

### На сервере выполните:

```bash
# 1. Скачать и запустить setup скрипт
curl -fsSL https://raw.githubusercontent.com/olegin77/weddingplus/main/scripts/setup-server.sh -o setup.sh
chmod +x setup.sh
./setup.sh

# 2. Переключиться на пользователя weddinguz
su - weddinguz

# 3. Клонировать репозиторий
cd /opt
sudo mkdir -p weddinguz
sudo chown weddinguz:weddinguz weddinguz
cd weddinguz
git clone https://github.com/olegin77/weddingplus.git .

# 4. Создать .env.production
cp .env.example .env.production
nano .env.production
```

### Конфигурация .env.production

```env
# Production Supabase Configuration
VITE_SUPABASE_PROJECT_ID="weddingplus-prod"
VITE_SUPABASE_PUBLISHABLE_KEY="генерируется-автоматически"
VITE_SUPABASE_URL="https://yourdomain.com/api"

# Database
POSTGRES_DB=weddinguz_prod
POSTGRES_USER=weddinguz_admin
POSTGRES_PASSWORD=STRONG_PASSWORD_$(openssl rand -base64 32)

# Site URLs (замените yourdomain.com на ваш домен)
SITE_URL=https://yourdomain.com
API_EXTERNAL_URL=https://yourdomain.com/api
ADDITIONAL_REDIRECT_URLS=https://yourdomain.com,https://yourdomain.com/auth/callback

# Email (настройте SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_ADMIN_EMAIL=admin@yourdomain.com

# Nginx
DOMAIN_NAME=yourdomain.com
```

## Шаг 3: Деплой

```bash
# Запустить деплой скрипт
./scripts/deploy.sh
```

Скрипт автоматически:
- Сгенерирует JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY
- Соберет Docker образы
- Запустит все сервисы
- Проверит здоровье

## Шаг 4: SSL (если есть домен)

```bash
# Настроить SSL сертификат
./scripts/ssl-setup.sh yourdomain.com your@email.com
```

## Шаг 5: Проверка

```bash
# Проверить статус сервисов
docker-compose -f docker-compose.production.yml ps

# Проверить логи
docker-compose -f docker-compose.production.yml logs -f

# Проверить доступность
curl http://localhost/health
```

## Доступ к приложению

- **По IP**: http://YOUR_DROPLET_IP
- **С доменом**: https://yourdomain.com
- **Supabase Studio**: http://YOUR_DROPLET_IP:54323 (только для dev, закрыть в продакшн)

## Важные заметки

1. **Firewall**: Скрипт setup-server.sh автоматически настроит UFW (порты 80, 443, 22)
2. **Backups**: Автоматические бэкапы БД настроены (каждый день в 2:00 AM)
3. **Logs**: `/opt/weddinguz/logs/`
4. **Monitoring**: `docker stats` для просмотра ресурсов

## Troubleshooting

### Сервисы не запускаются

```bash
# Проверить логи
docker-compose -f docker-compose.production.yml logs

# Перезапустить
docker-compose -f docker-compose.production.yml restart
```

### База данных не подключается

```bash
# Проверить PostgreSQL
docker-compose -f docker-compose.production.yml logs postgres

# Проверить соединение
docker exec -it weddinguz-prod-db psql -U weddinguz_admin -d weddinguz_prod -c "SELECT version();"
```

### SSL проблемы

```bash
# Проверить сертификаты
docker-compose -f docker-compose.production.yml run --rm certbot certificates

# Обновить вручную
docker-compose -f docker-compose.production.yml run --rm certbot renew
```

## Обновление приложения

```bash
cd /opt/weddinguz
git pull origin main
./scripts/deploy.sh
```

## Поддержка

- Документация: [DEPLOYMENT.md](DEPLOYMENT.md)
- GitHub Issues: https://github.com/olegin77/weddingplus/issues
