/**
 * Modal "Session expirée" — s'affiche quand l'API renvoie un 403.
 *
 * Déclenchement :
 *   api-client.ts détecte le 403 et appelle
 *   useAuthStore.getState().setSessionExpired(true).
 *   Ce composant lit sessionExpired depuis le store et s'affiche si true.
 *
 * Deux actions possibles :
 *   - "Se déconnecter" → reset du store favoris + logout auth → ProtectedRoute
 *     redirige automatiquement vers /login (token devient null).
 *   - "Ignorer" → setSessionExpired(false), ferme la modal, l'utilisateur
 *     reste sur la page (son choix, même si le token reste invalide).
 *
 * Pourquoi ne pas utiliser useNavigate() pour la redirection ?
 *   → Appeler logout() suffit : token passe à null dans le store, ProtectedRoute
 *   le détecte au prochain render et navigue vers /login automatiquement.
 *   La modal n'a pas besoin de connaître la logique de routage.
 *
 * Accessibilité :
 *   - role="dialog" + aria-modal="true" + aria-labelledby
 *   - Focus piégé implicitement par le z-index (overlay bloque les clics)
 *   - Pas de fermeture au clic sur l'overlay pour éviter les fermetures accidentelles
 */

import { useAuthStore } from '@/stores/use-auth-store'
import { useFavoritesStore } from '@/stores/use-favorites-store'

export function SessionExpiredModal() {
  const sessionExpired = useAuthStore((s) => s.sessionExpired)
  const setSessionExpired = useAuthStore((s) => s.setSessionExpired)
  const logout = useAuthStore((s) => s.logout)
  const resetFavorites = useFavoritesStore((s) => s.reset)

  // Rendu conditionnel : rien si la session n'est pas expirée
  if (!sessionExpired) return null

  function handleLogout() {
    // Même ordre que dans TopNavbar pour garantir la cohérence
    resetFavorites()
    logout()
    // Pas besoin de navigate() : ProtectedRoute redirige quand token === null
  }

  function handleDismiss() {
    setSessionExpired(false)
  }

  return (
    /* Overlay fixe — couvre tout l'écran au-dessus du layout */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-slate-300 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        {/* Icône d'avertissement */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-amber-600 dark:text-amber-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M12 8v4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="16" r="0.5" fill="currentColor" />
          </svg>
        </div>

        {/* Titre */}
        <h2
          id="session-expired-title"
          className="mb-2 text-lg font-bold text-slate-900 dark:text-white"
        >
          Session expirée
        </h2>

        {/* Message */}
        <p className="mb-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Votre session n'est plus valide. Veuillez vous reconnecter pour continuer à utiliser l'application.
        </p>

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={handleDismiss}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Ignorer
          </button>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
