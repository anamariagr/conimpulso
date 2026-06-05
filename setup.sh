#!/bin/bash

# NexusLab Development Environment Setup Script
# Run this script once to set up the entire development environment

set -e

echo "=========================================="
echo "  NexusLab Setup Script"
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check prerequisites
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Error: $1 is not installed.${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}Checking prerequisites...${NC}"
check_command docker
check_command docker-compose
check_command php
check_command composer
check_command node
check_command npm

echo -e "${GREEN}All prerequisites installed!${NC}"

# Create Laravel project if not exists
if [ ! -d "backend" ] || [ ! -f "backend/artisan" ]; then
    echo -e "${YELLOW}Creating Laravel project...${NC}"
    composer create-project laravel/laravel backend --prefer-dist
else
    echo -e "${GREEN}Laravel project already exists${NC}"
fi

# Create React project if not exists
if [ ! -d "frontend-client" ] || [ ! -f "frontend-client/package.json" ]; then
    echo -e "${YELLOW}Creating React frontend (Vite)...${NC}"
    cd frontend-client
    npm create vite@latest . -- --template react
    cd ..
else
    echo -e "${GREEN}React frontend already exists${NC}"
fi

# Create Vue project if not exists
if [ ! -d "frontend-admin" ] || [ ! -f "frontend-admin/package.json" ]; then
    echo -e "${YELLOW}Creating Vue frontend (Vite)...${NC}"
    cd frontend-admin
    npm create vite@latest . -- --template vue-ts
    cd ..
else
    echo -e "${GREEN}Vue frontend already exists${NC}"
fi

# Copy .env files
if [ -f "backend/.env.example" ] && [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp backend/.env.example backend/.env
    php backend/artisan key:generate
fi

# Install backend dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
cd backend && composer install && cd ..

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend-client dependencies...${NC}"
cd frontend-client && npm install && cd ..

echo -e "${YELLOW}Installing frontend-admin dependencies...${NC}"
cd frontend-admin && npm install && cd ..

# Build frontends
echo -e "${YELLOW}Building frontends...${NC}"
cd frontend-client && npm run build 2>/dev/null || true && cd ..
cd frontend-admin && npm run build 2>/dev/null || true && cd ..

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d app nginx mysql redis

# Wait for MySQL to be ready
echo -e "${YELLOW}Waiting for MySQL...${NC}"
sleep 10

# Run Laravel migrations
echo -e "${YELLOW}Running migrations...${NC}"
docker-compose exec app php artisan migrate --force 2>/dev/null || echo "Migrations will run when containers are fully up"

echo ""
echo -e "${GREEN}=========================================="
echo "  Setup Complete!"
echo "=========================================="
echo ""
echo -e "Services:"
echo -e "  - App:        http://localhost"
echo -e "  - API:        http://localhost/api"
echo -e "  - Admin:      http://localhost/admin"
echo -e "  - MailHog:    http://localhost:8025"
echo -e "  - phpMyAdmin: http://localhost:8081"
echo ""
echo -e "To start all services: ${YELLOW}docker-compose up -d${NC}"
echo -e "To view logs: ${YELLOW}docker-compose logs -f${NC}"
echo ""