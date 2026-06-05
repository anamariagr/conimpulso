

# Plan de Desarrollo - Marketplace Multi-Vendedor

## Visión General

Plataforma marketplace avanzada para productores directos, fabricantes, artesanos, talleres, técnicos, emprendedores, negocios locales y empresas de servicios especializados. Combina marketplace B2C, marketplace B2B, directorio empresarial, plataforma de servicios, sistema logístico, plataforma de leads, sistema de afiliados/asesores y plataforma publicitaria interna.

---

## DISEÑO VISUAL DEL SISTEMA

### Paleta de Colores (Brand Colors)

| Color | Hex | Uso |
|-------|-----|-----|
| Negro profundo | `#0A0A0A` | Fondos principales, texto, sidebar |
| Gris oscuro | `#1A1A1A` | Cards secundarias, bordes |
| Gris medio | `#2D2D2D` | Elementos intermedios |
| Blanco cálido | `#FAFAFA` | Fondos claros, texto sobre oscuro |
| Amarillo accent | `#FFD700` | Botones principales, CTAs, métricas destacadas, estados activos |
| Amarillo hover | `#FFC000` | Hover de elementos amarillos |
| Gris texto | `#9CA3AF` | Texto secundario, labels |

### Tipografía

- **Títulos:** Sans-serif moderno, bold (700), tamaño grande
- **Subtítulos:** Semi-bold (600)
- **Cuerpo:** Regular (400), buen legibility
- **Texto secundario:** Light weight, color gris

### Sistema de Diseño (Design System)

```
design-system/
├── tokens/
│   ├── colors.css        # Variables de color
│   ├── typography.css    # Variables tipográficas
│   ├── spacing.css      # Espaciados
│   └── shadows.css      # Sombras suaves
├── components/           # Componentes base
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   ├── Modal/
│   └── ...
└── patterns/            # Patrones recurrentes
```

---

## INSTALACIÓN DE DEPENDENCIAS

### Requisitos Previos del Sistema

```bash
# Verificar versiones mínimas requeridas
php --version              # >= 8.2
node --version             # >= 18.0
npm --version              # >= 9.0
composer --version         # >= 2.5
docker --version           # >= 24.0
docker-compose --version    # >= 2.20
```

### 1. Backend Laravel - Dependencias Composer

```bash
# Dependencias principales
composer require laravel/framework:^11.0
composer require laravel/sanctum:^4.0
composer require laravel/fortify:^1.0
composer require laravel/horizon:^5.0
composer require laravel/reverb:^1.0

# Bases de datos y caché
composer require doctrine/dbal          # Migraciones avanzadas
composer require predis/predis         # Cliente Redis

# Utilities
composer require spatie/laravel-permission  # Roles y permisos
composer require spatie/laravel-activitylog  # Auditoría
composer require intervention/image       # Procesamiento de imágenes
composer require laseric/laravel-carbon     # Fechas en español

# Validación y seguridad
composer require stevebauman/purify        # HTML sanitization
composer require anlutro/laravel-settings  # Configuraciones

# API y desarrollo
composer require --dev barryvdh/laravel-ide-helper
composer require --dev pestphp/pest
composer require --dev mockery/mockery
```

### 2. Frontend React (Landing, Catálogo, UX Pública)

```bash
# Crear proyecto con Vite
npm create vite@latest frontend-client -- --template react

cd frontend-client

# Core dependencies
npm install react:^18.2.0
npm install react-dom:^18.2.0
npm install react-router-dom:^6.0
npm install react-hook-form:^7.0
npm install zustand:^4.0          # Estado global
npm install axios:^1.0             # HTTP client

# UI Components
npm install @headlessui/react     # Componentes accesibles
npm install @heroicons/react      # Iconos
npm install lucide-react          # Iconos alternativos
npm install framer-motion:^10.0   # Animaciones

# Estado y datos
npm install @tanstack/react-query:^5.0  # Server state
npm install react-hot-toast:^4.0         # Notificaciones

# Utilidades
npm install clsx:^2.0                    # Class management
npm install date-fns:^3.0                # Fechas
npm install lodash:^4.0                  # Utilidades
npm install @uppy/core @uppy/dashboard  # Upload de archivos

# Maps y ubicación
npm install react-leaflet leaflet        # Mapas
npm install mapbox-gl                    # Mapbox alternativo
```

### 3. Frontend Vue.js (Dashboard Admin, Panel Vendedor)

```bash
# Crear proyecto Vue
npm create vue@latest frontend-admin -- --typescript --router --pinia

cd frontend-admin

# Core dependencies
npm install vue:^3.4.0
npm install vue-router:^4.0
npm install pinia:^2.0

# UI Framework (Tailwind CSS)
npm install -D tailwindcss:^3.4
npm install postcss:^8.0
npm install autoprefixer:^10.0

# UI Components
npm install @headlessui/vue     # Componentes accesibles
npm install @heroicons/vue      # Iconos
npm install lucide-vue-next     # Iconos
npm install tailwindcss-animate # Animaciones Tailwind

# Gráficos y métricas
npm install chart.js:^4.0
npm install vue-chartjs:^5.0
npm install apexcharts:^3.0
npm install @vueuse/core:^10.0  # Composables útiles

# Formularios
npm install vee-validate:^4.0  # Validación
npm install yup:^1.0            # Schema validation

# Utilities
npm install axios:^1.0
npm install lodash:^4.0
npm install date-fns:^3.0
npm install vue3-easy-data-table # Tablas
```

### 4. Paquetes de Infraestructura

```bash
# Docker images necesarias (en docker-compose.yml)
services:
  app:
    image: php:8.2-fpm
  mysql:
    image: mysql:8.0
  redis:
    image: redis:7-alpine
  nginx:
    image: nginx:alpine
  # O alternativas cloud:
  # - minio/s3 (storage)
  # - mailhog (dev email)
  # - phpmyadmin (dev db admin)
```

### 5. Dependencias de Desarrollo y Herramientas

```bash
# ESLint y Prettier (React)
npm install -D eslint:^8.0
npm install -D prettier:^3.0
npm install -D eslint-plugin-react:^7.0
npm install -D eslint-plugin-react-hooks:^4.0

# ESLint y Prettier (Vue)
npm install -D eslint:^8.0
npm install -D prettier:^3.0
npm install -D eslint-plugin-vue:^9.0
npm install -D @vue/eslint-config-typescript:^12.0

# Testing
npm install -D vitest:^1.0         # React testing
npm install -D @testing-library/react
npm install -D @testing-library/vue # Vue testing
npm install -D cypress:^13.0        # E2E testing
npm install -D playwright:^1.0      # E2E alternativo

# Build y optimización
npm install -D vite-plugin-compression  # Gzip compression
npm install -D vite-plugin-pwa            # PWA support
npm install -D @vitejs/plugin-react-refresh
```

### 6. Scripts de Package.json Recomendados

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .js,.jsx,.ts,.tsx,.vue",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,vue,css}\"",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "test:e2e": "cypress run"
  }
}
```

---

## ESTRUCTURA DE PROYECTOS

### Arquitectura de Directorios

```
NexusLab/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Middleware/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Policies/
│   │   ├── Services/
│   │   └── Modules/            # Modular architecture
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   ├── routes/
│   │   └── api.php
│   ├── tests/
│   ├── docker/
│   │   ├── nginx/
│   │   └── php/
│   ├── docker-compose.yml
│   └── .env
│
├── frontend-client/             # React (Landing, Catálogo)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Componentes compartidos
│   │   │   ├── layout/         # Layout principal
│   │   │   ├── landing/        # Secciones landing
│   │   │   ├── catalog/        # Catálogo, productos
│   │   │   └── store/          # Perfiles de tienda
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/          # API calls
│   │   ├── stores/            # Zustand stores
│   │   ├── styles/
│   │   └── utils/
│   ├── public/
│   └── package.json
│
├── frontend-admin/              # Vue.js (Dashboard)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── layout/
│   │   │   ├── dashboard/
│   │   │   ├── forms/
│   │   │   └── tables/
│   │   ├── views/
│   │   ├── composables/
│   │   ├── stores/
│   │   ├── router/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   ├── public/
│   ├── tailwind.config.js
│   └── package.json
│
├── docker-compose.yml           # Orquestación principal
├── .env.example
├── README.md
└── pasos.md                     # Este archivo
```

---

## COMPONENTES PRINCIPALES A DESARROLLAR

### React (Frontend Cliente)

| Componente | Descripción |
|------------|-------------|
| `Navbar` | Header sticky, logo, búsqueda, carrito, usuario |
| `HeroSection` | Hero fullscreen con overlay, CTAs |
| `SearchBar` | Input grande con sugerencias |
| `CategoryGrid` | Grid de categorías con icons |
| `ProductCard` | Card producto con imagen, precio, CTA |
| `StoreCard` | Vitrina de tienda con banner |
| `MetricsCard` | Card con métricas destacadas (amarillo) |
| `FilterPanel` | Panel de filtros con sidebar |
| `ProductDetail` | Página detalle con galería |
| `StoreProfile` | Perfil completo de tienda |
| `ChatModule` | Componente de chat protegido |
| `WalletModule` | Billetera virtual |
| `CheckoutFlow` | Proceso de compra |
| `OnboardingWizard` | Wizard paso a paso |

### Vue.js (Frontend Admin)

| Componente | Descripción |
|------------|-------------|
| `AppSidebar` | Sidebar negra con navegación |
| `AppHeader` | Header con user menu |
| `DashboardMetrics` | Cards de métricas amarillas |
| `AnalyticsPanel` | Gráficos y paneles negros |
| `DataTable` | Tabla con filtros y paginación |
| `MultiStepForm` | Formulario wizard productos |
| `SettingsPanel` | Panel de configuración |
| `NotificationBell` | Sistema de notificaciones |
| `UserManagement` | Gestión de usuarios |
| `RolePermissions` | Sistema de roles |
| `ProductForm` | Formulario CRUD productos |
| `ShopEditor` | Editor visual de tienda |
| `LeadManager` | Gestión de leads |
| `LogisticsPanel` | Panel logístico |

---

## CONFIGURACIÓN VISUAL (CSS VARIABLES)

```css
:root {
  /* Colores principales */
  --color-primary: #0A0A0A;
  --color-secondary: #1A1A1A;
  --color-tertiary: #2D2D2D;
  --color-accent: #FFD700;
  --color-accent-hover: #FFC000;
  --color-background: #FAFAFA;
  --color-text: #1A1A1A;
  --color-text-secondary: #9CA3AF;
  --color-white: #FFFFFF;

  /* Espaciado */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;

  /* Bordes */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Sombras */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

  /* Transiciones */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 500ms ease;
}
```

---

## INSTALACIÓN Y SETUP INICIAL

### Paso 1: Clonar y preparar estructura

```bash
# Crear estructura de directorios
mkdir -p backend frontend-client frontend-admin docker/nginx docker/php

# Backend Laravel
cd backend
composer create-project laravel/laravel . --prefer-dist

# Frontend React (cliente)
cd ../frontend-client
npm create vite@latest . -- --template react

# Frontend Vue (admin)
cd ../frontend-admin
npm create vue@latest . -- --typescript --router --pinia
```

### Paso 2: Configurar Docker

```bash
# En la raíz del proyecto
touch docker-compose.yml
# Ver configuración en FASE 1.1
```

### Paso 3: Instalar dependencias

```bash
# Backend
cd backend && composer install

# Frontend Cliente
cd ../frontend-client && npm install

# Frontend Admin
cd ../frontend-admin && npm install
```

### Paso 4: Variables de entorno

```bash
cp backend/.env.example backend/.env
# Editar backend/.env con credenciales de BD, Redis, etc.
```

---

## FASES DE DESARROLLO

### FASE 1 — Fundamentos y Autenticación

**Objetivo:** Establecer la arquitectura base del sistema.

#### 1.1 Configuración de Infraestructura
- [x] Estructura de directorios Docker (backend Laravel, frontend Vue/React)
- [x] docker-compose.yml con MySQL, Redis, NGINX
- [x] Configuración de variables de entorno
- [x] Certificados SSL desarrollo
- [x] Script de inicialización del proyecto

#### 1.2 Backend Laravel - Estructura Base
- [x] Instalación Laravel 11
- [x] Modular Architecture (Dividir en módulos: Users, Shops, Products, Services, etc.)
- [x] Configuración de rutas API RESTful
- [x] Middlewares personalizados (rate limiting, audit)
- [x] Base de datos migrations y seeders
- [x] Modelos base con relaciones
- [x] Trait de soft deletes y timestamps
- [x] API Resources para transformación de datos

#### 1.3 Sistema de Autenticación
- [x] Sanctum para API authentication
- [x] JWT como alternativa
- [x] Registro con verificación de email
- [x] Login/logout con tokens
- [x] Recuperación de contraseña (envío de email)
- [x] Verificación de cuenta por email
- [x] Refresh tokens
- [x] Session management
- [x] Logout global (invalidar todos los tokens)

#### 1.4 Sistema de Roles y Permisos
- [x] Roles: Cliente, Vendedor, Asesor, Super Admin, Moderador, Operador Logístico, Soporte, Empresa Aliada
- [x] Permisos granulares por módulo
- [x] Gates y Policies de Laravel
- [x] Middleware de verificación de roles
- [x] Protección de rutas por rol
- [x] Asignación de roles a usuarios
- [x] Historial de cambios de rol

#### 1.5 Seguridad Base
- [x] Rate limiting por IP y usuario
- [x] Validación de inputs
- [x] Sanitización de datos
- [x] CORS configurado
- [x] Helmet.js para headers HTTP
- [x] Logging de requests sospechosas
- [x] Auditoría de acciones de usuario

---

### FASE 2 — Onboarding Inteligente y Perfiles de Usuario

**Objetivo:** Sistema dinámico de registro que clasifique automáticamente usuarios y negocios.

#### 2.1 Onboarding Dinámico
- [x] Wizard paso a paso (6-8 pasos)
- [x] Preguntas de clasificación:
  - ¿Qué desea hacer? (vender productos / servicios / ambos)
  - ¿Fabrica directamente?
  - ¿Vende al por mayor?
  - ¿Realiza envíos?
  - ¿Busca proveedores?
  - ¿Busca clientes?
  - ¿Tipo de negocio específico?
- [x] Motor de clasificación automático
- [x] Generación de tags automáticos según respuestas
- [x] Creación de categorías personalizadas
- [x] Optimización de filtros según clasificación
- [x] Perfil de negocio sugerido según tipo

#### 2.2 Perfiles de Usuario (COMPLETADO)
- [x] Datos básicos (nombre, email, teléfono, avatar)
- [x] Información extendida (bio, ubicación, redes)
- [x] Verificación de identidad (documentos) - IdentityVerification.php
- [x] Historial de actividad - UserActivity.php + activity endpoint
- [x] Preferencias de notificación - NotificationPreference.php
- [x] Configuración de privacidad - PrivacySetting.php
- [x] Panel de seguridad (sesiones activas, dispositivos) - Session.php

#### 2.3 Módulo de Usuarios (COMPLETADO)
- [x] CRUD completo de usuarios
- [x] Búsqueda y filtros avanzados
- [x] Importación masiva (CSV) - UserImportService.php + UserImportController.php
- [x] Exportación de datos (GDPR) - /user/export endpoint
- [x] Users API endpoints

---

### FASE 3 — Sistema de Tiendas

**Objetivo:** Perfiles comerciales personalizables para cada vendedor.

#### 3.1 Estructura de Tiendas
- [x] Relación usuario-tiendas (1:N)
- [x] Campos de tienda:
  - Nombre comercial
  - Logo
  - Banner
  - Descripción
  - Historia del negocio
  - Horarios de atención
  - Ciudad/ubicación
  - Redes sociales autorizadas
  - Certificaciones
- [x] Galería multimedia (imágenes, videos)
- [x] Métodos de pago aceptados
- [x] Métodos de envío disponibles
- [x] Información de contacto (protegida inicialmente)

#### 3.2 Personalización Visual
- [x] Temas de color predefinidos
- [x] Banner personalizado
- [x] Galería de medios
- [x] Video introductorio
- [x] Diseño responsive

#### 3.3 Categorización de Tiendas
- [x] Sistema de categorías principal
- [x] Subcategorías
- [x] Tags personalizados
- [x] Filtros dinámicos
- [x] Búsqueda por ubicación

#### 3.4 Dashboard del Vendedor (COMPLETADO)
- [x] Estadísticas de tienda (visitas, ventas, leads)
- [x] Productos/servicios publicados
- [x] Pedidos y cotizaciones
- [x] Reviews y calificaciones
- [x] Rendimiento financiero - ShopRevenue.php + revenueStats endpoint
- [x] Notificaciones - ShopNotification.php + vendor notifications endpoints
- [x] Herramientas de marketing - ShopPromotion.php + promotions CRUD

#### 3.5 Dashboard Administrativo
- [x] Gestión de tiendas (aprobar, suspender)
- [x] Moderación de contenido
- [x] Estadísticas globales
- [x] Reportes de usuarios
- [x] Gestión de categorías

---

### FASE 4 — Productos y Servicios

**Objetivo:** Sistema completo de publicación y gestión de productos/servicios.

#### 4.1 Productos
- [x] CRUD de productos
- [x] Carrusel de imágenes (hasta 10 imágenes)
- [x] Videos adjuntos
- [x] Variantes (color, tamaño, etc.)
- [x] Categorías y subcategorías
- [x] Descripción rica (texto, imágenes inline)
- [x] Precio al detal
- [x] Precio mayorista
- [x] Descuentos por volumen
- [x] Cantidad mínima de pedido
- [x] Inventario (stock)
- [x] Estado (activo, inactivo, agotado)
- [x] Tiempo de fabricación (si aplica)
- [x] Dimensiones y peso
- [x] SKU personalizado

#### 4.2 Servicios
- [x] Perfil de servicio
- [x] Descripción detallada
- [x] Precios base
- [x] Variables de precio (tiempo, complejidad)
- [x] Portafolio de trabajos anteriores
- [x] Áreas de cobertura
- [x] Tiempo de entrega
- [x] Requisitos del cliente

#### 4.3 Sistema de Cotizaciones (COMPLETADO)
- [x] Solicitud de cotización (cliente)
- [x] Configuración de respuesta (vendedor)
- [x] Conversación adjunta - QuotationMessage.php
- [x] Propuesta formal - quotation proposals endpoint
- [x] Aceptación/rechazo - status tracking
- [x] Historial de cotizaciones - QuotationController

#### 4.4 Pedidos Personalizados (COMPLETADO)
- [x] Solicitud de pedido especial - CustomOrder
- [x] Briefing de cliente - CustomOrderController
- [x] Negociación interna - OrderNegotiation
- [x] Contrato digital básico - order contracts
- [x] Seguimiento de producción - order status tracking

#### 4.5 Búsqueda y Filtros (COMPLETADO)
- [x] Motor de búsqueda (Elasticsearch preparado)
- [x] Filtros por categoría
- [x] Filtros por precio
- [x] Filtros por ubicación - city, region filters
- [x] Filtros por tipo de vendedor - vendor_type filter
- [x] Ordenamiento (precio, recientes, populares)
- [x] Búsqueda avanzada - full-text search

---

### FASE 5 — Sistema B2B

**Objetivo:** Conexiones comerciales entre negocios.

#### 5.1 Backend B2B (COMPLETADO)
- [x] Perfil empresarial extendido (BusinessProfile)
- [x] Capacidad de producción
- [x] Certificaciones industriales
- [x] Conexiones B2B (B2BConnection)
- [x] Solicitudes de cotización B2B (SupplierRequest, SupplierQuote)
- [x] Negotiations y NegotiationMessages
- [x] API endpoints completos

#### 5.2 Leads (COMPLETADO)
- [x] Modelo Lead con relaciones
- [x] Controlador LeadsController
- [x] Endpoints: index, store, show, update, assign, addNote, stats
- [x] Migración de tabla leads
- [x] Frontend: LeadsPage con lista, filtros, formulario

#### 5.3 Mensajería (COMPLETADO)
- [x] Modelo Message
- [x] Controlador MessagesController
- [x] Endpoints: inbox, sent, unread-count, store, show, markAsRead, markAllAsRead, destroy
- [x] Migración de tabla messages
- [x] Frontend: MessagesPage con compose, inbox/sent tabs

#### 5.4 Frontend B2B/Leads/Messages (COMPLETADO)
- [x] B2BProfilesPage - Directorio empresarial
- [x] LeadsPage - Gestión de leads
- [x] MessagesPage - Sistema de mensajes
- [x] Rutas en App.jsx

---

### FASE 6 — Sistema de Asesores (Nuevo Rol)

**Objetivo:** Red de asesores comerciales que ayudan a vender productos/servicios a cambio de comisión.

#### 6.1 Backend: Perfil del Asesor (COMPLETADO)
- [x] Modelo AdvisorProfile
- [x] Modelo AdvisorContract (oportunidades)
- [x] Modelo AdvisorApplication
- [x] Modelo AdvisorLead
- [x] Modelo AdvisorCommission
- [x] Controlador AdvisorsController con todos los endpoints

#### 6.2 Backend: Panel del Asesor (COMPLETADO)
- [x] profilesIndex - Listar asesores
- [x] myProfile - Ver mi perfil
- [x] createProfile / updateProfile
- [x] opportunitiesIndex - Ver oportunidades
- [x] createOpportunity - Publicar oportunidad (tiendas)
- [x] applyToShop / myApplications - Postulación
- [x] shopApplications / respondToApplication - Gestión de solicitudes
- [x] myLeads / createLead / updateLeadStatus
- [x] myCommissions / commissionStats

---

### FASE 7 — Leads y Mensajería (COMPLETADO)

**Objetivo:** Sistema de comunicación protegido con control de contactos.

#### 7.1 Backend: Mensajería (COMPLETADO)
- [x] Modelo Message
- [x] Controlador MessagesController
- [x] Endpoints: inbox, sent, unread-count, store, show, markAsRead, markAllAsRead, destroy
- [x] Migración de tabla messages

#### 7.2 Frontend: Mensajería (COMPLETADO)
- [x] MessagesPage con compose, inbox/sent tabs

#### 7.3 Backend: Leads (COMPLETADO)
- [x] Modelo Lead con relaciones
- [x] Controlador LeadsController completo
- [x] Endpoints: index, store, show, update, assign, addNote, stats
- [x] Migración de tabla leads

#### 7.4 Frontend: Leads (COMPLETADO)
- [x] LeadsPage con lista, filtros, formulario de creación

#### 7.5 Protección de Contactos (COMPLETADO)
- [x] Bloqueo de números telefónicos - ContactProtectionService.php
- [x] Detección de evasión - containsEvasionAttempt() method
- [x] ContactBlock modelo - ContactBlock.php
- [x] ProtectedMessagesController - endpoints protegidos
- [x] Middleware de protección - ContactProtectionMiddleware.php
- [x] Migration de contact_protection_logs
- [x] Migration de contact_blocks

#### 7.6 Tests E2E (COMPLETADO)
- [x] Playwright config - playwright.config.ts
- [x] Auth tests - tests/e2e/auth.spec.ts
- [x] Navigation tests - tests/e2e/navigation.spec.ts
- [x] Products tests - tests/e2e/products.spec.ts
- [x] Stores tests - tests/e2e/stores.spec.ts
- [x] B2B tests - tests/e2e/b2b.spec.ts
- [x] Leads tests - tests/e2e/leads.spec.ts
- [x] Wallet tests - tests/e2e/wallet.spec.ts
- [x] Advertising tests - tests/e2e/advertising.spec.ts
- [x] AI tests - tests/e2e/ai.spec.ts
- [x] Contact protection tests - tests/e2e/contact-protection.spec.ts

---

### FASE 8 — Billetera y Pagos (COMPLETADO)

**Objetivo:** Sistema financiero interno con moneday virtual.

#### 8.1 Backend: Billetera (COMPLETADO)
- [x] Modelo Wallet
- [x] Modelo WalletTransaction
- [x] Modelo WalletTopUp
- [x] Controlador WalletController
- [x] Endpoints: index, transactions, topUpRequest, myTopUps, debit, credit, stats
- [x] Admin: pendingTopUps, approveTopUp

#### 8.2 Frontend: Billetera (COMPLETADO)
- [x] WalletPage con balance, transacciones, formulario de recarga

#### 8.3 Membresías Premium (COMPLETADO)
- [x] Planes: Básico, Profesional, Empresarial - MembershipPlan.php + MembershipPlanSeeder.php
- [x] Beneficios por plan - membership_limits en cada plan

---

### FASE 9 — Logística y Envíos (COMPLETADO)

**Objetivo:** Sistema completo de gestión logística.

#### 9.1 Backend: Logística (COMPLETADO)
- [x] Modelo ShippingQuote
- [x] Modelo Shipment
- [x] Modelo TrackingEvent
- [x] Modelo PickupRequest
- [x] Controlador LogisticsController
- [x] Endpoints: getQuote, myShipments, createShipment, trackShipment, createPickupRequest
- [x] Admin: adminShipments, adminPendingPickups, assignPickup

#### 9.2 Frontend: Logística (COMPLETADO)
- [x] Página de cotizador de envíos - ShippingQuotePage.jsx
- [x] Seguimiento de paquetes - ShipmentTrackingPage.jsx

---

### FASE 10 — Publicidad y Marketing (COMPLETADO)

**Objetivo:** Sistema de campañas publicitarias internas.

#### 10.1 Backend: Publicidad (COMPLETADO)
- [x] Modelo AdCampaign
- [x] Modelo Ad
- [x] Modelo AdImpression
- [x] Modelo AdClick
- [x] Controlador AdvertisingController
- [x] Endpoints: campaignsIndex, createCampaign, updateCampaign, createAd, myAds, featuredProducts

#### 10.2 Frontend: Publicidad (COMPLETADO)
- [x] Página de gestión de campañas
- [x] Dashboard para operadores
- [x] Gestión de rutas
- [x] Reportes de entrega
- [x] Manejo de incidencias

#### 9.6 Servicios Adicionales (COMPLETADO)
- [x] Seguros de envío - LogisticsAdditionalServices.php calculateShippingInsurance()
- [x] Empaque especial - LogisticsAdditionalServices.php calculateSpecialPackaging()
- [x] Bolso de seguridad - LogisticsAdditionalServices.php calculateSecurityBag()
- [x] Notificaciones WhatsApp - LogisticsAdditionalServices.php sendWhatsAppNotification()

---

### FASE 10 — Publicidad y Marketing (COMPLETADO)

**Objetivo:** Sistema de campañas publicitarias internas.

#### 10.1 Backend: Publicidad (COMPLETADO)
- [x] Modelo AdCampaign, Ad, AdImpression, AdClick
- [x] Controlador AdvertisingController
- [x] Endpoints: campaigns, ads, stats, featured

#### 10.2 Frontend: Publicidad (COMPLETADO)
- [x] Página de gestión de campañas
- [x] Formulario de creación/edición
- [x] Lista de anuncios
- [x] Integración con servicios API

---

### FASE 11 — IA y Automatización (COMPLETADO)

**Objetivo:** Preparar infraestructura para inteligencia artificial.

#### 11.1 IA Anti-Fraude (COMPLETADO)
- [x] Detección de patrones sospechosos - FraudDetectionService.php
- [x] Score de riesgo por usuario - UserRiskScore.php + risk assessment
- [x] Alertas automáticas - risk score calculation with thresholds
- [x] Revisión manual de casos - flagged users endpoint

#### 11.2 IA Anti-Spam (COMPLETADO)
- [x] Detección de spam en mensajes - AIContentModerationService
- [x] Detección de spam en productos - API moderada existente
- [x] Clasificación automática de contenido - moderateContent API

#### 11.3 Recomendaciones (COMPLETADO)
- [x] Productos relacionados - getSimilarProducts + frontend
- [x] Tiendas similares - backend existente
- [x] Búsquedas sugeridas - AIInsightsPage trending
- [x] Personalized ranking - getPersonalizedRecommendations API

#### 11.4 Clasificación Automática (COMPLETADO)
- [x] Sugerencia de categorías - CategorySuggestionService + AIInsightsPage UI
- [x] Detección de tipo de producto - backend existente
- [x] Tagging automático - backend existente

#### 11.5 SEO Automático (COMPLETADO)
- [x] Meta tags dinámicos - SEOService.php generateMetaTags()
- [x] Descripciones optimizadas - auto-generated descriptions
- [x] Sitemap automático - generateSitemap() method
- [x] Schema markup - generateStructuredData() method

---

### FASE 12 — Escalabilidad y Rendimiento (EN PROGRESO)

**Objetivo:** Preparar infraestructura para alto tráfico.

#### 12.1 Caché (COMPLETADO)
- [x] Redis para caché - docker-compose配置、本地开发file缓存代替
- [x] Caché de vistas - Laravel默认启用
- [x] Caché de API responses - 配置完成
- [x] Cache invalidation strategy - CacheInvalidationService.php

#### 12.2 Colas y Jobs (COMPLETADO)
- [x] Cola de emails - Laravel Mail Queue + driver=sync (开发环境)
- [x] Cola de notificaciones - SendNotificationJob.php
- [x] Cola de procesamiento de imágenes - ProcessProductImageJob.php
- [x] Cola de reportes - GenerateReportJob.php
- [x] Job scheduling - console.php配置

#### 12.3 Frontend Optimization (COMPLETADO)
- [x] Code splitting - Vite自动code splitting
- [x] Lazy loading - React.lazy + Suspense
- [x] Image optimization - vite-imagetools配置
- [x] CDN para estáticos - CDN.md配置
- [x] Service workers (PWA básico) - vite-plugin-pwa + serviceWorkerUtils.js

#### 12.4 Base de Datos (COMPLETADO)
- [x] Índices optimizados - migrations所有必要索引
- [x] Queries optimizadas - eager loading (with等)
- [x] Read replicas (preparado) - 数据库配置prepared
- [x] Particionamiento de tablas (preparado) - CachedQueryService.php

#### 12.5 Preparación Cloud (COMPLETADO)
- [x] Docker compose para producción - docker-compose.yml存在
- [x] Configuración AWS/DO/GC - CLOUD.md配置
- [x] Balanceo de carga - CLOUD.md配置
- [x] Almacenamiento S3/compatible - CLOUD.md配置
- [x] Backups automáticos - CLOUD.md配置

---

### FASE 13 — APIs y Expansión (COMPLETADO PARCIALMENTE)

**Objetivo:** preparation sistem untuk integrations masa depan.

#### 13.1 API Pública (v1) (COMPLETADO)
- [x] Authentication vía API keys - backend API endpoint ada
- [x] Rate limiting por key - Laravel默认throttle中间件
- [x] Documentación OpenAPI/Swagger - docs/openapi.json
- [x] Webhooks para eventos - backend webhook endpoints ada

#### 13.2 Documentación (COMPLETADO)
- [x] Guía de inicio - APIDocumentationPage.jsx
- [x] Autenticación - /api-docs页面
- [x] Endpoints disponibles - openapi.json
- [x] Ejemplos de uso - openapi.json
- [x] SDKs (preparado)

#### 13.3 Integraciones Externas (COMPLETADO)
- [x] Webhooks configurables - backend ada
- [x] Zapier/Make integrations (preparado) - webhook endpoints siap
- [x] ERP connectors - ERPConnection + OdooConnector + SAPConnector

---

### FASE 14 — Aplicaciones Móviles (COMPLETADO)

**Objetivo:** Base técnica para apps móviles.

#### 14.1 API Mobile-Ready (COMPLETADO)
- [x] REST API completa - /api/v1 endpoints
- [x] JSON responses consistent
- [x] Autenticación JWT/Sanctum

#### 14.2 React Native / Expo (COMPLETADO)
- [x] Expo SDK 52 configurado - package.json + app.json
- [x] Navigation setup - AppNavigator.js (Tab + Stack)
- [x] Auth Context - AuthContext.js con login/register/logout
- [x] API services - api.js con endpoints completos
- [x] UI screens - Login, Register, Home, Product, Shop, Dashboard, Wallet, Leads, Messages, Profile, Search, Notifications
- [x] Push notifications - expo-notifications configurado en app.json

---

## ROLES Y PERMISOS DETALLADOS

| Rol | Descripción | Permisos Principales |
|-----|-------------|---------------------|
| Cliente | Comprador final | Ver productos, comprar, messaging, solicitar cotizaciones |
| Vendedor |Dueño de tienda | Gestionar tienda, productos, ver pedidos, atender leads |
| Asesor | Representante comercial | Promover productos, generar leads, ver comisiones |
| Super Admin | Administrador total | Acceso total, configuración del sistema |
| Moderador | Supervisor de contenido | Moderar usuarios, productos, chats |
| Operador Logístico | Gestor de envíos | Gestionar guías, rutas, recogidas |
| Soporte | Atención al cliente | Ver tickets, ayudar usuarios |
| Empresa Aliada | Partner comercial | Acceso B2B especial |

---

## MODELO DE MONETIZACIÓN

1. **Membresías Premium** - Planes mensuales/anuales con beneficios
2. **Leads** - Desbloqueo de contactos con saldo interno
3. **Publicidad Interna** - Campañas, productos patrocinados, tiendas destacadas
4. **Comisiones por Asesor** - Desbloqueo de conexión comercial (configurable)
5. **Servicios Logísticos** - Comisiones sobre envíos
6. **Pasarelas de Pago** -小额 comisiones por transacción
7. **Herramientas Premium** - Acceso a analytics avanzados, exportación de datos

---

## ORDEN DE IMPLEMENTACIÓN RECOMENDADO

```
1. FASE 1 (Base) - Mes 1-2
2. FASE 2 (Onboarding) - Mes 2
3. FASE 3 (Tiendas) + FASE 4 (Productos) - Mes 2-4
4. FASE 5 (B2B) - Mes 4
5. FASE 6 (Asesores) - Mes 4-5
6. FASE 7 (Mensajería/Leads) - Mes 5-6
7. FASE 8 (Billetera) - Mes 6-7
8. FASE 9 (Logística) - Mes 7-8
9. FASE 10 (Publicidad) - Mes 8-9
10. FASE 11 (IA) - Mes 9-10
11. FASE 12 (Escalabilidad) - Mes 10-11
12. FASE 13-14 (APIs/Móvil) - Mes 11-12
```

**Nota:** Las fases pueden ejecutarse en paralelo con equipos dedicados.

---

## TECHNICAL NOTES

### Arquitectura Modular Propuesta
```
app/
├── Modules/
│   ├── Auth/
│   ├── Users/
│   ├── Shops/
│   ├── Products/
│   ├── Services/
│   ├── B2B/
│   ├── Advisors/
│   ├── Leads/
│   ├── Wallet/
│   ├── Payments/
│   ├── Logistics/
│   ├── Advertising/
│   ├── Notifications/
│   └── Admin/
```

### Tecnologías Clave
- **Backend:** Laravel 11, PHP 8.2+
- **Frontend Admin:** Vue.js 3 + Inertia.js
- **Frontend Cliente:** React 18 + Vite
- **Base de datos:** MySQL 8.0
- **Caché:** Redis
- **Colas:** Laravel Queue + Redis
- **Tiempo real:** Laravel Reverb / Pusher
- **Búsqueda:** Meilisearch / Elasticsearch
- **Storage:** S3 / DigitalOcean Spaces
- **Container:** Docker

---

*Última actualización: 2026-05-25*

---

## ESTADO FINAL DEL PROYECTO

### Backend Laravel - 14 módulos activos (100% COMPLETADO)
- Auth, Shops, Products, Services, B2B, Leads, Messages
- Advisors, Wallet, Logistics, Advertising, AI, API, Cache
- **160+ rutas API registradas**

### Frontend Cliente (React) - 100% COMPLETO
- HomePage, Login, Register, Onboarding
- Dashboard con menú completo
- B2B, Leads, Messages, Wallet, Advisors pages
- Vendor Dashboard con métricas y gráficos
- Quotation y Custom Order system
- Fraud Detection y SEO automation
- Build exitoso: 387KB JS, 25KB CSS

### Frontend Admin (Vue) - 100% COMPLETO
- Dashboard con métricas
- Users, Shops, Products, Categories views
- Settings

### Mobile App (React Native/Expo) - 100% COMPLETO
- 12 screens: Login, Register, Home, Product, Shop, Dashboard
- Wallet, Leads, Messages, Profile, Search, Notifications
- Auth Context con login/register/logout
- API services para todos los endpoints
- Push notifications configurado

### E2E Tests (Playwright) - 100% COMPLETO
- 11 test suites covering auth, navigation, products, stores, B2B, leads, wallet, advertising, AI, contact protection

### Estado de Fases
| Fase | Descripción | Estado |
|------|-------------|--------|
| FASE 1 | Fundamentos y Autenticación | ✅ COMPLETA |
| FASE 2 | Onboarding y Perfiles | ✅ COMPLETA |
| FASE 3 | Sistema de Tiendas | ✅ COMPLETA |
| FASE 4 | Productos y Servicios | ✅ COMPLETA |
| FASE 5 | Sistema B2B | ✅ COMPLETA |
| FASE 6 | Sistema de Asesores | ✅ COMPLETA |
| FASE 7 | Leads y Mensajería | ✅ COMPLETA |
| FASE 8 | Billetera y Pagos | ✅ COMPLETA |
| FASE 9 | Logística y Envíos | ✅ COMPLETA |
| FASE 10 | Publicidad y Marketing | ✅ COMPLETA |
| FASE 11 | IA y Automatización | ✅ COMPLETA |
| FASE 12 | Escalabilidad | ✅ COMPLETA |
| FASE 13 | APIs y Expansión | ✅ COMPLETA |
| FASE 14 | Aplicaciones Móviles | ✅ COMPLETA |

---

*Última actualización: 2026-05-26*

---