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

// --- Moyennes Mobiles ---

/**
 * Un point de donnée d'une moyenne mobile.
 * date est au format ISO 8601 (YYYY-MM-DD).
 * value est la valeur calculée de la moyenne mobile à cette date.
 */
export interface MovingAveragePoint {
  date: string
  value: number
}

/**
 * Une série de moyenne mobile retournée par
 * GET /assets/{symbol}/moving-averages?type=SMA&periods=20,50
 *
 * Chaque objet représente une MA d'un type et d'une période donnés.
 * Le tableau values peut être vide ou plus court que les candles si
 * l'asset n'a pas assez d'historique pour calculer la MA.
 *
 * color est optionnel : si fourni, le composant chart l'utilise
 * directement au lieu d'attribuer une couleur par rang.
 * Cela permet au parent de contrôler la cohérence couleur entre
 * les badges et les lignes du chart (inversion of control).
 */
export interface MovingAverageSeries {
  type: 'SMA' | 'EMA'
  period: number
  values: MovingAveragePoint[]
  /** Couleur hex optionnelle pour la ligne sur le chart. */
  color?: string
}
