/**
 * Hook métier : chargement des moyennes mobiles pour un asset.
 *
 * Responsabilités :
 *   - Appeler GET /assets/{symbol}/moving-averages?type=SMA&periods=20,50
 *   - Refetcher automatiquement quand symbol, type ou periods changent
 *   - Ne pas fetcher si aucune période n'est active (periods vide)
 *   - Exposer loading/error indépendants des candles (les candles restent
 *     visibles même si les MAs échouent)
 *
 * Pourquoi un hook séparé de useCandles ?
 *   → Les candles et les MAs sont deux endpoints distincts avec des
 *   lifecycles différents. L'utilisateur peut toggle les MAs sans
 *   refetcher les candles. Les séparer respecte le Single Responsibility
 *   Principle et évite des re-renders inutiles du chart quand seules
 *   les MAs changent.
 *
 * Pourquoi periods est un tableau de number et non un string ?
 *   → Le composant parent manipule les périodes comme des nombres
 *   (toggle on/off dans un Set<number>). La sérialisation en string
 *   pour l'URL est faite dans market-service.ts, pas ici.
 */

import { useEffect, useState } from 'react'
import { getMovingAverages } from '@/services/market-service'
import type { MovingAverageSeries } from '@/types/api'

export interface UseMovingAveragesReturn {
  /** Séries de moyennes mobiles retournées par l'API. */
  series: MovingAverageSeries[]
  loading: boolean
  error: string | null
}

export function useMovingAverages(
  symbol: string,
  type: 'SMA' | 'EMA',
  periods: number[],
): UseMovingAveragesReturn {
  const [series, setSeries] = useState<MovingAverageSeries[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Sérialiser periods en string stable pour le tableau de dépendances.
  // Sans cela, chaque render créerait un nouveau tableau reference et
  // déclencherait un refetch infini.
  const periodsKey = periods.slice().sort((a, b) => a - b).join(',')

  useEffect(() => {
    // Pas de fetch si aucune période n'est sélectionnée
    if (periods.length === 0 || !symbol) {
      setSeries([])
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    async function fetchMA() {
      try {
        const data = await getMovingAverages(symbol, type, periods)
        if (!cancelled) {
          setSeries(data)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue')
          setSeries([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void fetchMA()

    return () => {
      cancelled = true
    }
    // periodsKey est la version sérialisée stable de periods
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, type, periodsKey])

  return { series, loading, error }
}
