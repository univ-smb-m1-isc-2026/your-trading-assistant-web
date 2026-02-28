/**
 * Composant de garde de route.
 *
 * Pourquoi ce composant existe-t-il ?
 *   React Router v6 n'a pas de notion native de "route privée".
 *   On crée un wrapper qui vérifie le token avant de rendre les enfants.
 *   Si le token est absent, on redirige vers /login via <Navigate>.
 *
 * Utilisation dans App.tsx :
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardPage />} />
 *   </Route>
 *
 * Le prop `replace` sur <Navigate> remplace l'entrée dans l'historique
 * du navigateur (au lieu d'ajouter une nouvelle entrée), ce qui évite
 * que l'utilisateur revienne sur la page protégée en cliquant "Retour".
 */

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/use-auth-store'

export function ProtectedRoute() {
  const token = useAuthStore((s) => s.token)

  if (!token) {
    return <Navigate to="/login" replace />
  }

  // <Outlet /> rend la route enfant correspondante (ex: DashboardPage)
  return <Outlet />
}
