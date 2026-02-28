/**
 * Hook métier : gestion des favoris utilisateur.
 *
 * Responsabilités :
 *   - Charger les favoris depuis l'API au premier appel (GET /assets/favorites)
 *   - Exposer isFavorite(symbol) pour que les composants sachent si un asset
 *     est dans les favoris sans re-fetcher
 *   - Exposer toggleFavorite(symbol) pour ajouter/retirer un asset
 *   - Exposer toggling (symbol en cours de modification) pour désactiver
 *     le bouton étoile pendant l'appel réseau
 *
 * Pourquoi un flag `loaded` dans le store ?
 *   → Ce hook est appelé dans AssetsPage ET FavoritesPage. Sans `loaded`,
 *   les deux déclencheraient un fetch GET /assets/favorites au montage.
 *   Avec `loaded`, seul le premier appel fetch ; les suivants lisent le
 *   store Zustand en mémoire — zéro requête réseau supplémentaire.
 *
 * Pourquoi refetcher après toggleFavorite plutôt qu'une mise à jour optimiste ?
 *   → Une mise à jour optimiste risque de désynchroniser le store si l'API
 *   échoue (ex: symbole déjà favori, erreur réseau). Un refetch garantit
 *   que l'état local reflète exactement ce que le backend a persisté.
 *   Le coût est une seule requête supplémentaire GET, acceptable ici.
 */

import { useCallback, useEffect, useState } from 'react'
import { useFavoritesStore } from '@/stores/use-favorites-store'
import { getFavorites, addFavorite, removeFavorite } from '@/services/market-service'
import type { Asset } from '@/types/api'

export interface UseFavoritesReturn {
  /** Liste complète des assets favoris de l'utilisateur. */
  favorites: Asset[]

  /** true pendant le chargement initial (premier fetch). */
  loading: boolean

  /** Message d'erreur si le fetch initial a échoué. */
  error: string | null

  /**
   * Symbol de l'asset actuellement en cours de toggle (ajout/retrait).
   * null si aucun toggle en cours.
   * Utilisé pour désactiver le bouton étoile et afficher un indicateur.
   */
  toggling: string | null

  /**
   * Retourne true si l'asset identifié par symbol est dans les favoris.
   * Calculé à partir du store — pas d'appel réseau.
   */
  isFavorite: (symbol: string) => boolean

  /**
   * Ajoute ou retire un asset des favoris selon son état actuel.
   * Appelle l'API puis resynchronise le store avec un GET /assets/favorites.
   */
  toggleFavorite: (symbol: string) => Promise<void>
}

export function useFavorites(): UseFavoritesReturn {
  // Sélecteurs Zustand — slice-based pour éviter les re-renders inutiles
  const favorites = useFavoritesStore((s) => s.favorites)
  const loaded = useFavoritesStore((s) => s.loaded)
  const setFavorites = useFavoritesStore((s) => s.setFavorites)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toggling, setToggling] = useState<string | null>(null)

  // Chargement initial : déclenché uniquement si le store n'est pas encore peuplé.
  useEffect(() => {
    if (loaded) return

    let cancelled = false

    async function fetchFavorites() {
      setLoading(true)
      try {
        const data = await getFavorites()
        if (!cancelled) {
          setFavorites(data)
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

    void fetchFavorites()

    return () => {
      cancelled = true
    }
  }, [loaded, setFavorites])

  const isFavorite = useCallback(
    (symbol: string): boolean => favorites.some((f) => f.symbol === symbol),
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (symbol: string): Promise<void> => {
      // Empêche un double-clic pendant qu'un toggle est déjà en cours
      if (toggling !== null) return

      setToggling(symbol)
      try {
        if (isFavorite(symbol)) {
          await removeFavorite(symbol)
        } else {
          await addFavorite(symbol)
        }
        // Resync avec le backend — garantit la cohérence du store
        const updated = await getFavorites()
        setFavorites(updated)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setToggling(null)
      }
    },
    [toggling, isFavorite, setFavorites],
  )

  return { favorites, loading, error, toggling, isFavorite, toggleFavorite }
}
