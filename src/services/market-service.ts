/**
 * Service pour les données de marché.
 *
 * Toutes les fonctions utilisent apiClient.request() — jamais de fetch direct.
 * Les types de réponse sont définis dans src/types/api.ts et réutilisés ici
 * pour garantir la cohérence entre la couche service et la couche UI.
 */

import { apiClient } from './api-client'
import type { Asset, Candle } from '@/types/api'

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
