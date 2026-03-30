import { apiClient } from './api-client'
import type { PredictionHealth, PredictionResponse, PredictionStats, BacktestGlobalStats, BacktestAssetStats } from '@/types/api'

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
  },

  /**
   * Récupérer les statistiques globales de backtest
   */
  async getBacktestGlobalStats(startDate?: string, endDate?: string): Promise<BacktestGlobalStats> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const queryString = params.toString() ? '?' + params.toString() : ''
    return apiClient.request<BacktestGlobalStats>('/predictions/backtest/stats' + queryString)
  },

  /**
   * Récupérer les statistiques de backtest par actif
   */
  async getBacktestAssetsStats(startDate?: string, endDate?: string): Promise<BacktestAssetStats[]> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const queryString = params.toString() ? '?' + params.toString() : ''
    return apiClient.request<BacktestAssetStats[]>('/predictions/backtest/assets' + queryString)
  },

  /**
   * Récupérer les statistiques de backtest pour un actif spécifique
   */
  async getBacktestSingleAssetStats(symbol: string, startDate?: string, endDate?: string): Promise<BacktestAssetStats> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    const queryString = params.toString() ? '?' + params.toString() : ''
    return apiClient.request<BacktestAssetStats>('/predictions/backtest/assets/' + symbol + queryString)
  }

}
