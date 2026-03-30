import { useState, useEffect } from 'react'
import { predictionService } from '@/services/prediction-service'
import type { PredictionHealth } from '@/types/api'

export function usePredictionHealth() {
  const [health, setHealth] = useState<PredictionHealth | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchHealth() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await predictionService.checkHealth()
        if (!cancelled) {
          setHealth(data)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || "Erreur lors de la vérification de l'API IA")
          setHealth({ status: 'unavailable' })
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchHealth()

    return () => {
      cancelled = true
    }
  }, [])

  return { health, isLoading, error }
}
