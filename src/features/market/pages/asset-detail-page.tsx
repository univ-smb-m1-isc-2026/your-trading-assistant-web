/**
 * Page : détail d'un asset avec graphique candlestick.
 *
 * Récupère le symbol depuis l'URL via useParams (React Router),
 * puis délègue le fetch des candles au hook useCandles().
 * Le graphique est rendu par le composant CandlestickChart.
 *
 * Gestion d'erreur : si le symbol est inconnu, l'API retourne HTTP 404,
 * ce qui est capturé par api-client et propagé comme Error dans useCandles.
 */

import { useParams, useNavigate } from 'react-router-dom'
import { useCandles } from '../hooks/use-candles'
import { CandlestickChart } from '@/components/ui/candlestick-chart'

export function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()

  // symbol ne peut pas être undefined ici car la route exige /:symbol,
  // mais TypeScript ne le sait pas — on le fallback vers '' pour le typage strict.
  const { candles, loading, error } = useCandles(symbol ?? '')

  if (!symbol) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <p className="text-red-400">Symbol manquant dans l'URL.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 px-6 py-10">
      {/* En-tête avec bouton retour */}
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-300 transition-colors hover:border-slate-400 hover:text-white"
        >
          ← Retour
        </button>
        <h1 className="text-3xl font-bold text-white">{symbol}</h1>
      </div>

      {/* Corps principal */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <p className="text-slate-400">Chargement du graphique…</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950 px-6 py-4">
          <p className="text-red-400">
            {error.includes('404')
              ? `Asset "${symbol}" introuvable.`
              : `Erreur : ${error}`}
          </p>
        </div>
      )}

      {!loading && !error && candles.length === 0 && (
        <p className="text-slate-400">Aucune donnée de bougie disponible pour {symbol}.</p>
      )}

      {!loading && !error && candles.length > 0 && (
        <div className="rounded-xl border border-slate-700 p-4">
          <p className="mb-3 text-sm text-slate-400">
            {candles.length} bougies — de{' '}
            <span className="text-slate-200">{candles[0].date}</span> à{' '}
            <span className="text-slate-200">{candles[candles.length - 1].date}</span>
          </p>
          <CandlestickChart candles={candles} height={480} />
        </div>
      )}
    </div>
  )
}
