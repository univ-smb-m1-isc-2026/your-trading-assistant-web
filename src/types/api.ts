/**
 * Types des réponses REST de l'API backend.
 * Ajouter ici chaque nouvelle forme de réponse au fur et à mesure.
 */

export interface HelloResponse {
  message: string
}

// --- Auth ---

/**
 * Réponse renvoyée par /auth/login et /auth/register.
 * Le backend retourne uniquement le JWT ; les données utilisateur
 * sont encodées dans le token lui-même (claims).
 */
export interface AuthResponse {
  token: string
}

/** Corps de la requête POST /auth/login */
export interface LoginRequest {
  email: string
  password: string
}

/** Corps de la requête POST /auth/register */
export interface RegisterRequest {
  username: string
  email: string
  password: string
}
