/**
 * Client HTTP de base.
 *
 * Toutes les fonctions de service passent par ici — jamais de `fetch` directement
 * dans un composant ou un store. Cela centralise :
 *   - la base URL (lue depuis la variable d'environnement VITE_API_BASE_URL)
 *   - la gestion des erreurs HTTP (statuts non-2xx)
 *   - les headers communs (ex: Authorization à ajouter plus tard)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
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
