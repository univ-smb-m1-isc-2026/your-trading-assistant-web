import { apiClient } from './api-client'
import type { PredictionHealth, PredictionResponse, PredictionStats } from '@/types/api'

export const predictionService = {
  /**
   * Vérifier l'état de l'API d'Intelligence Artificielle
   */
  async checkHealth(): Promise<PredictionHealth> {
    return apiClient.request<PredictionHealth>('/predictions/health')
  },

  /**
   * Récupérer le Top des Prédictions du jour
   * @param limit Nombre maximum d'éléments à retourner (Défaut : 10)
   * @param date La date cible (YYYY-MM-DD). Si non fourni, utilise la date du jour du serveur.
   */
  async getTopPredictions(limit: number = 10, date?: string): Promise<PredictionResponse[]> {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    if (date) {
      params.append('date', date)
    }
    return apiClient.request<PredictionResponse[]>(`/predictions/top?${params.toString()}`)
  },

  /**
   * Récupérer l'historique des prédictions pour un actif
   * @param symbol Le ticker de l'actif (ex: BTC)
   */
  /**
   * Récupérer les statistiques globales sur toutes les prédictions
   */
  async getPredictionStats(): Promise<PredictionStats> {
    return apiClient.request<PredictionStats>('/predictions/stats')
  },

  async getAssetPredictions(symbol: string): Promise<PredictionResponse[]> {
    return apiClient.request<PredictionResponse[]>(`/predictions/${symbol}`)
  }
}
