# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

ERP + E-commerce system for a jewelry store ("joalheria"). Turborepo monorepo with three apps and one shared package.

## Commands

### Root (run from `/`)
```bash
yarn install          # install all dependencies
yarn dev              # start all apps concurrently via Turborepo
yarn build            # build all apps
yarn lint             # lint all apps
yarn format           # prettier --write .

yarn db:up            # start PostgreSQL + Redis via Docker Compose
yarn db:down          # stop containers
yarn db:migrate       # run Prisma migrations (dev)
yarn db:seed          # seed database with sample jewelry products
yarn db:studio        # open Prisma Studio GUI
```

### Per-app (run from app directory)
```bash
# erp-api (NestJS)
yarn test             # jest
yarn test:cov         # jest --coverage
yarn lint             # eslint src + test

# erp-web (React/Vite)
yarn dev              # vite --port 3001

# ecommerce-web (Next.js)
yarn dev              # next dev -p 3002
```

### Database
```bash
# From apps/erp-api/
npx prisma migrate dev --name <name>    # create + apply migration
npx prisma generate                     # regenerate Prisma client after schema changes
npx ts-node prisma/seed.ts              # re-seed
```

## Architecture

### Monorepo structure
```
apps/
  erp-api/        # NestJS REST API (port 3000)
  erp-web/        # React ERP frontend (port 3001)
  ecommerce-web/  # Next.js 14 storefront (port 3002)
packages/
  shared/         # @erp/shared — shared TypeScript types/utils (must build before apps)
infra/
  docker-compose.yml  # PostgreSQL 16 + Redis 7
```

### erp-api (NestJS)
Standard NestJS module-per-domain layout. Each domain (`auth`, `users`, `products`, `stock`, `categories`, `customers`, `quotes`, `sales`, `financial`, `lancamentos`) has its own `*.module.ts`, `*.service.ts`, `*.controller.ts`, and `dto/` folder.

- **Auth:** JWT (passport-jwt) + local strategy. Roles: `ADMIN | GERENTE | VENDEDOR | ESTOQUISTA`. Guards: `JwtAuthGuard` (authentication) and `RolesGuard` (authorization) live in `src/auth/guards/`.
- **Database:** Prisma ORM → PostgreSQL. The `PrismaModule` is global; inject `PrismaService` directly in any service.
- **Rate limiting:** `ThrottlerModule` (100 req/60 s globally).
- **Docs:** Swagger at `http://localhost:3000/api/docs`.
- **Lancamentos:** Raw import tables (`LancamentoCompra`, `LancamentoVenda`, `LancamentoAcerto`) used to migrate data from the legacy system.

### erp-web (React + Vite)
SPA with React Router v6 nested routes. Auth state lives in Zustand (`src/stores/auth.store.ts`); the token guards the entire `<Layout>` subtree via `<PrivateRoute>`. Data fetching uses TanStack Query + axios. Pages map 1:1 to modules (Dashboard, Products, Customers, Quotes, Sales, Financial, DRE, Lancamentos).

### ecommerce-web (Next.js 14 App Router)
Public storefront. Currently minimal: catalog + per-product WhatsApp button. Runs independently; does not share session state with erp-web.

### @erp/shared (packages/shared)
Compiled TypeScript package. **Must be built before erp-api can start.** Turborepo's `build` pipeline handles this via `"dependsOn": ["^build"]`. When running `yarn dev` from root this is automatic; if running erp-api standalone, run `cd packages/shared && yarn build` first.

## Service URLs
| Service      | URL                             |
|--------------|---------------------------------|
| REST API     | http://localhost:3000           |
| Swagger      | http://localhost:3000/api/docs  |
| ERP frontend | http://localhost:3001           |
| E-commerce   | http://localhost:3002           |

Default login: `admin@erp-joalheria.com` / `Admin@2024`

## Key data model facts
- `Product` has many optional fields from a legacy system migration (gold purchase price `valorCompraAu`, markup columns, `moedaCompra`, etc.). These are preserved for import compatibility.
- `Quote` → `Sale` is a one-to-one optional relationship (a sale may originate from a quote).
- `Sale` → `Transaction` (one-to-many): sales generate financial transactions automatically.
- `StockMovement` records every inventory change; stock quantity on `Product` is the denormalized current value.
