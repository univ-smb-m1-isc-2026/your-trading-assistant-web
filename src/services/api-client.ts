/**
 * Client HTTP de base.
 *
 * Toutes les fonctions de service passent par ici — jamais de `fetch` directement
 * dans un composant ou un store. Cela centralise :
 *   - la base URL (lue depuis la variable d'environnement VITE_API_BASE_URL)
 *   - la gestion des erreurs HTTP (statuts non-2xx)
 *   - l'injection automatique du header Authorization (JWT Bearer)
 *
 * Pourquoi lire le token depuis localStorage ici plutôt que depuis le store Zustand ?
 *   → api-client.ts est un module pur (pas de React). Importer useAuthStore()
 *   créerait un couplage fort entre la couche réseau et la couche UI.
 *   localStorage est la source de vérité du token : le store Zustand s'initialise
 *   lui-même depuis localStorage, donc les deux sont toujours en sync.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL
const TOKEN_KEY = 'auth_token'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  // Récupère le token JWT depuis localStorage (null si non connecté)
  const token = localStorage.getItem(TOKEN_KEY)

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Injecte le header Authorization uniquement si un token existe
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} — ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

export const apiClient = { request }
