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
 *
 * Moyennes mobiles :
 *   Une barre de contrôle au-dessus du chart permet de choisir le type
 *   (SMA/EMA) et les périodes actives (20, 50, 200). Le hook useMovingAverages
 *   est appelé avec ces paramètres et les séries résultantes sont passées
 *   au composant CandlestickChart via la prop movingAverages.
 *
 *   Les couleurs des badges correspondent aux couleurs des lignes sur le chart
 *   (bleu = période la plus courte, orange = moyenne, violet = longue).
 *   Cette cohérence est assurée en utilisant le même tableau MA_COLORS et le
 *   même tri par période croissante que dans candlestick-chart.tsx.
 */

import { useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCandles } from '../hooks/use-candles'
import { useMovingAverages } from '../hooks/use-moving-averages'
import { CandlestickChart } from '@/components/ui/candlestick-chart'
import { AlertForm, AlertCard, TriggeredAlertCard, useAssetAlerts } from '@/features/alerts'
import { cn } from '@/utils/cn'

/**
 * Périodes disponibles pour les moyennes mobiles.
 * Triées par ordre croissant pour que l'attribution des couleurs soit stable.
 */
const AVAILABLE_PERIODS = [8, 20, 50, 200] as const

/**
 * Couleurs MA — même tableau que dans candlestick-chart.tsx.
 * Dupliqué ici pour colorer les badges de manière cohérente avec les lignes.
 *
 * Pourquoi dupliquer plutôt qu'importer ?
 *   candlestick-chart.tsx est un composant UI partagé ; y exporter une
 *   constante de couleur couplerait l'UI avec la logique métier de la page.
 *   Le coût de la duplication (un petit tableau) est inférieur au coût de
 *   l'abstraction prématurée.
 */
const MA_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899']

/**
 * Retourne la couleur MA pour un index donné (même logique que le chart).
 */
function getMaColor(index: number): string {
  return MA_COLORS[index % MA_COLORS.length]
}

/**
 * Retourne la couleur MA pour une période donnée, en se basant sur la
 * position de cette période dans la liste AVAILABLE_PERIODS triée.
 *
 * Pourquoi calculer l'index à partir de AVAILABLE_PERIODS ?
 *   Le chart attribue les couleurs par rang de période croissante parmi
 *   les MAs ACTIVES. Ici, pour que les badges gardent une couleur fixe
 *   (20 = toujours bleu, 50 = toujours orange, 200 = toujours violet),
 *   on utilise l'index dans AVAILABLE_PERIODS (qui est constant) au lieu
 *   de l'index dans activePeriods (qui changerait quand on toggle).
 *
 *   Note : cela signifie que si seules 50 et 200 sont actives, la ligne
 *   50 sera orange et la ligne 200 sera violet — cohérent avec les badges.
 *   Le chart, lui, attribue par rang dans les séries triées, donc il faut
 *   passer les couleurs via les données. Actuellement les couleurs sont
 *   hardcodées dans le chart par rang, ce qui est acceptable car on
 *   trie toujours par période croissante.
 *
 *   TODO: Si le besoin évolue (couleurs fixes par période même dans le chart),
 *   on pourra ajouter un champ `color` dans MovingAverageSeries.
 */
function getColorForPeriod(period: number): string {
  const index = AVAILABLE_PERIODS.indexOf(period as typeof AVAILABLE_PERIODS[number])
  return index >= 0 ? getMaColor(index) : getMaColor(0)
}

export function AssetDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const navigate = useNavigate()

  // symbol ne peut pas être undefined ici car la route exige /:symbol,
  // mais TypeScript ne le sait pas — on le fallback vers '' pour le typage strict.
  const { candles, loading, error } = useCandles(symbol ?? '')

  // ─── État des contrôles MA ──────────────────────────────────────────────
  const [maType, setMaType] = useState<'SMA' | 'EMA'>('SMA')
  const [activePeriods, setActivePeriods] = useState<Set<number>>(new Set([8, 50]))

  // ─── Alertes pour cet asset ─────────────────────────────────────────────
  const {
    assetAlerts,
    assetTriggered,
    create: createAlert,
    update: updateAlert,
    remove: removeAlert,
  } = useAssetAlerts(symbol ?? '')

  /**
   * Toggle une période dans le Set. useCallback pour éviter de recréer
   * la fonction à chaque render (elle est passée comme handler de click).
   */
  const togglePeriod = useCallback((period: number) => {
    setActivePeriods((prev) => {
      const next = new Set(prev)
      if (next.has(period)) {
        next.delete(period)
      } else {
        next.add(period)
      }
      return next
    })
  }, [])

  // Conversion Set → Array trié pour le hook
  const periodsArray = Array.from(activePeriods).sort((a, b) => a - b)

  const {
    series: maSeriesRaw,
    loading: maLoading,
    error: maError,
  } = useMovingAverages(symbol ?? '', maType, periodsArray)

  // Enrichir les séries MA avec la couleur fixe par période.
  // Cela garantit que la couleur de la ligne sur le chart correspond
  // à la couleur du badge, même quand certaines périodes sont désactivées.
  const maSeries = maSeriesRaw.map((s) => ({
    ...s,
    color: getColorForPeriod(s.period),
  }))

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
            <p className="text-xs text-slate-600 dark:text-slate-400">Graphique candlestick</p>
          </div>
        </div>
      </div>

      {/* Corps principal */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Chargement du graphique...</p>
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
        <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Aucune donnée de bougie disponible pour {symbol}.
          </p>
        </div>
      )}

      {!loading && !error && candles.length > 0 && (
        <div className="rounded-xl border border-slate-300 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {candles.length} bougies — de{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">{candles[0].date}</span> à{' '}
              <span className="font-medium text-slate-700 dark:text-slate-200">{candles[candles.length - 1].date}</span>
            </p>
          </div>

          {/* ─── Barre de contrôle Moyennes Mobiles ─────────────────────────
               Deux groupes : type (SMA/EMA) et périodes (20/50/200).
               Le type actif a un fond primary, les périodes actives ont
               la couleur de leur ligne MA respective.
            ──────────────────────────────────────────────────────────────── */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {/* Sélecteur SMA / EMA */}
            <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
              {(['SMA', 'EMA'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMaType(t)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold transition-colors',
                    maType === t
                      ? 'bg-primary text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Séparateur vertical */}
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700" />

            {/* Badges de périodes */}
            {AVAILABLE_PERIODS.map((period) => {
              const isActive = activePeriods.has(period)
              const color = getColorForPeriod(period)

              return (
                <button
                  key={period}
                  onClick={() => togglePeriod(period)}
                  className={cn(
                    'rounded-md px-2.5 py-1 text-xs font-bold tabular-nums transition-colors',
                    isActive
                      ? 'text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:hover:bg-slate-700',
                  )}
                  style={isActive ? { backgroundColor: color } : undefined}
                >
                  {period}
                </button>
              )
            })}

            {/* Indicateur de chargement MA (discret, ne bloque pas le chart) */}
            {maLoading && (
              <div className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-600 dark:border-t-primary" />
            )}
          </div>

          {/* Erreur MA (non-bloquante : le chart reste visible) */}
          {maError && (
            <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
              Moyennes mobiles indisponibles : {maError}
            </p>
          )}

          <CandlestickChart candles={candles} height={480} movingAverages={maSeries} />
        </div>
      )}

      {/* ─── Section Alertes ────────────────────────────────────────────── */}
      {!loading && !error && symbol && (
        <>
          {/* Formulaire de création d'alerte — toujours visible (inline) */}
          <div className="mt-6 rounded-xl border border-slate-300 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <AlertForm symbol={symbol} onSubmit={createAlert} />
          </div>

          {/* Alertes actives pour cet asset */}
          {assetAlerts.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Alertes configurées ({assetAlerts.length})
              </h3>
              <div className="space-y-2">
                {assetAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onUpdate={updateAlert}
                    onDelete={removeAlert}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Historique des déclenchements pour cet asset */}
          {assetTriggered.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
                Déclenchements ({assetTriggered.length})
              </h3>
              <div className="space-y-2">
                {assetTriggered.map((triggered) => (
                  <TriggeredAlertCard key={triggered.id} triggered={triggered} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
