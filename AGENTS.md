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
| React | ^18.3 | UI library |
| Vite | ^6.0 | Build tool & dev server |
| TypeScript | ~5.6 | Type safety across the codebase |
| Tailwind CSS | ^4.2 | Utility-first styling |
| React Router DOM | ^7.13 | Client-side routing |
| Zustand | ^5.0 | Global client-side state management |
| lightweight-charts | ^5.1 | Candlestick / financial charts (TradingView) |
| Vitest | ^4.0 | Unit & integration test runner |
| React Testing Library | ^16.3 | Component testing utilities |
| clsx + tailwind-merge | ^2.1 / ^3.5 | Conditional class name composition |

> **Why Vite?** Vite uses native ES modules in development, giving near-instant hot module replacement (HMR). This is dramatically faster than Webpack-based setups for large React apps.

> **Why React Router v7?** The app uses `BrowserRouter` (real URL paths) rather than hash-based routing. `BrowserRouter` is placed in `main.tsx` so every component in the tree has access to routing hooks (`useNavigate`, `useLocation`, `Link`). Note: the installed version is v7, even though it is API-compatible with the v6 patterns described in this document.

> **Why lightweight-charts?** It is the smallest production-grade candlestick library (≈58 kB gzip), Canvas-based (fast for large datasets), looks identical to TradingView charts, and is Apache-2.0 licensed. Alternatives evaluated: recharts (no candlestick), react-financial-charts (abandoned), react-apexcharts (dual license).

---

## Project Structure

```
src/
├── assets/              # Static files: images, fonts, SVGs
├── components/          # Shared, reusable UI components (not feature-specific)
│   ├── ui/
│   │   └── candlestick-chart.tsx  # React wrapper for lightweight-charts
│   └── protected-route.tsx        # Route guard — redirects to /login if no JWT
├── features/            # Feature-based modules (see Feature Anatomy below)
│   ├── auth/            # Authentication: login, register, JWT
│   └── market/          # Market data: asset list, candlestick detail page
├── pages/               # ⚠️ Legacy — contains orphaned dashboard-page.tsx (unused)
├── services/            # All HTTP API calls (REST layer)
├── stores/              # Zustand store definitions
├── types/               # Global TypeScript types and interfaces
└── utils/               # Pure utility functions (formatting, math...)
```

> **Why feature-based structure?** Co-locating everything related to a feature (components, hooks, pages) inside its own folder makes it easy to find, modify, and eventually delete code. It scales better than organizing by technical role alone (e.g., a flat `components/` folder that grows to 100+ files).

> **`pages/` is legacy.** The `src/pages/dashboard-page.tsx` file is orphaned: it is no longer referenced in `App.tsx`. New pages must be created inside the appropriate `src/features/<name>/pages/` folder, never in `src/pages/`.

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

features/market/
├── hooks/
│   ├── use-assets.ts    # Fetch + sort asset list (available first, null last)
│   └── use-candles.ts   # Fetch OHLCV candles for a given symbol
├── pages/
│   ├── assets-page.tsx       # Grid of asset cards → navigates to /assets/:symbol
│   └── asset-detail-page.tsx # Candlestick chart + back button
└── index.ts
```

**Rules:**
- Pages import hooks using **relative paths** within the feature (`../hooks/use-login`).
- Code **outside** the feature always imports from the barrel: `import { LoginPage } from '@/features/auth'`. Never import from an internal path like `@/features/auth/pages/login-page`.
- Hooks are internal details — only export from `index.ts` what external code needs.
- If a feature grows, add `components/` and `types/` sub-folders following the same pattern.

---

## Routing

Routes are defined in `src/App.tsx` using React Router `<Routes>` and `<Route>`.

```
/                  → redirect to /login
/login             → LoginPage        (public)
/register          → RegisterPage     (public)
/dashboard         → AssetsPage       (protected — requires JWT)
/assets/:symbol    → AssetDetailPage  (protected — requires JWT)
*                  → redirect to /login
```

**Protected routes** are wrapped with `<ProtectedRoute>` (`src/components/protected-route.tsx`), which reads the token from `useAuthStore` and redirects to `/login` if absent.

```tsx
// App.tsx pattern
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<AssetsPage />} />
  <Route path="/assets/:symbol" element={<AssetDetailPage />} />
</Route>
```

> **Why `<ProtectedRoute>` in `components/` and not in `features/auth/`?** It is routing infrastructure, not auth UI. It guards any protected route regardless of feature, making it a shared concern.

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
- `tsconfig.app.json` also enables `noUnusedLocals` and `noUnusedParameters` — any unused import or variable is a **build error**.
- Always type component props with a named `interface`, not `type` aliases or inline objects.
- Always type hook return values with a named `interface` (e.g., `UseLoginReturn`).
- Never use `any`. Use `unknown` and narrow types explicitly when needed.
- API response shapes must be typed in `src/types/api.ts` and reused across services and components.

### Naming
- **Components:** PascalCase (`CandlestickChart`, `AssetCard`)
- **Files:** kebab-case matching the default export (`candlestick-chart.tsx`, `assets-page.tsx`)
- **Hooks:** camelCase prefixed with `use` (`useAssets`, `useCandles`)
- **Stores:** camelCase prefixed with `use` (`useAuthStore`)
- **Services:** camelCase, noun-based (`authService`, `marketService`)

### Imports
- Use the `@/` alias for all imports that cross feature or module boundaries.
- Use **relative paths** (`../hooks/use-assets`) only for imports within the same feature folder.
- Always import from the feature barrel, never from internal paths:
  ```ts
  // Good
  import { AssetsPage } from '@/features/market'

  // Bad — breaks encapsulation
  import { AssetsPage } from '@/features/market/pages/assets-page'
  ```

### Async / Promises
- Never leave floating promises. Use `void fetchFn()` inside `useEffect` to satisfy `no-floating-promises`.
- Always use a `cancelled` flag in `useEffect` data-fetching hooks to prevent `setState` on unmounted components:
  ```ts
  useEffect(() => {
    let cancelled = false
    async function fetch() {
      const data = await getAssets()
      if (!cancelled) setAssets(data)
    }
    void fetch()
    return () => { cancelled = true }
  }, [])
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
interface AssetCardProps {
  asset: Asset
}

export function AssetCard({ asset }: AssetCardProps) { ... }
```

- **Avoid prop drilling beyond 2 levels.** If data needs to pass through more than two components, lift it to a Zustand store or use a context.
- **Component size:** If a component exceeds ~100 lines of JSX, it should be split into smaller sub-components.

---

## State Management (Zustand)

All global application state lives in Zustand stores under `src/stores/`. Each store is scoped to a single business domain.

```
stores/
└── use-auth-store.ts   # JWT token, setToken, logout  ← implemented
```

Planned stores (not yet created):
```
stores/
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

- **No inline `style` props** unless animating dynamic numeric values (e.g., a chart height in pixels) that cannot be expressed with Tailwind.
- Define design tokens (colors, spacing, fonts) in `tailwind.config.ts` under the `theme.extend` key, not as hardcoded values in class names.

---

## API Integration (REST)

All HTTP communication is centralized in `src/services/`. Components and stores must **never** call `fetch` directly.

```
services/
├── api-client.ts        # Base HTTP client: base URL, JWT injection, error handling
├── auth-service.ts      # POST /auth/login, POST /auth/register
├── hello-service.ts     # GET /hello (health check / demo)
└── market-service.ts    # GET /assets, GET /assets/{symbol}/candles
```

### Implemented API endpoints

| Method | Path | Auth | Service function |
|---|---|---|---|
| `POST` | `/auth/login` | No | `authService.login()` |
| `POST` | `/auth/register` | No | `authService.register()` |
| `GET` | `/assets` | JWT | `getAssets()` |
| `GET` | `/assets/{symbol}/candles` | JWT | `getCandles(symbol)` |

### API response shapes

```ts
// GET /assets
Asset[]  →  { symbol: string, lastPrice: number | null, lastDate: string | null }

// GET /assets/{symbol}/candles
Candle[] →  { date: string, open: number, high: number, low: number, close: number, volume: number }

// Error (e.g. 404)
AssetError → { error: string, symbol: string }
```

- `api-client.ts` wraps `fetch` and handles: base URL (from `VITE_API_BASE_URL`), attaching the JWT `Authorization: Bearer` header on every request, and throwing a typed `Error` on non-2xx responses.
- All service functions must return typed data. Define response interfaces in `src/types/api.ts`.
- Handle loading and error states explicitly in hooks; never silently swallow errors.

---

## Charts (lightweight-charts)

Financial charts use `lightweight-charts` v5 (TradingView). The library is vanilla JS and operates directly on a DOM node — it must be wrapped in a React component using `useRef` + `useEffect`.

### Pattern: `CandlestickChart` component (`src/components/ui/candlestick-chart.tsx`)

```tsx
// 1. Get a ref to the container div
const containerRef = useRef<HTMLDivElement>(null)

useEffect(() => {
  if (!containerRef.current) return

  // 2. Create the chart instance on the DOM node
  const chart = createChart(containerRef.current, { ... })

  // 3. Add a series using the v5 API (series definition object, not method name)
  const series = chart.addSeries(CandlestickSeries, { ... })

  // 4. Feed data — lightweight-charts expects { time: "YYYY-MM-DD", open, high, low, close }
  series.setData(candles.map(c => ({ time: c.date, ... })))

  // 5. MANDATORY cleanup — removes the canvas and all DOM listeners
  return () => { chart.remove() }
}, [candles])
```

**Key points:**
- `chart.remove()` in the cleanup is not optional. Without it, every re-render leaks a canvas element and event listeners.
- v5 uses `chart.addSeries(CandlestickSeries, options)` — the old v4 method `chart.addCandlestickSeries()` no longer exists.
- `lightweight-charts` expects the `time` field typed as a branded string `` `${number}-${number}-${number}` `` — cast `c.date` explicitly to satisfy TypeScript strict mode.
- The library is ESM-only; it works with Vite out of the box, but cannot be `require()`'d in Node.js scripts.
