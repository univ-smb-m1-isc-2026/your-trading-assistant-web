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
