import { useState, useEffect } from 'react'
import { predictionService } from '@/services/prediction-service'
import type { BacktestGlobalStats } from '@/types/api'

export function useBacktestGlobal(startDate?: string, endDate?: string) {
  const [stats, setStats] = useState<BacktestGlobalStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await predictionService.getBacktestGlobalStats(startDate, endDate)
        if (!cancelled) {
          setStats(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement des statistiques globales de backtest')
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
