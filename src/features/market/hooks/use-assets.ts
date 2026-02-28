/**
 * Hook métier : chargement et tri de la liste des assets.
 *
 * Responsabilités :
 *   - Appeler getAssets() au montage du composant
 *   - Trier : assets avec un prix en haut (triés alphabétiquement),
 *     assets sans prix (lastPrice === null) en bas
 *   - Exposer les états loading et error au composant consommateur
 *
 * Pourquoi séparer ce tri ici et non dans le composant ?
 *   → Le hook encapsule la logique métier. Le composant (page) ne contient
 *   que du JSX. Cela facilite les tests unitaires du tri sans monter de DOM.
 */

import { useEffect, useState } from 'react'
import { getAssets } from '@/services/market-service'
import type { Asset } from '@/types/api'

export interface UseAssetsReturn {
  /** Assets avec prix en premier (alpha), puis assets sans prix */
  assets: Asset[]
  loading: boolean
  error: string | null
}

export function useAssets(): UseAssetsReturn {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAssets() {
      try {
        const data = await getAssets()

        if (!cancelled) {
          // Assets disponibles (prix non-null) triés alphabétiquement,
          // suivis des assets indisponibles triés alphabétiquement.
          const available = data
            .filter((a) => a.lastPrice !== null)
            .sort((a, b) => a.symbol.localeCompare(b.symbol))

          const unavailable = data
            .filter((a) => a.lastPrice === null)
            .sort((a, b) => a.symbol.localeCompare(b.symbol))

          setAssets([...available, ...unavailable])
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

    void fetchAssets()

    // Cleanup : évite les setState sur un composant démonté
    return () => {
      cancelled = true
    }
  }, [])

  return { assets, loading, error }
}
