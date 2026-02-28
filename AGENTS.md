# Agent Guidelines: Trading Assistant

This document provides instructions and guidelines for agentic coding agents working on the Trading Assistant repository. Adhering to these patterns ensures consistency and maintainability across the codebase.

---

## Agent Behavior & Pedagogical Rules

- **Pedagogical Focus:** Your primary goal is to ensure the user learns as much as possible and gains technical skills. Always provide clear, detailed explanations for your implementation choices, architectural patterns, and tool selections. You are an educator as much as an assistant; focus on the "why" behind every decision.
- **No Automatic Git Operations:** NEVER perform `git commit`, `git push`, or any other Git operations automatically. You must strictly wait for an explicit user request before executing any Git-related commands. This ensures the user remains in control of the project's history.
- **Explain Before Implementing:** Before writing significant code, briefly explain the chosen approach and the alternatives that were considered. This helps the user understand the design space.
- **Small, Reviewable Changesets:** Prefer small, focused changes over large rewrites. Each change should be easy to read and understand in isolation.

---

## Project Overview

**Your Trading Assistant** is a React-based web frontend for a trading assistant application. It provides users with market data visualization, portfolio tracking, and AI-assisted trading insights. The frontend communicates with a REST API backend (`http://localhost:8080`) and aims to be fast, accessible, and maintainable.

---

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| React | 18+ | UI library |
| Vite | 5+ | Build tool & dev server |
| TypeScript | 5+ | Type safety across the codebase |
| Tailwind CSS | 4+ | Utility-first styling |
| React Router | 6+ | Client-side routing |
| Zustand | 5+ | Global client-side state management |
| Vitest | 1+ | Unit & integration test runner |
| React Testing Library | 14+ | Component testing utilities |
| clsx + tailwind-merge | latest | Conditional class name composition |

> **Why Vite?** Vite uses native ES modules in development, giving near-instant hot module replacement (HMR). This is dramatically faster than Webpack-based setups for large React apps.

> **Why React Router?** The app uses `BrowserRouter` (real URL paths) rather than hash-based routing. `BrowserRouter` is placed in `main.tsx` so every component in the tree has access to routing hooks (`useNavigate`, `useLocation`, `Link`).

---

## Project Structure

```
src/
├── assets/          # Static files: images, fonts, SVGs
├── components/      # Shared, reusable UI components (not feature-specific)
│   ├── ui/          # Low-level primitives (Button, Card, Input...)
│   └── protected-route.tsx  # Route guard — redirects to /login if no JWT
├── features/        # Feature-based modules (see Feature Anatomy below)
│   └── auth/        # Authentication: login, register, JWT
├── pages/           # Route-level pages not tied to a single feature
├── services/        # All HTTP API calls (REST layer)
├── stores/          # Zustand store definitions
├── types/           # Global TypeScript types and interfaces
└── utils/           # Pure utility functions (formatting, math...)
```

> **Why feature-based structure?** Co-locating everything related to a feature (components, hooks, pages) inside its own folder makes it easy to find, modify, and eventually delete code. It scales better than organizing by technical role alone (e.g., a flat `components/` folder that grows to 100+ files).

---

## Feature Anatomy

Each feature under `src/features/<name>/` follows this internal structure:

```
features/auth/
├── hooks/           # Business logic — form state, API calls, side effects
│   ├── use-login.ts
│   └── use-register.ts
├── pages/           # JSX only — consumes hooks, no logic inside
│   ├── login-page.tsx
│   └── register-page.tsx
└── index.ts         # Barrel — public API of the feature
```

**Rules:**
- Pages import hooks using **relative paths** within the feature (`../hooks/use-login`).
- Code **outside** the feature always imports from the barrel: `import { LoginPage } from '@/features/auth'`. Never import from an internal path like `@/features/auth/pages/login-page`.
- Hooks are internal details — only export from `index.ts` what external code needs.
- If a feature grows, add `components/` and `types/` sub-folders following the same pattern.

---

## Routing

Routes are defined in `src/App.tsx` using React Router v6 `<Routes>` and `<Route>`.

```
/           → redirect to /login
/login      → LoginPage     (public)
/register   → RegisterPage  (public)
/dashboard  → DashboardPage (protected — requires JWT)
*           → redirect to /login
```

**Protected routes** are wrapped with `<ProtectedRoute>` (`src/components/protected-route.tsx`), which reads the token from `useAuthStore` and redirects to `/login` if absent.

```tsx
// App.tsx pattern
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<DashboardPage />} />
</Route>
```

> **Why `<ProtectedRoute>` in `components/` and not in `features/auth/`?** It is routing infrastructure, not auth UI. It will guard any future protected route (market, portfolio…), making it a shared concern.

---

## Authentication & JWT

The app uses JWT tokens issued by the backend on `POST /auth/register` and `POST /auth/login`.

### Token lifecycle

| Step | Where |
|---|---|
| Receive token | `auth-service.ts` returns `{ token }` |
| Store token | `useAuthStore.setToken(token)` → Zustand + `localStorage` |
| Attach to requests | `api-client.ts` reads `localStorage['auth_token']` on every `request()` call |
| Read in components | `useAuthStore(s => s.token)` |
| Logout | `useAuthStore.logout()` → clears Zustand + `localStorage` |

### Why `localStorage` for the token?

`localStorage` persists across page refreshes, which is practical for development and testing. The alternative — `HttpOnly` cookies — is more secure against XSS attacks but requires backend cooperation. For a production app, prefer `HttpOnly` cookies.

### Why does `api-client.ts` read `localStorage` directly instead of the Zustand store?

`api-client.ts` is a plain TypeScript module (no React). Importing `useAuthStore` would couple the network layer to the UI layer and could cause circular dependency issues. Since the Zustand store is always initialized from `localStorage`, both are in sync.

---

## Coding Conventions

### TypeScript
- **Strict mode is mandatory.** `tsconfig.json` must include `"strict": true`.
- Always type component props with a named `interface`, not `type` aliases or inline objects.
- Always type hook return values with a named `interface` (e.g., `UseLoginReturn`).
- Never use `any`. Use `unknown` and narrow types explicitly when needed.
- API response shapes must be typed in `src/types/api.ts` and reused across services and components.

### Naming
- **Components:** PascalCase (`MarketChart`, `PortfolioSummary`)
- **Files:** kebab-case matching the default export (`market-chart.tsx`, `portfolio-summary.tsx`)
- **Hooks:** camelCase prefixed with `use` (`useLogin`, `useMarketData`)
- **Stores:** camelCase prefixed with `use` (`useAuthStore`, `useMarketStore`)
- **Services:** camelCase, noun-based (`authService`, `marketService`)

### Imports
- Use the `@/` alias for all imports that cross feature or module boundaries.
- Use **relative paths** (`../hooks/use-login`) only for imports within the same feature folder.
- Always import from the feature barrel, never from internal paths:
  ```ts
  // Good
  import { LoginPage } from '@/features/auth'

  // Bad — breaks encapsulation
  import { LoginPage } from '@/features/auth/pages/login-page'
  ```

### Exports
- Prefer named exports over default exports for components, hooks, and utilities.
- Use `index.ts` barrel files at the feature level to expose a clean public API for each feature.

---

## Component Architecture

- **Functional components only.** Class components are forbidden.
- **Separate logic from presentation.** Extract business logic and side effects into custom hooks. A component (page) file should primarily contain JSX.
- **Props interface:** Always define an explicit `interface` for component props, even if there is only one prop.

```tsx
// Good
interface MarketTickerProps {
  symbol: string;
  price: number;
  change: number;
}

export function MarketTicker({ symbol, price, change }: MarketTickerProps) { ... }
```

- **Avoid prop drilling beyond 2 levels.** If data needs to pass through more than two components, lift it to a Zustand store or use a context.
- **Component size:** If a component exceeds ~100 lines of JSX, it should be split into smaller sub-components.

---

## State Management (Zustand)

All global application state lives in Zustand stores under `src/stores/`. Each store is scoped to a single business domain.

```
stores/
├── use-auth-store.ts        # JWT token, setToken, logout
├── use-market-store.ts      # Live prices, selected symbols, market status
├── use-portfolio-store.ts   # User positions, P&L, account balance
└── use-assistant-store.ts   # Chat history, loading state for AI responses
```

**Rules:**
- Never put derived data in a store. Compute it inside the component or hook using selectors.
- Use slice-based selectors to avoid unnecessary re-renders: `const token = useAuthStore(s => s.token)`.
- Actions (functions that mutate state) must be defined inside the store, not in components.
- If a store needs to persist data across reloads, sync with `localStorage` inside the store's actions (see `use-auth-store.ts` for the pattern).

> **Why Zustand?** It is minimal (~1kb), does not require a Provider wrapper, and its API is just plain JavaScript objects and functions — making it very easy to understand and test compared to Redux.

---

## Styling (Tailwind CSS)

- Apply styles directly via Tailwind utility classes in JSX. Avoid writing custom CSS files except for truly global styles in `src/index.css`.
- Use the `cn()` helper for all conditional or merged class names. This prevents Tailwind class conflicts.

```tsx
import { cn } from '@/utils/cn'

// cn() combines clsx (conditional logic) with tailwind-merge (conflict resolution)
<div className={cn('rounded px-4 py-2', isActive && 'bg-blue-600 text-white')} />
```

- **No inline `style` props** unless animating dynamic numeric values (e.g., a chart's height in pixels) that cannot be expressed with Tailwind.
- Define design tokens (colors, spacing, fonts) in `tailwind.config.ts` under the `theme.extend` key, not as hardcoded values in class names.

---

## API Integration (REST)

All HTTP communication is centralized in `src/services/`. Components and stores must **never** call `fetch` directly.

```
services/
├── api-client.ts        # Base HTTP client: base URL, JWT injection, error handling
├── auth-service.ts      # POST /auth/login, POST /auth/register
├── market-service.ts    # GET /market/prices, GET /market/history, etc.
└── portfolio-service.ts # GET /portfolio, POST /portfolio/trade, etc.
```

- `api-client.ts` wraps `fetch` and handles: base URL (from `VITE_API_BASE_URL`), attaching the JWT `Authorization: Bearer` header on every request, and throwing typed errors on non-2xx responses.
- All service functions must return typed data. Define response interfaces in `src/types/api.ts`.
- Handle loading and error states explicitly; never silently swallow errors.


- Aim for high coverage on `services/` and `stores/` (pure logic), and behavioral coverage on key user flows in `features/`.
