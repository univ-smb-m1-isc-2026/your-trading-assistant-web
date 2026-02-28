/**
 * Top Navbar — barre de navigation supérieure.
 *
 * Contenu :
 *   - Logo / nom de l'app à gauche
 *   - Toggle thème (soleil/lune) à droite
 *   - Bouton de déconnexion à droite
 *
 * Pourquoi le toggle thème est-il dans la navbar et pas la sidebar ?
 *   → La navbar est toujours visible, même sur mobile (la sidebar peut
 *   être cachée). Le thème est une action globale fréquente — elle mérite
 *   d'être toujours accessible en un clic.
 *
 * Les icônes sont rendues en SVG inline plutôt qu'avec une lib d'icônes
 * pour éviter une dépendance supplémentaire (lucide-react = ~200 kB).
 */

import { Link, useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/stores/use-theme-store'
import { useAuthStore } from '@/stores/use-auth-store'
import { useFavoritesStore } from '@/stores/use-favorites-store'

export function TopNavbar() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const logout = useAuthStore((s) => s.logout)
  const resetFavorites = useFavoritesStore((s) => s.reset)
  const navigate = useNavigate()

  function handleLogout() {
    // Réinitialise le store des favoris avant de déconnecter l'utilisateur.
    // Sans ce reset, les favoris du premier utilisateur resteraient en mémoire
    // et seraient visibles par le prochain utilisateur qui se connecte sur
    // la même session de navigateur sans rechargement de page.
    resetFavorites()
    logout()
    navigate('/login')
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-300 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      {/* Logo — lien vers la landing page */}
      <Link to="/" className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 16l4-8 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
          Your Trading Assistant
        </span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Toggle thème */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
        >
          {theme === 'dark' ? (
            /* Soleil — affiché quand le thème est sombre (pour passer en clair) */
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            /* Lune — affiché quand le thème est clair (pour passer en sombre) */
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

        {/* Déconnexion */}
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400"
          title="Se déconnecter"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="16,17 21,12 16,7" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </header>
  )
}
