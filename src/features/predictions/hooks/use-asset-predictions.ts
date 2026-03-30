import { useState, useEffect } from 'react'
import { predictionService } from '@/services/prediction-service'
import type { PredictionResponse } from '@/types/api'

export function useAssetPredictions(symbol: string) {
  const [predictions, setPredictions] = useState<PredictionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    
    if (!symbol) {
      setIsLoading(false)
      return
    }

    async function fetchPredictions() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await predictionService.getAssetPredictions(symbol)
        if (!cancelled) {
          setPredictions(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Erreur lors du chargement des prédictions de l\'actif')
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
  }, [symbol])

  return { predictions, isLoading, error }
}
