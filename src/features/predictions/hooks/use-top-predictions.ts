import { useState, useEffect } from 'react'
import { predictionService } from '@/services/prediction-service'
import type { PredictionResponse } from '@/types/api'

export function useTopPredictions(limit: number = 10, date?: string) {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPredictions() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await predictionService.getTopPredictions(limit, date)
        if (!cancelled) {
          setPredictions(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement des prédictions')
          setPredictions([])
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchPredictions()

    return () => {
      cancelled = true
    }
  }, [limit, date])

  return { predictions, isLoading, error }
}
