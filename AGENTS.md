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

**Your Trading Assistant** is a React-based web frontend for a trading assistant application. It provides users with market data visualization, portfolio tracking, and AI-assisted trading insights. The frontend communicates with a REST API backend and aims to be fast, accessible, and maintainable.

---

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| React | 18+ | UI library |
| Vite | 5+ | Build tool & dev server |
| TypeScript | 5+ | Type safety across the codebase |
| Tailwind CSS | 3+ | Utility-first styling |
| Zustand | 4+ | Global client-side state management |
| Vitest | 1+ | Unit & integration test runner |
| React Testing Library | 14+ | Component testing utilities |
| clsx + tailwind-merge | latest | Conditional class name composition |

> **Why Vite?** Vite uses native ES modules in development, giving near-instant hot module replacement (HMR). This is dramatically faster than Webpack-based setups for large React apps.

---

## Project Structure

```
src/
├── assets/          # Static files: images, fonts, SVGs
├── components/      # Shared, reusable UI components
│   └── ui/          # Low-level primitives (Button, Card, Input...)
├── features/        # Feature-based modules (see below)
│   ├── market/      # Market data, charts, tickers
│   ├── portfolio/   # Portfolio overview and positions
│   └── assistant/   # AI assistant chat interface
├── hooks/           # Shared custom React hooks
├── pages/           # Route-level page components
├── services/        # All HTTP API calls (REST layer)
├── stores/          # Zustand store definitions
├── types/           # Global TypeScript types and interfaces
└── utils/           # Pure utility functions (formatting, math...)
```

> **Why feature-based structure?** Co-locating everything related to a feature (components, hooks, types) inside its own folder makes it easy to find, modify, and eventually delete code. It scales better than organizing by technical role alone (e.g., a flat `components/` folder that grows to 100+ files).

---

## Coding Conventions

### TypeScript
- **Strict mode is mandatory.** `tsconfig.json` must include `"strict": true`.
- Always type component props with a named `interface`, not `type` aliases or inline objects.
- Never use `any`. Use `unknown` and narrow types explicitly when needed.
- API response shapes must be typed in `src/types/` and reused across services and components.

### Naming
- **Components:** PascalCase (`MarketChart`, `PortfolioSummary`)
- **Files:** kebab-case matching the default export (`market-chart.tsx`, `portfolio-summary.tsx`)
- **Hooks:** camelCase prefixed with `use` (`useMarketData`, `usePortfolioStore`)
- **Stores:** camelCase prefixed with `use` (`useMarketStore`, `useAssistantStore`)
- **Services:** camelCase, noun-based (`marketService`, `portfolioService`)

### Imports
- Use the `@/` alias for all internal imports to avoid brittle relative paths like `../../../`.
- Example: `import { Button } from '@/components/ui/button'`
- Configure the alias in both `vite.config.ts` and `tsconfig.json`.

### Exports
- Prefer named exports over default exports for components, hooks, and utilities.
- Use `index.ts` barrel files at the feature level to expose a clean public API for each feature.

---

## Component Architecture

- **Functional components only.** Class components are forbidden.
- **Separate logic from presentation.** Extract business logic and side effects into custom hooks. A component file should primarily contain JSX.
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
├── use-market-store.ts      # Live prices, selected symbols, market status
├── use-portfolio-store.ts   # User positions, P&L, account balance
└── use-assistant-store.ts   # Chat history, loading state for AI responses
```

**Rules:**
- Never put derived data in a store. Compute it inside the component or hook using selectors.
- Use slice-based selectors to avoid unnecessary re-renders: `const price = useMarketStore(s => s.price)`.
- Actions (functions that mutate state) must be defined inside the store, not in components.

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

All HTTP communication is centralized in `src/services/`. Components and stores must **never** call `fetch` or `axios` directly.

```
services/
├── api-client.ts        # Base HTTP client, base URL, auth headers, error handling
├── market-service.ts    # GET /market/prices, GET /market/history, etc.
└── portfolio-service.ts # GET /portfolio, POST /portfolio/trade, etc.
```

- The `api-client.ts` module wraps `fetch` and handles: base URL configuration, attaching auth tokens, and throwing typed errors on non-2xx responses.
- All service functions must return typed data. Define response interfaces in `src/types/api.ts`.
- Handle loading and error states explicitly; never silently swallow errors.

---

## Testing (Vitest + React Testing Library)

- Test files are co-located with the source file they test: `market-ticker.test.tsx` lives next to `market-ticker.tsx`.
- **Test behavior, not implementation.** Query elements by accessible role or label text, not by CSS class or component internals.
- Mock all service calls in tests. Never make real HTTP requests in unit or integration tests.
- Run the test suite with `npm run test` before considering any feature complete.

```tsx
// Good: tests what the user sees
expect(screen.getByRole('heading', { name: /portfolio/i })).toBeInTheDocument()

// Bad: tests implementation details
expect(wrapper.find('.portfolio-title')).toHaveLength(1)
```

- Aim for high coverage on `services/` and `stores/` (pure logic), and behavioral coverage on key user flows in `features/`.
