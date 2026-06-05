#!/bin/bash

# NexusLab Production Deployment Script

set -e

echo "=== NexusLab Deployment ==="

# Build frontend
echo "Building frontend..."
cd frontend-client
npm run build
cd ..

# Build Docker containers
echo "Building Docker containers..."
docker-compose build

# Run migrations
echo "Running migrations..."
docker-compose exec app php artisan migrate --force

# Seed initial data if needed
echo "Seeding database..."
docker-compose exec app php artisan db:seed --force

# Clear and cache
echo "Optimizing..."
docker-compose exec app php artisan config:cache
docker-compose exec app php artisan route:cache
docker-compose exec app php artisan view:cache

echo "=== Deployment Complete ==="
echo "Application running at http://localhost"