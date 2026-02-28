/**
 * AppLayout — Layout principal pour les pages protégées.
 *
 * Structure :
 *   ┌──────────────────────────────────────────┐
 *   │               TOP NAVBAR                 │
 *   ├──────┬───────────────────────────────────┤
 *   │ SIDE │                                   │
 *   │ BAR  │         <Outlet />                │
 *   │      │   (contenu de la page active)     │
 *   │      │                                   │
 *   └──────┴───────────────────────────────────┘
 *
 * Pourquoi <Outlet /> plutôt que {children} ?
 *   → AppLayout est utilisé comme layout de route dans React Router
 *   (via <Route element={<AppLayout />}>). React Router v6+ injecte
 *   automatiquement la route enfant correspondante via <Outlet />.
 *   On n'a pas besoin de passer children manuellement.
 *
 * Pourquoi l'auth check est dans ProtectedRoute et pas ici ?
 *   → Séparation des responsabilités. AppLayout = mise en page.
 *   ProtectedRoute = garde d'accès. L'un pourrait exister sans l'autre.
 */

import { Outlet } from 'react-router-dom'
import { TopNavbar } from '@/components/layout/top-navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { SessionExpiredModal } from '@/components/ui/session-expired-modal'

export function AppLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
      {/* Monté ici pour couvrir toutes les pages protégées.
          Se rend null si sessionExpired === false — coût de rendu nul. */}
      <SessionExpiredModal />
    </div>
  )
}
