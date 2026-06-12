FROM php:8.3-cli

RUN apt-get update && apt-get install -y \
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev libicu-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring xml bcmath gd zip intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

COPY . .

RUN composer dump-autoload --optimize \
    && php artisan storage:link || true \
    && php artisan config:cache || true \
    && php artisan route:cache || true \
    && php artisan view:cache || true

EXPOSE 8080

CMD php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
