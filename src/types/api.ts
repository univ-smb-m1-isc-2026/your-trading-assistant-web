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

// --- Alertes ---

/**
 * Types d'alerte supportés par le backend.
 * PRICE_THRESHOLD = seuil de prix (ex: BTC dépasse 100 000 $)
 * VOLUME_THRESHOLD = seuil de volume (ex: volume ETH dépasse 1M)
 * MA_CROSSOVER = croisement de moyennes mobiles (ex: SMA(8) croise SMA(50))
 */
export type AlertType = 'PRICE_THRESHOLD' | 'VOLUME_THRESHOLD' | 'MA_CROSSOVER'

/**
 * Type de moyenne mobile pour les alertes de croisement.
 */
export type MAType = 'SMA' | 'EMA'

/**
 * Direction du déclenchement.
 * ABOVE = se déclenche quand la valeur dépasse le seuil (hausse)
 *         OU quand la courte croise au-dessus de la longue (Golden Cross)
 * BELOW = se déclenche quand la valeur passe sous le seuil (baisse)
 *         OU quand la courte croise en-dessous de la longue (Death Cross)
 */
export type AlertDirection = 'ABOVE' | 'BELOW'

/**
 * Une alerte configurée par l'utilisateur.
 * Retournée par GET /alerts et POST /alerts.
 *
 * recurring: true → l'alerte reste active après déclenchement (se répète)
 * recurring: false → one-shot, désactivée automatiquement après le 1er déclenchement
 * active: true → l'alerte est surveillée par le backend
 * active: false → l'alerte est en pause (one-shot déjà déclenchée, ou désactivée manuellement)
 *
 * Les champs shortPeriod, longPeriod et maType ne sont renseignés que pour type === 'MA_CROSSOVER'.
 * Le champ thresholdValue est null pour type === 'MA_CROSSOVER'.
 */
export interface Alert {
  id: number
  symbol: string
  type: AlertType
  direction: AlertDirection
  thresholdValue?: number | null
  shortPeriod?: number
  longPeriod?: number
  maType?: MAType
  recurring: boolean
  active: boolean
  createdAt: string
}

/**
 * Un déclenchement d'alerte (historique).
 * Retourné par GET /alerts/triggered.
 *
 * triggeredValue = valeur réelle au moment du déclenchement
 * candleDate = date de la bougie qui a déclenché l'alerte
 * triggeredAt = horodatage exact du déclenchement (ISO 8601)
 */
export interface TriggeredAlert {
  id: number
  alertId: number
  symbol: string
  type: AlertType
  direction: AlertDirection
  thresholdValue?: number | null
  triggeredValue: number
  candleDate: string
  triggeredAt: string
  /** Détails de l'alerte au moment du déclenchement (ou actuels selon le backend) */
  alert: Alert
}

/**
 * Corps de la requête POST /alerts.
 * thresholdValue requis pour PRICE/VOLUME.
 * shortPeriod, longPeriod, maType requis pour MA_CROSSOVER.
 */
export interface CreateAlertRequest {
  symbol: string
  type: AlertType
  direction: AlertDirection
  thresholdValue?: number | null
  shortPeriod?: number
  longPeriod?: number
  maType?: MAType
  recurring: boolean
}

/**
 * Corps de la requête PUT /alerts/{id}.
 * Mise à jour partielle : seuls les champs présents sont modifiés.
 */
export interface UpdateAlertRequest {
  type?: AlertType
  direction?: AlertDirection
  thresholdValue?: number | null
  shortPeriod?: number
  longPeriod?: number
  maType?: MAType
  recurring?: boolean
  active?: boolean
}

// --- Figures Chartistes ---

export interface ChartPattern {
  id: number
  assetSymbol: string
  type: string
  category: 'BULLISH' | 'BEARISH' | string
  date: string
}
