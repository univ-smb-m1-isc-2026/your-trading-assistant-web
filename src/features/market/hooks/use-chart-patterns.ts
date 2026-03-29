import { useEffect, useState } from 'react'
import { getChartPatterns } from '@/services/market-service'
import type { ChartPatternDetail } from '@/types/api'

export interface UseChartPatternsReturn {
  patterns: ChartPatternDetail[]
  loading: boolean
  error: string | null
}

export function useChartPatterns(symbol: string): UseChartPatternsReturn {
  const [patterns, setPatterns] = useState<ChartPatternDetail[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!symbol) return

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchPatterns() {
      try {
        const data = await getChartPatterns(symbol)
        if (!cancelled) {
          setPatterns(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchPatterns()

    return () => {
      cancelled = true
    }
  }, [symbol])

  return { patterns, loading, error }
}
