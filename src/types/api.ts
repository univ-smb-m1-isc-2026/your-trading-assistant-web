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

// --- Market ---

/**
 * Un asset retourné par GET /assets.
 * lastPrice et lastDate sont null si aucune donnée de prix n'est disponible.
 */
export interface Asset {
  symbol: string
  lastPrice: number | null
  lastDate: string | null
}

/**
 * Une bougie OHLCV retournée par GET /assets/{symbol}/candles.
 * date est au format ISO 8601 (YYYY-MM-DD).
 */
export interface Candle {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

/**
 * Réponse d'erreur retournée par l'API (ex: 404 sur /assets/{symbol}).
 */
export interface AssetError {
  error: string
  symbol: string
}
