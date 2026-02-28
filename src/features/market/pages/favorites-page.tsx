/**
 * Page : liste des assets favoris de l'utilisateur.
 *
 * Structure identique à AssetsPage (même tableau style Binance) mais :
 *   - N'affiche que les assets ajoutés en favoris par l'utilisateur
 *   - Utilise useFavorites() comme source de données (pas useAssets())
 *   - Affiche un état vide avec invitation si aucun favori
 *
 * Pourquoi réutiliser le même tableau que AssetsPage ?
 *   → Cohérence UX : l'utilisateur retrouve les mêmes colonnes, les mêmes
 *   interactions (clic pour voir le détail, étoile pour retirer), les mêmes
 *   styles. Moins de surface cognitive.
 *
 * Pourquoi useFavorites() et non un nouveau hook ?
 *   → useFavorites() charge les favoris depuis l'API si le store n'est pas
 *   encore peuplé (loaded=false), sinon il lit directement le store. Naviguer
 *   depuis AssetsPage (qui a déjà peuplé le store) vers FavoritesPage ne
 *   déclenche donc aucune nouvelle requête réseau.
 */

import { Link, useNavigate } from 'react-router-dom'
import { useFavorites } from '../hooks/use-favorites'
import { cn } from '@/utils/cn'
import type { Asset } from '@/types/api'

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        'h-4 w-4 transition-colors',
        filled
          ? 'fill-amber-400 stroke-amber-400'
          : 'fill-none stroke-slate-300 dark:stroke-slate-600',
      )}
      strokeWidth="2"
    >
      <polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface FavoriteRowProps {
  asset: Asset
  rank: number
  toggling: string | null
  onToggleFavorite: (symbol: string) => Promise<void>
}

function FavoriteRow({ asset, rank, toggling, onToggleFavorite }: FavoriteRowProps) {
  const navigate = useNavigate()
  const isAvailable = asset.lastPrice !== null
  const isToggling = toggling === asset.symbol

  function handleRowClick() {
    if (isAvailable) {
      navigate(`/assets/${asset.symbol}`)
    }
  }

  function handleStarClick(e: React.MouseEvent) {
    e.stopPropagation()
    void onToggleFavorite(asset.symbol)
  }

  return (
    <tr
      className={cn(
        'border-b border-slate-100 transition-colors dark:border-slate-800',
        isAvailable
          ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
          : 'opacity-50',
      )}
    >
      {/* Colonne ⭐ — étoile toujours pleine ici (tous les assets affichés sont favoris) */}
      <td className="px-3 py-3 text-center">
        <button
          onClick={handleStarClick}
          disabled={toggling !== null}
          title="Retirer des favoris"
          className={cn(
            'inline-flex items-center justify-center rounded p-0.5 transition-colors',
            toggling !== null
              ? 'cursor-not-allowed opacity-50'
              : 'hover:scale-110 hover:opacity-80',
            isToggling && 'animate-pulse',
          )}
        >
          <StarIcon filled={true} />
        </button>
      </td>

      {/* Rang */}
      <td
        onClick={handleRowClick}
        className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500"
      >
        {rank}
      </td>

      {/* Symbole */}
      <td onClick={handleRowClick} className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary dark:bg-primary/20">
            {asset.symbol.slice(0, 2)}
          </div>
          <span className="font-semibold text-slate-900 dark:text-white">
            {asset.symbol}
          </span>
        </div>
      </td>

      {/* Dernier prix */}
      <td onClick={handleRowClick} className="px-4 py-3 text-right font-mono text-sm">
        {isAvailable ? (
          <span className="text-slate-900 dark:text-white">
            ${asset.lastPrice!.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500">—</span>
        )}
      </td>

      {/* Variation 24h — placeholder */}
      <td
        onClick={handleRowClick}
        className="px-4 py-3 text-right text-sm text-slate-400 dark:text-slate-500"
      >
        —
      </td>

      {/* Dernière MAJ */}
      <td
        onClick={handleRowClick}
        className="hidden px-4 py-3 text-right text-sm text-slate-500 dark:text-slate-400 md:table-cell"
      >
        {asset.lastDate
          ? new Date(asset.lastDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
          : '—'}
      </td>

      {/* Statut */}
      <td onClick={handleRowClick} className="hidden px-4 py-3 text-center lg:table-cell">
        {isAvailable ? (
          <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Disponible
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-500">
            N/A
          </span>
        )}
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-right">
        {isAvailable && (
          <button
            onClick={handleRowClick}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30"
          >
            Voir
          </button>
        )}
      </td>
    </tr>
  )
}

export function FavoritesPage() {
  const { favorites, loading, error, toggling, toggleFavorite } = useFavorites()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Chargement des favoris...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">Erreur : {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* En-tête */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Favoris</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {favorites.length} actif{favorites.length > 1 ? 's' : ''} en favori{favorites.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        /* État vide — invitation à ajouter des favoris */
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <svg
            viewBox="0 0 24 24"
            className="mb-4 h-12 w-12 fill-none stroke-slate-300 dark:stroke-slate-700"
            strokeWidth="1.5"
          >
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mb-1 text-base font-semibold text-slate-700 dark:text-slate-300">
            Aucun favori pour l'instant
          </p>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Cliquez sur l'étoile dans la liste des marchés pour ajouter un actif à vos favoris.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Aller aux marchés
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  <th className="w-10 px-3 py-3" aria-label="Favoris" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Actif
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Dernier Prix
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    24h %
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 md:table-cell">
                    Dernière MAJ
                  </th>
                  <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 lg:table-cell">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((asset, index) => (
                  <FavoriteRow
                    key={asset.symbol}
                    asset={asset}
                    rank={index + 1}
                    toggling={toggling}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
