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

import { useState, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCandles } from '../hooks/use-candles'
import { useMovingAverages } from '../hooks/use-moving-averages'
import { useChartPatterns } from '../hooks/use-chart-patterns'
import { CandlestickChart } from '@/components/ui/candlestick-chart'
import { PatternLibrary } from '../components/pattern-library'
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

  // ─── Figures Chartistes ─────────────────────────────────────────────────
  const { patterns, loading: patternsLoading } = useChartPatterns(symbol ?? '')
  
  // Liste des figures activées par défaut
  const DEFAULT_PATTERNS = ['MORNING_STAR', 'SHOOTING_STAR', 'HAMMER', 'EVENING_STAR']
  const [activePatternTypes, setActivePatternTypes] = useState<Set<string>>(new Set(DEFAULT_PATTERNS))

  // Déduire les types disponibles (tous ceux renvoyés par l'API)
  const availablePatternTypes = useMemo(() => {
    return Array.from(new Set(patterns.map(p => p.type))).sort()
  }, [patterns])

  // (Supprimé : le useEffect qui activait tout par défaut a été retiré,
  // on se fie désormais à DEFAULT_PATTERNS)

  const togglePatternType = useCallback((type: string) => {
    setActivePatternTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const activePatterns = useMemo(() => {
    return patterns.filter(p => activePatternTypes.has(p.type))
  }, [patterns, activePatternTypes])

  // ─── Alertes pour cet asset ─────────────────────────────────────────────
  const [activeAlertTab, setActiveAlertTab] = useState<'new' | 'active' | 'history'>('new')
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
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Colonne de gauche : Graphique et contrôles */}
        <div className="min-w-0 flex-1 space-y-4">
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

          {/* ─── Contrôles : Indicateurs & Figures ────────────────────────── */}
          <div className="mb-4 rounded-xl border border-slate-300 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">
              Indicateurs & Figures
            </h3>
            
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              {/* --- Section MA --- */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Moyennes Mobiles</span>
                <div className="flex flex-wrap items-center gap-3">
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
                  <div className="flex items-center gap-1.5">
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
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-900 dark:text-slate-500 dark:hover:bg-slate-700',
                          )}
                          style={isActive ? { backgroundColor: color } : undefined}
                        >
                          {period}
                        </button>
                      )
                    })}
                  </div>
                  {maLoading && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-600 dark:border-t-primary" />
                  )}
                </div>
              </div>

              {/* --- Section Figures Chartistes --- */}
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">Figures Détectées</span>
                <div className="flex min-h-[32px] flex-wrap items-center gap-2">
                  {patternsLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-600 dark:border-t-primary" />
                  ) : availablePatternTypes.length === 0 ? (
                    <span className="text-xs text-slate-400 dark:text-slate-500">Aucune figure</span>
                  ) : (
                    <>
                      {/* Select déguisé en bouton "+ Ajouter" */}
                      {availablePatternTypes.filter((t) => !activePatternTypes.has(t)).length > 0 && (
                        <select
                          className="cursor-pointer appearance-none rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"
                          onChange={(e) => {
                            if (e.target.value) {
                              togglePatternType(e.target.value)
                              e.target.value = '' // reset après sélection
                            }
                          }}
                          value=""
                        >
                          <option value="" disabled hidden>
                            + Ajouter
                          </option>
                          {availablePatternTypes
                            .filter((type) => !activePatternTypes.has(type))
                            .map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                        </select>
                      )}

                      {/* Chips des figures actives */}
                      {Array.from(activePatternTypes).map((type) => (
                          <div
                            key={type}
                            className="flex items-center gap-1.5 rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                          >
                            <span>{type}</span>
                            <button
                              onClick={() => togglePatternType(type)}
                              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                              aria-label={`Supprimer ${type}`}
                              title="Supprimer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Erreur MA (non-bloquante : le chart reste visible) */}
          {maError && (
            <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
              Moyennes mobiles indisponibles : {maError}
            </p>
          )}

          <CandlestickChart candles={candles} height={480} movingAverages={maSeries} triggeredAlerts={assetTriggered} chartPatterns={activePatterns} />
          
          {/* Lexique des figures chartistes */}
          <PatternLibrary detectedPatterns={patterns} activePatternTypes={activePatternTypes} />
        </div>
      )}
        </div>

        {/* Colonne de droite : Alertes (Sticky sur desktop) */}
        {!loading && !error && symbol && (
          <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-[360px] xl:w-[400px]">
            <div className="rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Alertes</h2>

              {/* Onglets de navigation */}
              <div className="mb-5 flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50">
                {(['new', 'active', 'history'] as const).map((tab) => {
                  const labels = {
                    new: 'Nouvelle',
                    active: `Actives (${assetAlerts.length})`,
                    history: `Histo. (${assetTriggered.length})`,
                  }
                  const isActive = activeAlertTab === tab
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveAlertTab(tab)}
                      className={cn(
                        'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
                        isActive
                          ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                      )}
                    >
                      {labels[tab]}
                    </button>
                  )
                })}
              </div>

              {/* Contenu de l'onglet actif */}
              <div className="min-h-[300px]">
                {activeAlertTab === 'new' && (
                  <AlertForm
                    symbol={symbol}
                    onSubmit={async (data) => {
                      await createAlert(data)
                      setActiveAlertTab('active')
                    }}
                  />
                )}

                {activeAlertTab === 'active' && (
                  <div className="space-y-3">
                    {assetAlerts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <svg className="mb-2 h-8 w-8 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Aucune alerte active.</p>
                      </div>
                    ) : (
                      assetAlerts.map((alert) => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          onUpdate={updateAlert}
                          onDelete={removeAlert}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeAlertTab === 'history' && (
                  <div className="space-y-3">
                    {assetTriggered.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <svg className="mb-2 h-8 w-8 text-slate-400 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Aucun historique récent.</p>
                      </div>
                    ) : (
                      assetTriggered.map((triggered) => (
                        <TriggeredAlertCard key={triggered.id} triggered={triggered} />
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
