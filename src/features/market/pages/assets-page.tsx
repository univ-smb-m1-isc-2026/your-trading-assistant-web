/**
 * Page : liste de tous les assets — style tableau Binance.
 *
 * Redesign complet : la grille de cards est remplacée par un tableau
 * professionnel avec colonnes triables, lignes cliquables, et support
 * du thème clair/sombre.
 *
 * Colonnes : ⭐ (favori), #, Actif, Dernier Prix, Variation 24h (placeholder),
 *            Dernière MAJ, Statut, Action.
 *
 * La colonne ⭐ est toujours visible et permet d'ajouter/retirer un asset
 * des favoris en un clic, même pour les assets indisponibles (lastPrice null).
 * Pendant le toggle, le bouton est désactivé pour éviter les double-clics.
 *
 * Recherche : un champ de recherche dans le header filtre les assets par
 * symbole en temps réel (client-side, insensible à la casse). Le compteur
 * s'adapte pour indiquer le nombre de résultats filtrés vs total.
 *
 * La logique de fetch et de tri des assets est dans useAssets().
 * La logique des favoris est dans useFavorites().
 * Ce composant ne contient que du JSX de présentation.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssets } from '../hooks/use-assets'
import { useFavorites } from '../hooks/use-favorites'
import { cn } from '@/utils/cn'
import type { Asset } from '@/types/api'

/**
 * Icône étoile SVG inline.
 * filled=true → étoile pleine jaune (asset en favori)
 * filled=false → étoile vide (asset non favori)
 */
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(
        'h-4 w-4 transition-colors',
        filled
          ? 'fill-amber-400 stroke-amber-400'
          : 'fill-none stroke-slate-500 dark:stroke-slate-600',
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

interface AssetRowProps {
  asset: Asset
  rank: number
  isFavorite: boolean
  /** Symbol en cours de toggle (null si aucun). Utilisé pour le disabled state. */
  toggling: string | null
  onToggleFavorite: (symbol: string) => Promise<void>
}

function AssetRow({ asset, rank, isFavorite, toggling, onToggleFavorite }: AssetRowProps) {
  const navigate = useNavigate()
  const isAvailable = asset.lastPrice !== null
  const isToggling = toggling === asset.symbol

  function handleRowClick() {
    if (isAvailable) {
      navigate(`/assets/${asset.symbol}`)
    }
  }

  function handleStarClick(e: React.MouseEvent) {
    // Stoppe la propagation pour ne pas déclencher handleRowClick
    e.stopPropagation()
    void onToggleFavorite(asset.symbol)
  }

  return (
    <tr
      className={cn(
        'border-b border-slate-200 transition-colors dark:border-slate-800',
        isAvailable
          ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50'
          : 'opacity-50',
      )}
    >
      {/* Colonne ⭐ — toujours cliquable, indépendante du statut de l'asset */}
      <td className="px-3 py-3 text-center">
        <button
          onClick={handleStarClick}
          disabled={toggling !== null}
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          className={cn(
            'inline-flex items-center justify-center rounded p-0.5 transition-colors',
            toggling !== null
              ? 'cursor-not-allowed opacity-50'
              : 'hover:scale-110 hover:opacity-80',
            isToggling && 'animate-pulse',
          )}
        >
          <StarIcon filled={isFavorite} />
        </button>
      </td>

      {/* Rang */}
      <td
        onClick={handleRowClick}
        className="px-4 py-3 text-sm text-slate-600 dark:text-slate-500"
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
          <span className="text-slate-600 dark:text-slate-500">—</span>
        )}
      </td>

      {/* Variation 24h — placeholder (pas dans l'API) */}
      <td
        onClick={handleRowClick}
        className="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-500"
      >
        —
      </td>

      {/* Dernière MAJ */}
      <td
        onClick={handleRowClick}
        className="hidden px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-400 md:table-cell"
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

export function AssetsPage() {
  const { assets, loading: assetsLoading, error: assetsError } = useAssets()
  const { isFavorite, toggleFavorite, toggling, loading: favLoading, error: favError } = useFavorites()

  // ─── Recherche client-side ──────────────────────────────────────────────
  // Pourquoi client-side ? Tous les assets sont déjà en mémoire (chargés
  // par useAssets). Un filter() local est instantané, pas besoin de
  // solliciter le backend. Le filtre est insensible à la casse.
  const [search, setSearch] = useState('')

  const loading = assetsLoading || favLoading
  const error = assetsError ?? favError

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Chargement des marchés...</p>
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

  const availableCount = assets.filter((a) => a.lastPrice !== null).length

  // Filtrer les assets par le terme de recherche (insensible à la casse).
  // Si le champ est vide, on affiche tous les assets (pas de filtre).
  const query = search.trim().toLowerCase()
  const filteredAssets = query
    ? assets.filter((a) => a.symbol.toLowerCase().includes(query))
    : assets

  return (
    <div className="p-6">
      {/* En-tête avec titre + champ de recherche */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marchés</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {availableCount} actif{availableCount > 1 ? 's' : ''} disponible{availableCount > 1 ? 's' : ''} sur {assets.length}
          </p>
        </div>

        {/* Champ de recherche — visible uniquement quand il y a des assets */}
        {assets.length > 0 && (
          <div className="relative">
            {/* Icône loupe (SVG inline — pas d'icon library) */}
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 stroke-slate-500 dark:stroke-slate-500"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un actif..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary sm:w-64"
            />
          </div>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-600 dark:text-slate-400">Aucun actif disponible.</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        /* Aucun résultat pour la recherche */
        <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Aucun actif ne correspond à <span className="font-semibold text-slate-700 dark:text-slate-300">« {search} »</span>
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                  {/* Colonne ⭐ sans label */}
                  <th className="w-10 px-3 py-3" aria-label="Favoris" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Actif
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Dernier Prix
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    24h %
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 md:table-cell">
                    Dernière MAJ
                  </th>
                  <th className="hidden px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 lg:table-cell">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset, index) => (
                  <AssetRow
                    key={asset.symbol}
                    asset={asset}
                    rank={index + 1}
                    isFavorite={isFavorite(asset.symbol)}
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
