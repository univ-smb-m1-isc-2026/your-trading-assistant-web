/**
 * Hook métier : chargement des bougies OHLCV pour un asset donné.
 *
 * Prend le symbol en paramètre et le re-fetch automatiquement si ce
 * paramètre change (ex: navigation entre deux pages détail).
 *
 * Pourquoi symbol dans le tableau de dépendances de useEffect ?
 *   → Si l'utilisateur navigue de /assets/BTC vers /assets/ETH sans
 *   démonter le composant (ce que React Router peut faire), le hook
 *   relancera le fetch automatiquement.
 */

import { useEffect, useState } from 'react'
import { getCandles } from '@/services/market-service'
import type { Candle } from '@/types/api'

export interface UseCandlesReturn {
  candles: Candle[]
  loading: boolean
  error: string | null
}

export function useCandles(symbol: string): UseCandlesReturn {
  const [candles, setCandles] = useState<Candle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    setError(null)

    async function fetchCandles() {
      try {
        const data = await getCandles(symbol)

        if (!cancelled) {
          setCandles(data)
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

    void fetchCandles()

    return () => {
      cancelled = true
    }
  }, [symbol])

  return { candles, loading, error }
}
