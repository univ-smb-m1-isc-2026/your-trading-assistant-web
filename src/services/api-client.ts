/**
 * Client HTTP de base.
 *
 * Toutes les fonctions de service passent par ici — jamais de `fetch` directement
 * dans un composant ou un store. Cela centralise :
 *   - la base URL (lue depuis la variable d'environnement VITE_API_BASE_URL)
 *   - la gestion des erreurs HTTP (statuts non-2xx)
 *   - l'injection automatique du header Authorization (JWT Bearer)
 *   - la détection des 403 pour déclencher la popup "Session expirée"
 *
 * Pourquoi lire le token depuis localStorage ici plutôt que depuis le store Zustand ?
 *   → api-client.ts est un module pur (pas de React). Importer useAuthStore()
 *   créerait un couplage fort entre la couche réseau et la couche UI.
 *   localStorage est la source de vérité du token : le store Zustand s'initialise
 *   lui-même depuis localStorage, donc les deux sont toujours en sync.
 *
 * Exception à ce principe — le signal 403 :
 *   → Sur un 403, on appelle useAuthStore.getState().setSessionExpired(true).
 *   On utilise getState() (pas un hook React) ce qui est l'API Zustand prévue
 *   pour les appels hors contexte React. Pas de dépendance circulaire :
 *   use-auth-store.ts n'importe rien de api-client.ts.
 */

import { useAuthStore } from '@/stores/use-auth-store'

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const TOKEN_KEY = 'auth_token'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Récupère le token JWT depuis localStorage (null si non connecté)
  const rawToken = localStorage.getItem(TOKEN_KEY)
  const token = (rawToken === 'null' || rawToken === 'undefined') ? null : rawToken

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Injecte le header Authorization uniquement si un token existe
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  if (res.status === 403) {
    // Signal vers l'UI : déclenche la popup "Session expirée".
    // getState() est l'API Zustand pour les appels hors composant React.
    useAuthStore.getState().setSessionExpired(true)
    throw new Error('HTTP 403 — Forbidden')
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${res.statusText}`)
  }

  // Lit le body comme texte d'abord — certains endpoints (POST/DELETE)
  // renvoient un 200 avec un body vide. Appeler res.json() directement
  // sur un body vide lève "Unexpected end of JSON input".
  const text = await res.text()
  if (!text) return undefined as T
  return JSON.parse(text) as T
}

export const apiClient = { request }
