# Weddinguz Deployment Guide

Руководство по развертыванию проекта Weddinguz на DigitalOcean или любом другом сервере.

## Содержание

1. [Требования](#требования)
2. [Подготовка сервера](#подготовка-сервера)
3. [Настройка проекта](#настройка-проекта)
4. [Деплой](#деплой)
5. [SSL/HTTPS](#sslhttps)
6. [Обслуживание](#обслуживание)

## Требования

### Сервер
- Ubuntu 22.04 LTS или новее
- Минимум 4GB RAM
- Минимум 40GB SSD
- Доменное имя (для SSL)

### Локально
- Git
- SSH доступ к серверу

## Подготовка сервера

### 1. Создание Droplet на DigitalOcean

```bash
# Используя DigitalOcean API (опционально)
export DO_API_TOKEN="your-digitalocean-api-token"

# Создать droplet через CLI или веб-интерфейс
# Выбрать: Ubuntu 22.04 LTS, минимум 4GB RAM
```

### 2. Первичная настройка сервера

```bash
# Подключиться к серверу
ssh root@your-server-ip

# Скачать и запустить скрипт установки
curl -fsSL https://raw.githubusercontent.com/olegin77/love-s-blueprint/main/scripts/setup-server.sh -o setup.sh
chmod +x setup.sh
sudo ./setup.sh
```

Скрипт установит:
- Docker и Docker Compose
- Firewall (UFW)
- Пользователя приложения
- Автоматические бэкапы
- Мониторинг

## Настройка проекта

### 1. Клонирование репозитория

```bash
# Переключиться на пользователя приложения
su - weddinguz

# Клонировать репозиторий
cd /opt/weddinguz
git clone https://github.com/olegin77/love-s-blueprint.git .
```

### 2. Настройка окружения

```bash
# Создать файл .env.production
cp .env.example .env.production

# Отредактировать .env.production
nano .env.production
```

Обязательные переменные:

```env
# Production Supabase Configuration
VITE_SUPABASE_PROJECT_ID="love-s-blueprint-prod"
VITE_SUPABASE_PUBLISHABLE_KEY="your_anon_key"
VITE_SUPABASE_URL="https://yourdomain.com/api"

# Database
POSTGRES_DB=weddinguz_prod
POSTGRES_USER=weddinguz_admin
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE

# Auth
JWT_SECRET=GENERATED_BY_DEPLOY_SCRIPT
ANON_KEY=GENERATED_BY_DEPLOY_SCRIPT
SERVICE_ROLE_KEY=GENERATED_BY_DEPLOY_SCRIPT

# Site URLs
SITE_URL=https://yourdomain.com
API_EXTERNAL_URL=https://yourdomain.com/api
ADDITIONAL_REDIRECT_URLS=https://yourdomain.com,https://yourdomain.com/auth/callback

# Email (SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_ADMIN_EMAIL=admin@yourdomain.com

# Nginx
DOMAIN_NAME=yourdomain.com
```

## Деплой

### Автоматический деплой

```bash
# Запустить скрипт деплоя
cd /opt/weddinguz
./scripts/deploy.sh
```

Скрипт выполнит:
1. Подтягивание изменений из Git
2. Генерацию JWT и API ключей
3. Сборку Docker образов
4. Остановку старых контейнеров
5. Запуск новых контейнеров
6. Проверку здоровья сервисов

### Ручной деплой

```bash
# 1. Подтянуть изменения
git pull origin main

# 2. Собрать образы
docker-compose -f docker-compose.production.yml build

# 3. Запустить контейнеры
docker-compose -f docker-compose.production.yml up -d

# 4. Проверить статус
docker-compose -f docker-compose.production.yml ps
```

## SSL/HTTPS

### Установка SSL сертификата

```bash
# Запустить скрипт настройки SSL
cd /opt/weddinguz
./scripts/ssl-setup.sh yourdomain.com your@email.com
```

Сертификаты автоматически обновляются каждые 12 часов.

### Ручная настройка SSL

```bash
# Остановить nginx
docker-compose -f docker-compose.production.yml stop nginx

# Получить сертификат
docker-compose -f docker-compose.production.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email your@email.com \
  --agree-tos \
  -d yourdomain.com

# Обновить nginx.conf с вашим доменом
sed -i "s/\${DOMAIN_NAME}/yourdomain.com/g" nginx/nginx.conf

# Запустить nginx
docker-compose -f docker-compose.production.yml up -d nginx
```

## Обслуживание

### Просмотр логов

```bash
# Все сервисы
docker-compose -f docker-compose.production.yml logs -f

# Конкретный сервис
docker-compose -f docker-compose.production.yml logs -f frontend
docker-compose -f docker-compose.production.yml logs -f postgres
docker-compose -f docker-compose.production.yml logs -f kong
```

### Резервное копирование

Автоматические бэкапы настроены и выполняются каждый день в 2:00 AM.

Ручное создание бэкапа:

```bash
# База данных
docker exec weddinguz-prod-db pg_dump -U weddinguz_admin weddinguz_prod > backup_$(date +%Y%m%d).sql

# Загрузки и файлы
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /opt/weddinguz/uploads
```

Восстановление из бэкапа:

```bash
# Восстановить базу данных
docker exec -i weddinguz-prod-db psql -U weddinguz_admin weddinguz_prod < backup_20260217.sql

# Восстановить файлы
tar -xzf uploads_backup_20260217.tar.gz -C /
```

### Обновление приложения

```bash
# Переключиться на пользователя приложения
su - weddinguz
cd /opt/weddinguz

# Запустить деплой
./scripts/deploy.sh
```

### Мониторинг

```bash
# Использование ресурсов
docker stats

# Статус контейнеров
docker-compose -f docker-compose.production.yml ps

# Проверка здоровья
curl http://localhost/health
curl http://localhost/api/health
```

### Перезапуск сервисов

```bash
# Перезапустить все
docker-compose -f docker-compose.production.yml restart

# Перезапустить конкретный сервис
docker-compose -f docker-compose.production.yml restart frontend
docker-compose -f docker-compose.production.yml restart postgres
```

### Остановка и удаление

```bash
# Остановить все контейнеры
docker-compose -f docker-compose.production.yml down

# Остановить и удалить volumes (ВНИМАНИЕ: удалит данные!)
docker-compose -f docker-compose.production.yml down -v
```

## Troubleshooting

### База данных не запускается

```bash
# Проверить логи
docker-compose -f docker-compose.production.yml logs postgres

# Проверить права на volumes
ls -la /var/lib/docker/volumes/
```

### Frontend не доступен

```bash
# Проверить логи nginx
docker-compose -f docker-compose.production.yml logs nginx

# Проверить логи frontend
docker-compose -f docker-compose.production.yml logs frontend

# Проверить сетевое подключение
docker network inspect love-s-blueprint_weddinguz-network
```

### SSL проблемы

```bash
# Проверить сертификаты
docker-compose -f docker-compose.production.yml run --rm certbot certificates

# Обновить сертификаты вручную
docker-compose -f docker-compose.production.yml run --rm certbot renew
```

## Безопасность

### Рекомендации

1. Используйте сильные пароли
2. Регулярно обновляйте систему: `apt update && apt upgrade`
3. Настройте файрволл правильно
4. Используйте SSH ключи вместо паролей
5. Регулярно проверяйте логи на подозрительную активность
6. Делайте регулярные бэкапы

### Обновление секретов

```bash
# Сгенерировать новый JWT secret
openssl rand -base64 32

# Обновить .env.production
nano .env.production

# Перезапустить сервисы
docker-compose -f docker-compose.production.yml restart
```

## Масштабирование

Для увеличения производительности:

1. **Вертикальное масштабирование**: Увеличьте размер droplet
2. **Горизонтальное масштабирование**:
   - Используйте Load Balancer DigitalOcean
   - Запустите несколько экземпляров frontend
   - Используйте managed PostgreSQL

## Поддержка

Если возникли проблемы:
1. Проверьте логи
2. Изучите документацию Supabase
3. Создайте issue в репозитории

## Ссылки

- [Supabase Self-Hosting](https://supabase.com/docs/guides/self-hosting)
- [Docker Documentation](https://docs.docker.com/)
- [DigitalOcean Tutorials](https://www.digitalocean.com/community/tutorials)
