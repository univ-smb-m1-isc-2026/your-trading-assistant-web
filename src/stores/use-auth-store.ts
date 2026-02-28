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
   * true quand l'API a renvoyé un 403 — déclenche l'affichage de la modal
   * "Session expirée". Remis à false au logout ou si l'utilisateur ignore.
   *
   * Pourquoi dans ce store plutôt qu'un store dédié ?
   *   → Un 403 est un problème d'authentification (token invalide ou expiré).
   *   Il appartient sémantiquement au domaine auth. Pas besoin d'un store
   *   supplémentaire pour un seul boolean.
   */
  sessionExpired: boolean

  /**
   * Persiste le token en mémoire (Zustand) ET dans localStorage.
   * Appelé après un login ou register réussi.
   */
  setToken: (token: string) => void

  /**
   * Positionne le flag sessionExpired.
   * Appelé par api-client.ts via getState() lorsqu'un 403 est reçu.
   */
  setSessionExpired: (value: boolean) => void

  /**
   * Efface le token partout. Appelé lors du logout.
   * Remet également sessionExpired à false pour nettoyer l'état.
   */
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialisation : on relit localStorage pour restaurer la session
  // si l'utilisateur avait déjà un token valide.
  token: localStorage.getItem(TOKEN_KEY),
  sessionExpired: false,

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
    set({ token })
  },

  setSessionExpired: (value) => set({ sessionExpired: value }),

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ token: null, sessionExpired: false })
  },
}))
