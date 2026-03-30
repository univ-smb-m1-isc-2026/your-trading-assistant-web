import { useState, useEffect } from 'react'
import { predictionService } from '@/services/prediction-service'
import type { BacktestAssetStats } from '@/types/api'

export function useBacktestSingleAsset(symbol: string, startDate?: string, endDate?: string) {
  const [stats, setStats] = useState<BacktestAssetStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    
    if (!symbol) {
      setIsLoading(false)
      return
    }

    async function fetchStats() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await predictionService.getBacktestSingleAssetStats(symbol, startDate, endDate)
        if (!cancelled) {
          setStats(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement des statistiques de backtest pour l\'actif')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchStats()

    return () => {
      cancelled = true
    }
  }, [symbol, startDate, endDate])

  return { stats, isLoading, error }
}
