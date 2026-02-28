/**
 * Page : détail d'un asset avec graphique candlestick.
 *
 * Récupère le symbol depuis l'URL via useParams (React Router),
 * puis délègue le fetch des candles au hook useCandles().
 * Le graphique est rendu par le composant CandlestickChart.
 *
 * Redesign : support thème clair/sombre, intégration dans AppLayout
 * (plus de min-h-screen ni de bg propre — le layout s'en charge).
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
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-red-600 dark:text-red-400">Symbol manquant dans l'URL.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* En-tête avec bouton retour et nom du symbole */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-white"
        >
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour
          </span>
        </button>

        <div className="flex items-center gap-3">
          {/* Icône symbole */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary dark:bg-primary/20">
            {symbol.slice(0, 2)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{symbol}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Graphique candlestick</p>
          </div>
        </div>
      </div>

      {/* Corps principal */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Chargement du graphique...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.includes('404')
              ? `Asset "${symbol}" introuvable.`
              : `Erreur : ${error}`}
          </p>
        </div>
      )}

      {!loading && !error && candles.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aucune donnée de bougie disponible pour {symbol}.
          </p>
        </div>
      )}

      {!loading && !error && candles.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {candles.length} bougies — de{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">{candles[0].date}</span> à{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">{candles[candles.length - 1].date}</span>
            </p>
          </div>
          <CandlestickChart candles={candles} height={480} />
        </div>
      )}
    </div>
  )
}
