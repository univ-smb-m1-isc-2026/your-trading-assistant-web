/**
 * Service pour les données de marché.
 *
 * Toutes les fonctions utilisent apiClient.request() — jamais de fetch direct.
 * Les types de réponse sont définis dans src/types/api.ts et réutilisés ici
 * pour garantir la cohérence entre la couche service et la couche UI.
 */

import { apiClient } from './api-client'
import type { Asset, Candle, MovingAverageSeries } from '@/types/api'

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
