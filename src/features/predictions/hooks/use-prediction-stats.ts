import { useState, useEffect } from 'react'
import { predictionService } from '@/services/prediction-service'
import type { PredictionStats } from '@/types/api'

export function usePredictionStats() {
  const [stats, setStats] = useState<PredictionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchStats() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await predictionService.getPredictionStats()
        if (!cancelled) {
          setStats(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement des statistiques')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchStats()

    return () => {
      cancelled = true
    }
  }, [])

  return { stats, isLoading, error }
}
