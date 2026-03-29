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

import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { TopNavbar } from '@/components/layout/top-navbar'
import { Sidebar } from '@/components/layout/sidebar'
import { SessionExpiredModal } from '@/components/ui/session-expired-modal'
import { WebhookBanner, useProfile } from '@/features/profile'

export function AppLayout() {
  const { loadProfile } = useProfile()

  // Chargement du profil au montage du layout (donc à la connexion)
  useEffect(() => {
    void loadProfile()
  }, [loadProfile])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <WebhookBanner />
          <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
            <Outlet />
          </main>
        </div>
      </div>
      {/* Monté ici pour couvrir toutes les pages protégées.
          Se rend null si sessionExpired === false — coût de rendu nul. */}
      <SessionExpiredModal />
    </div>
  )
}
