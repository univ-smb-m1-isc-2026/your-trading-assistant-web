/**
 * Définition des routes de l'application.
 *
 * Arborescence :
 *   /                    → LandingPage (publique — présentation de l'app)
 *   /login               → LoginPage (publique)
 *   /register            → RegisterPage (publique)
 *   /dashboard           → AssetsPage (protégée — dans AppLayout)
 *   /favorites           → FavoritesPage (protégée — dans AppLayout)
 *   /assets/:symbol      → AssetDetailPage (protégée — dans AppLayout)
 *   *                    → redirige vers /
 *
 * Architecture des routes protégées :
 *   Les routes protégées sont imbriquées dans deux layers :
 *   1. ProtectedRoute — vérifie le JWT, redirige vers /login si absent
 *   2. AppLayout — fournit le layout (sidebar + topbar + Outlet)
 *
 *   L'imbrication est :
 *     <Route element={<ProtectedRoute />}>     ← garde d'accès
 *       <Route element={<AppLayout />}>         ← layout visuel
 *         <Route path="/dashboard" ... />        ← contenu dans <main>
 *       </Route>
 *     </Route>
 *
 *   Pourquoi séparer ProtectedRoute et AppLayout ?
 *   → ProtectedRoute = sécurité. AppLayout = UI. L'un pourrait exister
 *   sans l'autre (ex: une page protégée sans sidebar, ou un layout
 *   pour des pages publiques). Cette séparation respecte le Single
 *   Responsibility Principle.
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage, RegisterPage } from '@/features/auth'
import { LandingPage } from '@/features/landing'
import { AssetsPage, AssetDetailPage, FavoritesPage } from '@/features/market'
import { AlertsPage } from '@/features/alerts'
import { PatternsPage } from '@/features/patterns'
import { ProfilePage } from '@/features/profile'
import { SignalsPage, BacktestPage } from '@/features/predictions'
import { ProtectedRoute } from '@/components/protected-route'
import { AppLayout } from '@/components/layout/app-layout'

export function App() {
  return (
    <Routes>
      {/* Racine : landing page publique */}
      <Route path="/" element={<LandingPage />} />

      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Routes protégées avec layout (sidebar + topbar) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<AssetsPage />} />
          <Route path="/assets/:symbol" element={<AssetDetailPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/patterns" element={<PatternsPage />} />
          <Route path="/signals" element={<SignalsPage />} />
          <Route path="/backtest" element={<BacktestPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Fallback : toute URL inconnue → landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
