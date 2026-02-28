/**
 * Store Zustand pour l'authentification.
 *
 * Pourquoi Zustand plutôt qu'un simple useState ?
 *   → Le token doit être accessible depuis DEUX endroits distincts :
 *     1. Les composants (pour afficher/masquer du contenu selon l'état auth)
 *     2. api-client.ts (pour injecter le header Authorization sur chaque requête)
 *   Un useState local ne peut pas traverser ces deux contextes sans prop drilling
 *   ou imports circulaires. Zustand résout ça proprement via un store singleton.
 *
 * Pourquoi localStorage ?
 *   → Sans persistance, l'utilisateur est déconnecté à chaque rechargement de page.
 *   localStorage est le stockage standard pour les JWT dans les SPA de test/dev.
 *   En production, on préférerait un cookie HttpOnly (inaccessible au JS, immunisé XSS).
 */

import { create } from 'zustand'

const TOKEN_KEY = 'auth_token'

interface AuthState {
  /** Le JWT, ou null si l'utilisateur n'est pas connecté. */
  token: string | null

  /**
   * Persiste le token en mémoire (Zustand) ET dans localStorage.
   * Appelé après un login ou register réussi.
   */
  setToken: (token: string) => void

  /**
   * Efface le token partout. Appelé lors du logout.
   */
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialisation : on relit localStorage pour restaurer la session
  // si l'utilisateur avait déjà un token valide.
  token: localStorage.getItem(TOKEN_KEY),

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ token })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null })
  },
}))
