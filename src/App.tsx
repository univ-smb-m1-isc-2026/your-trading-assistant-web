/**
 * Définition des routes de l'application.
 *
 * Arborescence :
 *   /              → redirige vers /login
 *   /login         → LoginPage (publique)
 *   /register      → RegisterPage (publique)
 *   /dashboard     → DashboardPage (protégée — nécessite un JWT)
 *
 * Pourquoi <Routes> + <Route> et non une config objet (useRoutes) ?
 *   → La syntaxe JSX est plus lisible pour un projet de cette taille.
 *   useRoutes() est préférable quand les routes sont chargées dynamiquement
 *   ou générées depuis une source externe (CMS, permissions API, etc.).
 *
 * Pourquoi <Navigate replace> sur "/" ?
 *   → L'application n'a pas de page d'accueil distincte pour l'instant.
 *   On choisit de rediriger vers /login plutôt que de dupliquer du contenu.
 *   `replace` évite d'empiler "/" dans l'historique du navigateur.
 */

import { Navigate, Route, Routes } from 'react-router-dom'
import { LoginPage } from '@/pages/login-page'
import { RegisterPage } from '@/pages/register-page'
import { DashboardPage } from '@/pages/dashboard-page'
import { ProtectedRoute } from '@/components/protected-route'

export function App() {
  return (
    <Routes>
      {/* Racine : redirige immédiatement vers /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Routes publiques */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Routes protégées : ProtectedRoute vérifie le JWT avant de rendre <Outlet /> */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      {/* Fallback : toute URL inconnue → /login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
