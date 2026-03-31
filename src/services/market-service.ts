/**
 * Service pour les données de marché.
 *
 * Toutes les fonctions utilisent apiClient.request() — jamais de fetch direct.
 * Les types de réponse sont définis dans src/types/api.ts et réutilisés ici
 * pour garantir la cohérence entre la couche service et la couche UI.
 */

import { apiClient } from './api-client'
import type { 
  Asset, 
  Candle, 
  MovingAverageSeries, 
  ChartPatternResponse, 
  Page, 
  ChartPatternDetail,
  PatternStats,
  SentimentPollResponse,
  SentimentUserResponse,
  SentimentType
} from '@/types/api'

/**
 * Récupère la liste de tous les assets disponibles.
 * GET /assets — nécessite un JWT valide (injecté automatiquement par api-client).
 */
export async function getAssets(): Promise<Asset[]> {
  return apiClient.request<Asset[]>('/assets')
}

/**
 * Récupère les bougies OHLCV d'un asset donné.
 * GET /assets/{symbol}/candles — nécessite un JWT valide.
 *
 * @param symbol - Le ticker de l'asset (ex: "BTC", "ETH")
 * @throws Error HTTP 404 si le symbol est inconnu
 */
export async function getCandles(symbol: string): Promise<Candle[]> {
  return apiClient.request<Candle[]>(`/assets/${symbol}/candles`)
}

// --- Favoris ---

/**
 * Récupère la liste des assets favoris de l'utilisateur connecté.
 * GET /assets/favorites — nécessite un JWT valide.
 */
export async function getFavorites(): Promise<Asset[]> {
  return apiClient.request<Asset[]>('/assets/favorites')
}

/**
 * Ajoute un asset aux favoris de l'utilisateur connecté.
 * POST /assets/{symbol}/favorite — nécessite un JWT valide.
 *
 * @param symbol - Le ticker de l'asset à ajouter (ex: "BTC")
 */
export async function addFavorite(symbol: string): Promise<void> {
  await apiClient.request<void>(`/assets/${symbol}/favorite`, { method: 'POST' })
}

/**
 * Retire un asset des favoris de l'utilisateur connecté.
 * DELETE /assets/{symbol}/favorite — nécessite un JWT valide.
 *
 * @param symbol - Le ticker de l'asset à retirer (ex: "BTC")
 */
export async function removeFavorite(symbol: string): Promise<void> {
  await apiClient.request<void>(`/assets/${symbol}/favorite`, { method: 'DELETE' })
}

// --- Moyennes Mobiles ---

/**
 * Récupère les moyennes mobiles d'un asset donné.
 * GET /assets/{symbol}/moving-averages?type={type}&periods={periods}
 *
 * @param symbol  - Le ticker de l'asset (ex: "BTC")
 * @param type    - "SMA" ou "EMA"
 * @param periods - Tableau de périodes (ex: [20, 50])
 * @throws Error HTTP 400 si type ou periods invalide
 * @throws Error HTTP 404 si le symbol est inconnu
 */
export async function getMovingAverages(
  symbol: string,
  type: 'SMA' | 'EMA',
  periods: number[],
): Promise<MovingAverageSeries[]> {
  const params = new URLSearchParams({
    type,
    periods: periods.join(','),
  })
  return apiClient.request<MovingAverageSeries[]>(
    `/assets/${symbol}/moving-averages?${params.toString()}`,
  )
}

// --- Figures Chartistes ---

/**
 * Récupère les figures chartistes détaillées d'un asset donné.
 * GET /assets/{symbol}/patterns — nécessite un JWT valide.
 *
 * @param symbol - Le ticker de l'asset (ex: "BTC")
 */
export async function getChartPatterns(symbol: string): Promise<ChartPatternDetail[]> {
  return apiClient.request<ChartPatternDetail[]>(`/assets/${symbol}/patterns`)
}

/**
 * Récupère toutes les figures chartistes détectées avec pagination et filtres.
 * GET /patterns?page={page}&size={size}&symbol={symbol}&type={type}&category={category}
 */
export async function getPatterns(
  page: number = 0,
  size: number = 20,
  symbol?: string,
  type?: string,
  category?: string
): Promise<Page<ChartPatternResponse>> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  })
  if (symbol) params.append('symbol', symbol)
  if (type) params.append('type', type)
  if (category) params.append('category', category)

  return apiClient.request<Page<ChartPatternResponse>>(`/patterns?${params.toString()}`)
}

/**
 * Récupère les statistiques globales des types de figures.
 * GET /patterns/stats?symbol={symbol}&category={category}
 */
export async function getPatternStats(
  symbol?: string,
  category?: string
): Promise<PatternStats> {
  const params = new URLSearchParams()
  if (symbol) params.append('symbol', symbol)
  if (category) params.append('category', category)

  return apiClient.request<PatternStats>(`/patterns/stats?${params.toString()}`)
}

// --- Sentiment Communautaire ---

/**
 * Récupère le résultat du sondage public pour un actif spécifique.
 * GET /assets/{symbol}/sentiments/poll
 */
export async function getSentimentPoll(symbol: string): Promise<SentimentPollResponse> {
  return apiClient.request<SentimentPollResponse>(`/assets/${symbol}/sentiments/poll`)
}

/**
 * Récupère le vote actuel de l'utilisateur connecté pour cet actif.
 * GET /assets/{symbol}/sentiments/me
 * Renvoie null si l'utilisateur n'a pas encore voté (HTTP 204).
 */
export async function getUserSentiment(symbol: string): Promise<SentimentUserResponse | null> {
  try {
    return await apiClient.request<SentimentUserResponse>(`/assets/${symbol}/sentiments/me`)
  } catch (error) {
    // Si l'api client ne gère pas le 204 proprement ou renvoie une erreur vide
    // on gère ça ici, bien que l'API renvoie HTTP 204 No Content
    return null
  }
}

/**
 * Soumet ou modifie le vote de l'utilisateur.
 * PUT /assets/{symbol}/sentiments/me
 */
export async function putUserSentiment(symbol: string, type: SentimentType): Promise<SentimentUserResponse> {
  return apiClient.request<SentimentUserResponse>(`/assets/${symbol}/sentiments/me`, {
    method: 'PUT',
    body: JSON.stringify({ type })
  })
}
