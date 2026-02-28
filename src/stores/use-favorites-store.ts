/**
 * Store Zustand pour les favoris utilisateur.
 *
 * Pourquoi stocker des Asset[] et non des string[] (symbols) ?
 *   → La FavoritesPage a besoin des données complètes (lastPrice, lastDate)
 *   pour afficher le tableau. Stocker des Asset[] évite un second appel API
 *   pour enrichir les symbols.
 *
 * Pourquoi un flag `loaded` ?
 *   → Le hook use-favorites.ts est appelé dans deux pages (AssetsPage et
 *   FavoritesPage). Sans ce flag, les deux declencheraient un fetch GET
 *   /assets/favorites au montage. Avec `loaded`, seul le premier fetch
 *   est exécuté ; les suivants lisent directement le store en mémoire.
 *
 * Pourquoi une action `reset()` ?
 *   → Au logout, les données de l'utilisateur connecté doivent être
 *   effacées pour ne pas fuiter vers un utilisateur suivant. Le TopNavbar
 *   appelle reset() en même temps que logout() du store auth.
 */

import { create } from 'zustand'
import type { Asset } from '@/types/api'

interface FavoritesState {
  /** Liste complète des assets favoris de l'utilisateur connecté. */
  favorites: Asset[]

  /**
   * true après le premier fetch réussi — empêche les re-fetches inutiles
   * lors des navigations entre pages.
   */
  loaded: boolean

  /**
   * Remplace la liste entière des favoris (utilisé après GET /assets/favorites).
   * Positionne `loaded` à true.
   */
  setFavorites: (assets: Asset[]) => void

  /**
   * Retire un asset de la liste par son symbol.
   * Appelé optimistement après un DELETE /assets/{symbol}/favorite réussi.
   */
  removeFavorite: (symbol: string) => void

  /**
   * Remet le store dans son état initial.
   * Appelé au logout pour éviter la persistance de données inter-utilisateurs.
   */
  reset: () => void
}

const initialState = {
  favorites: [] as Asset[],
  loaded: false,
}

export const useFavoritesStore = create<FavoritesState>((set) => ({
  ...initialState,

  setFavorites: (assets) => set({ favorites: assets, loaded: true }),

  removeFavorite: (symbol) =>
    set((state) => ({
      favorites: state.favorites.filter((f) => f.symbol !== symbol),
    })),

  reset: () => set({ ...initialState }),
}))
