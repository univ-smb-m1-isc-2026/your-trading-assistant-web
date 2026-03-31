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
│   ├── layout/
│   │   ├── app-layout.tsx         # Shell: TopNavbar + Sidebar + <Outlet /> + SessionExpiredModal
│   │   ├── sidebar.tsx            # Left nav: Dashboard, Favoris, Alertes links
│   │   └── top-navbar.tsx         # Top bar: logo, theme toggle, logout
│   ├── ui/
│   │   ├── candlestick-chart.tsx  # React wrapper for lightweight-charts
│   │   └── session-expired-modal.tsx  # 403 modal: logout or dismiss
│   └── protected-route.tsx        # Route guard — redirects to /login if no JWT
├── features/            # Feature-based modules (see Feature Anatomy below)
│   ├── alerts/          # Alert system: create, edit, delete, history
│   ├── auth/            # Authentication: login, register, JWT
│   ├── landing/         # Public landing page (pre-login)
│   ├── market/          # Market data: asset list, favorites, candlestick detail
│   └── patterns/        # Chart patterns: list, pagination, filters, detection history
├── pages/               # ⚠️ Legacy — contains orphaned dashboard-page.tsx (unused)
├── services/            # All HTTP API calls (REST layer)
├── stores/              # Zustand store definitions
├── types/               # Global TypeScript types and interfaces
└── utils/               # Pure utility functions (formatting, math...)

design/                  # Pencil (.pen) design files for UI iterations

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

features/landing/
├── pages/
│   └── landing-page.tsx   # Public marketing/entry page
└── index.ts

features/market/
├── hooks/
│   ├── use-assets.ts          # Fetch + sort asset list (available first, null last)
│   ├── use-candles.ts         # Fetch OHLCV candles for a given symbol
│   ├── use-favorites.ts       # Read/toggle favorites via REST + useFavoritesStore
│   ├── use-moving-averages.ts # Fetch SMA/EMA series, refetch on type/periods change
│   └── use-chart-patterns.ts  # Fetch chart patterns for a given symbol (Hammer, Stars...)
├── pages/
│   ├── assets-page.tsx        # Binance-style table + TodayAlertsBanner + search
│   ├── asset-detail-page.tsx  # Candlestick chart + MA controls + patterns + alert sections
│   └── favorites-page.tsx     # Filtered table of starred assets + search
└── index.ts

features/predictions/
├── hooks/
│   ├── use-asset-predictions.ts   # Fetch daily AI predictions for a specific asset
│   ├── use-backtest-global.ts     # Global success rate & performance metrics
│   ├── use-backtest-assets.ts     # Success rates grouped and sorted by asset
│   └── use-backtest-single-asset.ts # Historical success metrics for a specific asset
├── components/
│   ├── asset-prediction-widget.tsx # Under-chart UI showing latest prediction, history & 30D backtest
│   ├── prediction-badge.tsx        # Small UI element showing expected variation with up/down arrows
│   ├── prediction-stats-banner.tsx # Global health check banner for predictions performance
│   ├── success-rate-bar.tsx        # UI component for historical accuracy (percent + bidirectional bar)
│   └── top-predictions-table.tsx   # Sortable table (by variation or success rate) with clickable rows
├── pages/
│   ├── signals-page.tsx        # Global view of top predictions with 30-day reliability metrics
│   └── backtest-page.tsx       # Historical performance review (Global KPI & per-asset table)
└── index.ts

features/profile/
├── hooks/
│   └── use-profile.ts         # Logic for updating user settings via backend
├── components/
│   └── webhook-banner.tsx     # Specialized banner for discord/slack integration settings
├── pages/
│   └── profile-page.tsx       # User settings page (Webhook URLs, account config)
└── index.ts

features/alerts/
├── hooks/
│   ├── use-alerts.ts          # Fetch GET /alerts + CRUD (create/update/delete)
│   ├── use-triggered-alerts.ts # Fetch GET /alerts/triggered (history)
│   ├── use-asset-alerts.ts    # Filtered view by symbol (combines the two hooks)
│   └── use-alert-card.ts      # Logic for alert card: edit state, confirmation timer
├── components/
│   ├── alert-form.tsx         # Inline creation form (type, direction, threshold, recurring)
│   ├── alert-card.tsx         # Active alert card: display + edit inline + delete (confirm)
│   ├── triggered-alert-card.tsx # Triggered alert: vivid (today) or pastel (>1 day)
│   └── today-alerts-banner.tsx  # Compact banner for dashboard (today's triggers only)
├── pages/
│   └── alerts-page.tsx        # /alerts: history (default) + management (gear toggle)
└── index.ts

features/patterns/
├── hooks/
│   └── use-patterns.ts        # Fetch GET /patterns + /patterns/stats (pagination, filters, global counts)
├── components/
│   └── pattern-card.tsx       # Display a detected pattern (vivid if today, pastel otherwise)
├── pages/
│   └── patterns-page.tsx      # /patterns: list with search, category and type filters
└── index.ts
```

**Rules:**
- Pages import hooks using **relative paths** within the feature (`../hooks/use-login`).
- Code **outside** the feature always imports from the barrel: `import { LoginPage } from '@/features/auth'`. Never import from an internal path like `@/features/auth/pages/login-page`.
- Hooks are internal details — only export from `index.ts` what external code needs.
- Exception: `useAssetAlerts` is exported from `@/features/alerts` because it is consumed by `asset-detail-page.tsx` in the `market` feature.
- If a feature grows, add `components/` and `types/` sub-folders following the same pattern.

---

## Routing

Routes are defined in `src/App.tsx` using React Router `<Routes>` and `<Route>`.

```
/                  → LandingPage      (public)
/login             → LoginPage        (public)
/register          → RegisterPage     (public)
/dashboard         → AssetsPage       (protected — requires JWT)
/assets/:symbol    → AssetDetailPage  (protected — requires JWT)
/favorites         → FavoritesPage    (protected — requires JWT)
/alerts            → AlertsPage       (protected — requires JWT)
/patterns          → PatternsPage     (protected — requires JWT)
/predictions       → SignalsPage      (protected — requires JWT)
/predictions/backtest → BacktestPage  (protected — requires JWT)
/profile           → ProfilePage      (protected — requires JWT)
*                  → redirect to /
```

**Protected routes** are wrapped with `<ProtectedRoute>` (`src/components/protected-route.tsx`), which reads the token from `useAuthStore` and redirects to `/login` if absent. `AppLayout` is nested inside `ProtectedRoute` and renders via `<Outlet />`.

```tsx
// App.tsx pattern
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<AssetsPage />} />
    <Route path="/assets/:symbol" element={<AssetDetailPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/alerts" element={<AlertsPage />} />
    <Route path="/patterns" element={<PatternsPage />} />
    <Route path="/predictions" element={<SignalsPage />} />
    <Route path="/predictions/backtest" element={<BacktestPage />} />
    <Route path="/profile" element={<ProfilePage />} />
  </Route>
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
| Logout | `useAuthStore.logout()` → clears Zustand + `localStorage` + resets favorites + resets alerts |

### Why `localStorage` for the token?

`localStorage` persists across page refreshes, which is practical for development and testing. The alternative — `HttpOnly` cookies — is more secure against XSS attacks but requires backend cooperation. For a production app, prefer `HttpOnly` cookies.

### Why does `api-client.ts` read `localStorage` directly instead of the Zustand store?

`api-client.ts` is a plain TypeScript module (no React). Importing `useAuthStore` would couple the network layer to the UI layer and could cause circular dependency issues. Since the Zustand store is always initialized from `localStorage`, both are in sync.

**Exception:** on HTTP 403, `api-client.ts` calls `useAuthStore.getState().setSessionExpired(true)` to trigger the session-expired modal. `getState()` is the Zustand escape hatch for non-React contexts and does not create a subscription.

### Session expiry (HTTP 403)

When the backend returns 403, `api-client.ts` sets `sessionExpired: true` in `useAuthStore`. `AppLayout` renders a `<SessionExpiredModal>` when this flag is true. The modal offers:
- **Se déconnecter** — calls `logout()` and navigates to `/login`
- **Ignorer** — calls `setSessionExpired(false)` to dismiss

The 403 check happens **before** the generic `!res.ok` throw so the modal always fires even if the caller does not catch errors.

---

## Theming (Dark / Light)

Theme state lives in `src/stores/use-theme-store.ts`. It persists the user's preference in `localStorage` under the key `theme`. Default: system preference via `window.matchMedia('(prefers-color-scheme: dark)')`.

### How dark mode works with Tailwind CSS v4

Tailwind v4 does **not** use `tailwind.config.ts` for the dark variant. Instead, `src/index.css` declares:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

This makes every `dark:` utility class apply whenever a `.dark` class is present on any ancestor element. The theme store toggles this class on `<html>` (`document.documentElement`).

### Anti-FOUC script

`index.html` includes an inline `<script>` before the React bundle that reads `localStorage.theme` and immediately applies `.dark` to `<html>` if needed. This prevents a Flash Of Unstyled Content (FOUC) where the page briefly renders in the wrong theme while JS loads.

### lightweight-charts and theming

`lightweight-charts` is vanilla JS and ignores CSS classes entirely. Theme colors are passed directly to `createChart()` as configuration. The `useEffect` in `CandlestickChart` depends on `theme` — when the user toggles, the chart is destroyed and recreated with the correct palette.

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
  import { AlertsPage, TodayAlertsBanner, useAssetAlerts } from '@/features/alerts'

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
├── use-auth-store.ts       # JWT token, setToken, logout, sessionExpired flag
├── use-theme-store.ts      # 'light' | 'dark' theme, persisted in localStorage
├── use-favorites-store.ts  # Cached favorite assets, loaded flag
└── use-alerts-store.ts     # Cached alerts + triggered history, loaded flags, CRUD actions
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

### `loaded` flag pattern

Both `useFavoritesStore` and `useAlertsStore` use `loaded` boolean flags. The corresponding hooks check this flag before fetching — if already loaded, the API call is skipped. This prevents double-fetching when the user navigates between pages. The flags are reset to `false` on logout so fresh data is fetched on the next login.

`useAlertsStore` has two separate flags:
- `alertsLoaded` — for `GET /alerts` (configured alerts)
- `triggeredLoaded` — for `GET /alerts/triggered` (history)

This allows each collection to be fetched independently without blocking the other.

### Alerts store — granular CRUD actions

`useAlertsStore` exposes `addAlert`, `updateAlert`, and `removeAlert` actions in addition to `setAlerts`. After a successful POST/PUT/DELETE, hooks call these granular actions to update the store locally, avoiding a full re-fetch of `GET /alerts`. This gives the user an instant, optimistic UI response.

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

- **Tailwind v4 dark mode** uses `@custom-variant dark (&:where(.dark, .dark *))` in `src/index.css`. There is **no** `tailwind.config.ts` for this — it would not work.
- Design tokens (primary color, background, border colors) are defined as CSS custom properties in `src/index.css` inside `:root` and `.dark` blocks, not in a Tailwind config file.
- **No inline `style` props** unless the value is dynamic and cannot be expressed as a Tailwind class (e.g., a hex color from a data-driven palette). Exception: `backgroundColor` on MA period badges, where the color is a runtime hex string.
- **No icon libraries.** All icons are inline SVG with `viewBox`, `fill`, and `stroke` props.
- **CSS-only animations.** Use Tailwind's `animate-spin`, `animate-pulse`, etc. Do not add Framer Motion.

---

## API Integration (REST)

All HTTP communication is centralized in `src/services/`. Components and stores must **never** call `fetch` directly.

```
services/
├── api-client.ts        # Base HTTP client: base URL, JWT injection, 403 detection, empty body handling
├── auth-service.ts      # POST /auth/login, POST /auth/register
├── hello-service.ts     # GET /hello (health check / demo)
├── market-service.ts    # GET /assets, GET /assets/{symbol}/candles,
│                        # GET/POST/DELETE /favorites,
│                        # GET /assets/{symbol}/moving-averages
└── alert-service.ts     # GET/POST /alerts, PUT/DELETE /alerts/{id},
                         # GET /alerts/triggered
```

### Implemented API endpoints

| Method | Path | Auth | Service function |
|---|---|---|---|
| `POST` | `/auth/login` | No | `authService.login()` |
| `POST` | `/auth/register` | No | `authService.register()` |
| `GET` | `/assets` | JWT | `getAssets()` |
| `GET` | `/assets/{symbol}/candles` | JWT | `getCandles(symbol)` |
| `GET` | `/assets/favorites` | JWT | `getFavorites()` |
| `POST` | `/assets/{symbol}/favorite` | JWT | `addFavorite(symbol)` |
| `DELETE` | `/assets/{symbol}/favorite` | JWT | `removeFavorite(symbol)` |
| `GET` | `/assets/{symbol}/moving-averages` | JWT | `getMovingAverages(symbol, type, periods)` |
| `GET` | `/assets/{symbol}/patterns` | JWT | `getChartPatterns(symbol)` |
| `GET` | `/patterns` | JWT | `getPatterns(page, size, symbol, type, category)` |
| `GET` | `/patterns/stats` | JWT | `getPatternStats(symbol, category)` |
| `GET` | `/alerts` | JWT | `getAlerts()` |
| `POST` | `/alerts` | JWT | `createAlert(data)` |
| `PUT` | `/alerts/{id}` | JWT | `updateAlert(id, data)` |
| `DELETE` | `/alerts/{id}` | JWT | `deleteAlert(id)` |
| `GET` | `/alerts/triggered` | JWT | `getTriggeredAlerts()` |

### API response shapes

```ts
// GET /assets
Asset[]  →  { symbol: string, lastPrice: number | null, lastDate: string | null }

// GET /assets/{symbol}/candles
Candle[] →  { date: string, open: number, high: number, low: number, close: number, volume: number }

// GET /assets/favorites
Asset[]  →  same shape as GET /assets, filtered to user's favorites

// POST /assets/{symbol}/favorite  /  DELETE /assets/{symbol}/favorite
// Returns HTTP 200 with empty body — no JSON to parse

// GET /assets/{symbol}/moving-averages?type=SMA&periods=20,50
MovingAverageSeries[] → [{ type: "SMA", period: 20, values: [{ date, value }] }]

// GET /assets/{symbol}/patterns
ChartPatternDetail[] → [{ id, symbol, type, lines: [{ start: { date, value }, end: { date, value } }] }]

// GET /patterns
Page<ChartPatternResponse> → { content: [{ id, assetSymbol, type, category, date }], totalPages, totalElements, ... }

// GET /patterns/stats
PatternStats → { "TYPE_A": 10, "TYPE_B": 5, ... }

// GET /alerts
Alert[] → [{ id, symbol, type, direction, thresholdValue?, shortPeriod?, longPeriod?, maType?, recurring, active, createdAt }]

// POST /alerts  →  201 Created
Alert  → same shape as above

// PUT /alerts/{id}  →  200 OK
Alert  → updated alert object

// DELETE /alerts/{id}  →  204 No Content (empty body)

// GET /alerts/triggered
TriggeredAlert[] → [{ id, alertId, symbol, type, direction, thresholdValue?,
                      triggeredValue, candleDate, triggeredAt, alert: Alert }]

// Error (e.g. 404)
AssetError → { error: string, symbol: string }
```

### Empty body responses

`POST /favorites`, `DELETE /favorites`, and `DELETE /alerts/{id}` all return 2xx with an empty body. `api-client.ts` handles this by using `res.text()` and only calling `JSON.parse()` if the string is non-empty. Never use `res.json()` for endpoints that may return an empty body — it throws `Unexpected end of JSON input`.

- `api-client.ts` wraps `fetch` and handles: base URL (from `VITE_API_BASE_URL`), attaching the JWT `Authorization: Bearer` header on every request, 403 detection (sets `sessionExpired` in auth store), and throwing a typed `Error` on non-2xx responses.
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
  const chart = createChart(containerRef.current, { 
    // Set scaleMargins to leave space at the bottom for volume
    rightPriceScale: { scaleMargins: { top: 0.1, bottom: 0.25 } }
  })

  // 3. Add volume series (Histogram) on a separate scale
  const volumeSeries = chart.addSeries(HistogramSeries, {
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
  })
  chart.priceScale('volume').applyOptions({
    scaleMargins: { top: 0.8, bottom: 0 } // Bottom 20% of the chart
  })

  // 4. Add a candlestick series using the v5 API
  const series = chart.addSeries(CandlestickSeries, { ... })

  // 5. Add MA line series (one per active period)
  const lineSeries = chart.addSeries(LineSeries, { color, lineWidth: 2 })

  // 6. Feed data
  series.setData(candles.map(c => ({ time: c.date as `${number}-${number}-${number}`, ... })))
  volumeSeries.setData(candles.map(c => ({ 
    time: c.date as `${number}-${number}-${number}`, 
    value: c.volume,
    color: c.close >= c.open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
  })))

  // 7. Add markers for alerts and chart patterns (arrows up/down)
  createSeriesMarkers(candleSeries, markers)

  // 8. Subscribe to crosshair for tooltip (direct DOM, NOT useState — fires at ~60fps)
  chart.subscribeCrosshairMove((param) => { tooltipRef.current.innerHTML = ... })

  // 9. MANDATORY cleanup — removes the canvas and all DOM listeners
  return () => { chart.remove() }
}, [candles, theme, movingAverages, triggeredAlerts, chartPatterns])
```

**Key points:**
- `chart.remove()` in the cleanup is not optional. Without it, every re-render leaks a canvas element and event listeners.
- v5 uses `chart.addSeries(CandlestickSeries, options)` and `chart.addSeries(LineSeries, options)` — the old v4 methods (`addCandlestickSeries`, `addLineSeries`) no longer exist.
- `lightweight-charts` expects the `time` field typed as a branded string `` `${number}-${number}-${number}` `` — cast `c.date` explicitly to satisfy TypeScript strict mode.
- **Multi-scale charts:** Use `priceScaleId` to isolate series (like volume) on their own vertical axis. Use `scaleMargins` to prevent visual overlapping.
- **Markers:** Markers (alerts, patterns) must be sorted by date ascending before being passed to `createSeriesMarkers`.
- The library is ESM-only; it works with Vite out of the box, but cannot be `require()`'d in Node.js scripts.
- `ISeriesApi<'Line'>` is the correct TypeScript type for a line series reference.

### Crosshair tooltip — direct DOM manipulation

The tooltip div is a `position: absolute` overlay on top of the canvas. It is controlled directly via `tooltipRef.current.innerHTML` and `.style` inside `subscribeCrosshairMove`, **not** via `useState`. Reason: the event fires at ~60fps; `setState` would trigger a full React re-render on every frame, causing visible jank. `pointer-events: none` on the tooltip div is mandatory so it does not absorb mouse events from the chart.

### Moving average overlays

`CandlestickChart` accepts an optional `movingAverages?: MovingAverageSeries[]` prop. Each entry produces one `LineSeries` overlay. Color assignment:

- If `MovingAverageSeries.color` is set (by the parent), that color is used.
- Otherwise, the chart falls back to `MA_COLORS[index]` where index is the position in the sorted-by-period array.

**Always prefer passing `color` explicitly** from the parent (`asset-detail-page.tsx`) so that badge colors and line colors are guaranteed to match. The page uses `getColorForPeriod(period)` which maps 20→blue, 50→orange, 200→violet using the fixed `AVAILABLE_PERIODS` array — independent of which periods are currently active.

MA values are also shown in the crosshair tooltip, grouped in a section below the OHLCV data.

---

## Favorites

Favorites are managed via three REST endpoints (GET / POST / DELETE) and cached in `useFavoritesStore`.

- `useFavorites` hook (inside `features/market/hooks/`) handles the full lifecycle: initial fetch, optimistic toggle, and error recovery.
- The store's `loaded` flag prevents redundant API calls when navigating between `AssetsPage` and `FavoritesPage`.
- On logout, `resetFavorites()` must be called (done in `top-navbar.tsx`) to clear the cache so the next user gets a fresh fetch.
- The star icon in the assets table is an inline SVG that fills when the asset is favorited. Click triggers `toggleFavorite(symbol)` from the hook.

---

## Alerts

The alert system lets users configure price, volume, and moving average crossover alerts on any asset, and consult the history of triggered events.

### Types (`src/types/api.ts`)

```ts
type AlertType      = 'PRICE_THRESHOLD' | 'VOLUME_THRESHOLD' | 'MA_CROSSOVER'
type AlertDirection = 'ABOVE' | 'BELOW'
type MAType         = 'SMA' | 'EMA'

interface Alert {
  id: number; symbol: string; type: AlertType; direction: AlertDirection
  thresholdValue?: number | null; recurring: boolean; active: boolean; createdAt: string
  shortPeriod?: number; longPeriod?: number; maType?: MAType
}

interface TriggeredAlert {
  id: number; alertId: number; symbol: string; type: AlertType; direction: AlertDirection
  thresholdValue?: number | null; triggeredValue: number; candleDate: string; triggeredAt: string
  alert: Alert
}

interface CreateAlertRequest { symbol, type, direction, recurring, thresholdValue?, shortPeriod?, longPeriod?, maType? }
interface UpdateAlertRequest { type?, direction?, thresholdValue?, recurring?, active?, shortPeriod?, longPeriod?, maType? }
```

### Hook architecture

Three hooks, following the separation-of-concerns principle:

| Hook | File | Purpose |
|---|---|---|
| `useAlerts` | `hooks/use-alerts.ts` | Fetch + cache all alerts, expose `create`/`update`/`remove` |
| `useTriggeredAlerts` | `hooks/use-triggered-alerts.ts` | Fetch + cache triggered history |
| `useAssetAlerts` | `hooks/use-asset-alerts.ts` | Combines the two hooks, filters by symbol (used in asset-detail-page) |

`useAssetAlerts` does **not** make additional API calls — it filters data already in the store via `useMemo`. The filtering is O(n) on a small list, so no performance concern.

### Components

| Component | File | Responsibility |
|---|---|---|
| `AlertForm` | `components/alert-form.tsx` | Dynamic creation form: adapts fields based on type (Price/Volume vs MA Cross) |
| `AlertCard` | `components/alert-card.tsx` | Display + edit inline + delete with 3-second confirm inline |
| `TriggeredAlertCard` | `components/triggered-alert-card.tsx` | Triggered event card with temporal styling and price display |
| `TodayAlertsBanner` | `components/today-alerts-banner.tsx` | Compact banner for dashboard, only when alerts triggered today |

### Page `/alerts`

Two modes toggled by a gear icon (roue crantée) in the page header:

- **Mode historique** (default): full list of `TriggeredAlert`, newest first. Includes details from the nested `alert` object.
- **Mode gestion**: full list of configured `Alert`. Each card supports edit inline and delete with confirmation.

### MA Crossover Logic

- **Form validation:** `shortPeriod` must be `< longPeriod` and both must be positive integers.
- **Direction Labels:** For `MA_CROSSOVER`, `ABOVE` is labeled "Golden Cross" and `BELOW` is labeled "Death Cross".
- **Omission of thresholdValue:** When creating/updating `MA_CROSSOVER`, `thresholdValue` MUST be omitted from the payload (not sent as `null`) to satisfy backend constraints.

### Delete confirmation — inline timeout pattern

`AlertCard` uses a two-click pattern for deletion:
1. First click → `confirming = true`, button becomes red "Confirmer ?"
2. A `setTimeout` of 3 seconds resets `confirming = false` automatically if no second click
3. Second click within 3s → calls `onDelete(alert.id)`, timer cleared via `useRef`

The timer ref is stored in `useRef<ReturnType<typeof setTimeout>>` and cleared in `useEffect` cleanup to prevent memory leaks on unmount.

---

## Patterns (Figures Chartistes)

The pattern system detects technical analysis figures (Engulfing, Stars, Dojis, etc.) on assets.

### Types (`src/types/api.ts`)

```ts
type ChartPatternCategory = 'BULLISH' | 'BEARISH' | 'NEUTRAL'

interface ChartPatternResponse {
  id: number; assetSymbol: string; date: string;
  type: string; category: ChartPatternCategory;
}

interface ChartPatternDetail {
  id: number; symbol: string; type: string;
  lines: Array<{ start: { date, value }, end: { date, value } }>;
}
```

### Server-side Pagination & Filtering

The global patterns list (`/patterns`) uses server-side pagination and filtering to handle large datasets efficiently.

- **Filtres:** `symbol` (search), `type` (candle type), `category` (Bullish/Bearish/Neutral).
- **Pagination:** The `usePatterns` hook manages `currentPage`, `totalPages`, and `setPage`. Every filter change resets the page to 0.
- **Hook logic:** `usePatterns` re-fetches data whenever `currentPage`, `symbol`, `type`, or `category` changes.

### Visual Temporal Logic

Similar to triggered alerts, patterns use temporal styling to prioritize new information:
- **Today:** Vivid borders (Green for Bullish, Red for Bearish, Slate for Neutral) and full opacity.
- **Older:** Subtle Slate borders, `opacity-80`, and a standard date format.

### Pattern Rendering on Chart

Patterns are rendered on the `CandlestickChart` as dashed lines (`lineStyle: 2`) using `LineSeries`. 
- **Omission of Tooltip/Price:** Patterns disable `crosshairMarkerVisible` and `lastValueVisible` to avoid cluttering the main price analysis.
- **Dynamisme:** The `AssetDetailPage` allows users to toggle specific types of patterns via a dynamic "Indicateurs & Figures" menu.

---

## Search / Filtering

Both `AssetsPage` and `FavoritesPage` include a search input that filters the displayed assets by symbol in real time.

### Implementation pattern

```tsx
const [search, setSearch] = useState('')

const query = search.trim().toLowerCase()
const filteredAssets = query
  ? assets.filter((a) => a.symbol.toLowerCase().includes(query))
  : assets
```

- **Client-side only.** All assets are already loaded in memory by `useAssets()` / `useFavorites()`. A local `filter()` is instantaneous — no backend search endpoint needed.
- **Case-insensitive.** The query and symbol are both lowercased before comparison.
- **No debounce needed.** `Array.filter()` on a few hundred items is sub-millisecond. Debouncing would add complexity for no measurable benefit at this scale.
- **Search input** uses a magnifying glass SVG icon (inline, no icon library) positioned inside the input via `absolute` + `pl-10`.
- **"No results" state.** When the filter matches nothing, a centered message shows the search term in bold: `Aucun actif ne correspond à « query »`.
- **Hidden when empty.** The search input is only rendered when there are assets/favorites to filter — it disappears on the empty state.
- **State is local** (`useState` in the page component). There is no reason to persist or share the search query — it resets on navigation, which is the expected UX.

### Why not a shared search hook?

The search logic is 3 lines of code (state + trim + filter). Extracting a hook would add a file, an import, and an abstraction layer for negligible deduplication. If future pages need more complex filtering (multiple fields, fuzzy matching), a shared hook would make sense. For now, inline is simpler.

---

## Known Gotchas & Design Decisions

| Topic | Decision | Why |
|---|---|---|
| Tailwind dark mode | `@custom-variant` in CSS, not `darkMode` in config | Tailwind v4 removed the JS config for this |
| Empty body responses | `res.text()` + conditional `JSON.parse()` | `res.json()` throws on empty body |
| 403 handling | `useAuthStore.getState()` in `api-client.ts` | No React context available in a plain TS module |
| MA color consistency | Parent sets `MovingAverageSeries.color` | Decouples "which color per period" policy from the generic chart component |
| Favorites cache | `loaded` flag in store | Avoids double-fetching on navigation |
| Alerts cache | Two `loaded` flags (`alertsLoaded`, `triggeredLoaded`) | Two independent endpoints — fetching one should not block the other |
| Alert CRUD in store | Granular `addAlert`/`updateAlert`/`removeAlert` actions | Avoids re-fetching `GET /alerts` after every mutation — instant UI response |
| Alert deletion confirm | Inline timeout (3s), `useRef` for timer | No modal needed; `useRef` avoids memory leak on unmount |
| `isToday()` duplication | Duplicated in `TriggeredAlertCard` and `TodayAlertsBanner` | 6-line helper — shared utility would be premature abstraction at this scale |
| `useAssetAlerts` export | Exported from `@/features/alerts` barrel | Consumed by `market` feature — cross-feature import requires barrel |
| Alert form state | Local `useState`, not store | Ephemeral — no sharing or persistence needed across components |
| Tooltip at 60fps | Direct DOM via ref, not `useState` | Prevents React re-render storms |
| `periodsKey` in `useMovingAverages` | Serialize `periods[]` to string for `useEffect` deps | Array identity changes every render; string comparison is stable |
| Search filtering | Client-side `filter()` with local `useState` | All data already in memory; no backend search endpoint needed |
| Light mode contrast | `text-slate-400` → `text-slate-600`, `border-slate-100/200` → `border-slate-200/300` | slate-400 (~3.0:1) fails WCAG AA; slate-600 (~5.5:1) passes. Borders upgraded one step for visibility on white bg. Dark mode classes untouched. |
| Chart tooltip labelColor | `theme === 'dark' ? '#94a3b8' : '#64748b'` | Was accidentally swapped (light got lighter color). Fixed so light mode gets the darker hex for readable labels. |
| Chart hex colors (light) | grid `#e2e8f0`, border `#cbd5e1`, tooltip border `#cbd5e1`, divider `#e2e8f0` | Upgraded from slate-100/200 to slate-200/300 equivalents for visible separation on white backgrounds. |
| **Alert omission** | Omit `thresholdValue` for `MA_CROSSOVER` | Avoids database NOT NULL constraint violations when the field is irrelevant. |
| **Triggered join** | Use nested `alert` object in `TriggeredAlert` | Prevents complex client-side joins and provides accurate params at trigger time. |
| **Patterns List Pagination** | Server-side filtering + pagination | Essential for performance as the historical dataset grows. |
| **Category Icons** | BULLISH (📈) / BEARISH (📉) / NEUTRAL (➖) | Provides instant semantic recognition in lists and tooltips. |
| **Volume Opacity** | Use 40-50% opacity for `HistogramSeries` | Ensures volume bars remain in the background and don't visually clutter the price candles. |
| **Chart Margins** | 25% bottom margin on price scale | Leaves dedicated room for the volume histogram without overlap. |
