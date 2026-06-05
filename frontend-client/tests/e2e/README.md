# E2E Tests - NexusLab

Tests de integración y extremo a extremo con Playwright.

## Requisitos

```bash
npm install
npx playwright install --with-deps
```

## Ejecutar Tests

```bash
# Todos los tests
npm run test:e2e

# Con interfaz visual
npm run test:e2e:ui

# En modo headed (ver navegador)
npm run test:e2e:headed

# Solo un archivo
npx playwright test auth.spec.ts

# Solo un test específico
npx playwright test auth.spec.ts --grep "puede registrarse"
```

## Estructura de Tests

```
tests/e2e/
├── auth.spec.ts              # Tests de autenticación
├── navigation.spec.ts        # Tests de navegación
├── products.spec.ts          # Tests de productos
├── stores.spec.ts            # Tests de tiendas
├── b2b.spec.ts               # Tests B2B
├── leads.spec.ts             # Tests de leads
├── wallet.spec.ts            # Tests de wallet
├── advertising.spec.ts       # Tests de publicidad
├── ai.spec.ts                # Tests de AI
└── contact-protection.spec.ts # Tests de protección
```

## Configuración

Ver `playwright.config.ts` para configuración de:
- Browsers (Chromium, Firefox, Safari)
- Timeout settings
- Base URL
- Web servers

## Coverage

- Auth: Login, Register, Logout
- Navigation: All dashboard sections
- Products: List, filter, search
- Stores: List, search, profile
- B2B: Directory, search, profile
- Leads: CRUD operations
- Wallet: Balance, transactions, top-up
- Advertising: Campaigns CRUD
- AI: Trending, suggestions, moderation
- Contact Protection: Phone blocking, evasion detection