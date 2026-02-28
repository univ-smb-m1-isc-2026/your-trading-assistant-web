/**
 * Page : liste de tous les assets.
 *
 * Affiche une grille de cards :
 *   - Assets disponibles (lastPrice non-null) : cliquables, naviguent vers /assets/:symbol
 *   - Assets indisponibles (lastPrice null) : grisés, badge "Non disponible", non cliquables
 *
 * La logique de fetch et de tri est entièrement dans le hook useAssets().
 * Ce composant ne contient que du JSX de présentation.
 */

import { useNavigate } from 'react-router-dom'
import { useAssets } from '../hooks/use-assets'
import { cn } from '@/utils/cn'
import type { Asset } from '@/types/api'

function AssetCard({ asset }: { asset: Asset }) {
  const navigate = useNavigate()
  const isAvailable = asset.lastPrice !== null

  function handleClick() {
    if (isAvailable) {
      navigate(`/assets/${asset.symbol}`)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'rounded-xl border border-slate-700 bg-slate-800 p-5 transition-colors',
        isAvailable
          ? 'cursor-pointer hover:border-blue-500 hover:bg-slate-700'
          : 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xl font-bold text-white">{asset.symbol}</span>
        {!isAvailable && (
          <span className="rounded-full bg-slate-600 px-2 py-0.5 text-xs text-slate-300">
            Non disponible
          </span>
        )}
      </div>

      {isAvailable ? (
        <div className="mt-3">
          <p className="text-2xl font-semibold text-green-400">
            ${asset.lastPrice!.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </p>
          {asset.lastDate && (
            <p className="mt-1 text-xs text-slate-400">
              Dernière mise à jour : {new Date(asset.lastDate).toLocaleDateString('fr-FR')}
            </p>
          )}
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-500">Aucune donnée de prix</p>
      )}
    </div>
  )
}

export function AssetsPage() {
  const { assets, loading, error } = useAssets()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-slate-400">Chargement des assets…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-red-400">Erreur : {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold text-white">Marchés</h1>
      {assets.length === 0 ? (
        <p className="text-slate-400">Aucun asset disponible.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assets.map((asset) => (
            <AssetCard key={asset.symbol} asset={asset} />
          ))}
        </div>
      )}
    </div>
  )
}
