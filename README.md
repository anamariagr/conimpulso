# NexusLab

Marketplace platform for B2B and B2C connections.

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2)
- **Frontend**: React + Vite
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Queue**: Laravel Horizon

## Quick Start

### Development

```bash
# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve

# Frontend
cd frontend-client
npm install
npm run dev
```

### Docker

```bash
docker-compose up -d
docker-compose exec app php artisan migrate
```

## Modules

- **Auth**: User authentication with Laravel Sanctum
- **Products**: Product catalog management
- **Shops**: Store/shop management
- **Services**: Service listings
- **B2B**: Business-to-business connections
- **Leads**: Lead management
- **Advertising**: Ad campaigns
- **AI**: AI-powered recommendations and moderation
- **Advisors**: Advisor management and commissions
- **Logistics**: Shipping and pickup management
- **Wallet**: Digital wallet and transactions
- **Messages**: Real-time messaging

## API Documentation

Run `php artisan route:list` to see all available endpoints.

## Testing

```bash
php artisan test
```

## Production

```bash
./deploy.sh
```

### CCB registration link alerts

The backend checks the CCB commercial fairs page every 15 minutes from 9:00 a.m. to 2:00 p.m. (Bogotá time). It collects every HTTP(S) URL from `Registro` links in `td > p > a` elements and emails only when that set of links changes. Alert emails include every newly detected form URL. The first successful check stores a baseline without sending an email.

For real inbox delivery, configure a provider in `backend/.env`. Resend needs `MAIL_MAILER=resend`, `RESEND_API_KEY`, and a verified `MAIL_FROM_ADDRESS`. Gmail SMTP needs `MAIL_MAILER=smtp`, `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`, `MAIL_SCHEME=smtp`, `MAIL_USERNAME=chillunik@gmail.com`, `MAIL_PASSWORD` set to a Google App Password, and `MAIL_FROM_ADDRESS=chillunik@gmail.com`. MailHog is only a local development inbox and does not deliver to Gmail. `CCB_REGISTRATION_ALERT_EMAIL` defaults to `chillunik@gmail.com`. `deploy.sh` rebuilds the PHP image and starts both `app` and `scheduler`; the scheduler must stay running. The image includes the DOM extension required by the page parser.
