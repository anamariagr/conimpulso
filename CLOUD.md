# Cloud Configuration for NexusLab

## AWS (Recommended for Production)

### Services Needed:
- **EC2** - Application servers
- **RDS** - MySQL 8.0 database
- **ElastiCache** - Redis for caching
- **S3** - File storage (images, documents)
- **CloudFront** - CDN for static assets
- **Load Balancer** - ALB for traffic distribution

### terraform/main.tf
```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "nexuslab" {
  cidr_block = "10.0.0.0/16"
}

resource "aws_ec2_instance" "app" {
  ami           = "ami-0abcdef1234567890"
  instance_type = "t3.medium"
  vpc_security_group_ids = [aws_security_group.app.id]
}

resource "aws_rds_instance" "db" {
  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.medium"
  allocated_storage = 100
  db_name        = "nexuslab"
  username       = "admin"
  password       = var.db_password
}

resource "aws_elasticache_cluster" "redis" {
  engine         = "redis"
  node_type      = "cache.t3.medium"
  num_cache_nodes = 1
}
```

---

## DigitalOcean (Alternative - Simpler Setup)

### Droplets Needed:
- **App Server** - 4GB RAM, 2 vCPUs
- **Database** - 4GB RAM, 2 vCPUs (managed MySQL)
- **Cache** - 2GB RAM (managed Redis)

### terraform/do.tf
```hcl
resource "digitalocean_droplet" "app" {
  name   = "nexuslab-app"
  size   = "s-4vcpu-8gb"
  region = "nyc1"
  image  = "ubuntu-22-04-x64"
}

resource "digitalocean_database_cluster" "mysql" {
  engine       = "mysql"
  version      = "8"
  size         = "db-s-dev-database"
  region       = "nyc1"
  node_count   = 1
}
```

---

## Environment Variables for Production

```bash
# Application
APP_ENV=production
APP_DEBUG=false
APP_URL=https://nexuslab.com

# Database
DB_CONNECTION=mysql
DB_HOST=your-rds-endpoint.amazonaws.com
DB_PORT=3306
DB_DATABASE=nexuslab
DB_USERNAME=admin
DB_PASSWORD=your-secure-password

# Redis
REDIS_HOST=your-redis-endpoint.amazonaws.com
REDIS_PASSWORD=your-redis-password
REDIS_PORT=6379

# S3 Storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=nexuslab-storage
AWS_USE_PATH_STYLE_ENDPOINT=false

# CDN
CDN_URL=https://cdn.nexuslab.com
```

---

## Deployment with Deployer

```bash
# install deployer
composer require deployer/deployer

# Deploy command
php artisan deploy production
```

---

## Health Checks

```bash
# Application health
curl https://nexuslab.com/health

# Expected response
{"status":"ok","timestamp":"2026-05-26T10:00:00Z"}

# Database check
curl https://nexuslab.com/health/database

# Redis check
curl https://nexuslab.com/health/redis
```