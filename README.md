# ResQBag

ResQBag is a platform designed to connect customers with local restaurants to rescue surplus food.

This repository contains two completely separate React Native applications built with Expo, configured in a simple monorepo structure.

## Repository Structure

```
ResQBag/
├── apps/
│   ├── customer/      # The ResQBag Customer App
│   └── merchant/      # The ResQBag Merchant App
└── packages/
    └── shared/        # Shared constants, types, and utilities
```

## Running the Apps

Both apps are completely independent and require their own dependencies to be installed. They share common backend logic via Supabase.

### 1. Customer App

```bash
cd apps/customer
npm install
npx expo start
```

### 2. Merchant App

```bash
cd apps/merchant
npm install
npx expo start
```

## Shared Code

The apps share logic via TypeScript path aliases (`@shared/*`).
If you add new shared code in `packages/shared`, you can import it in either app like this:
```typescript
import { Colors } from '@shared/constants/colors';
```
This is configured via `metro.config.js` and `tsconfig.json` in each app without requiring NPM workspaces.
