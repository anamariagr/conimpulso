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