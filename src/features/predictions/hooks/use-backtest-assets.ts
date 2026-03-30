import { useState, useEffect } from 'react'
import { predictionService } from '@/services/prediction-service'
import type { BacktestAssetStats } from '@/types/api'

export function useBacktestAssets(startDate?: string, endDate?: string) {
  const [stats, setStats] = useState<BacktestAssetStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await predictionService.getBacktestAssetsStats(startDate, endDate)
        if (!cancelled) {
          setStats(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement des statistiques de backtest par actif')
          setStats([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchStats()

    return () => {
      cancelled = true
    }
  }, [startDate, endDate])

  return { stats, isLoading, error }
}
