import { useState, useMemo } from 'react'
import { PATTERN_INFO, PatternDefinition } from '../utils/pattern-info'
import { MiniPatternChart } from './mini-pattern-chart'
import { ChartPatternCategory, ChartPatternDetail } from '@/types/api'
import { cn } from '@/utils/cn'

interface PatternLibraryProps {
  detectedPatterns: ChartPatternDetail[]
  activePatternTypes: Set<string>
}

export function PatternLibrary({ detectedPatterns, activePatternTypes }: PatternLibraryProps) {
  const [filter, setFilter] = useState<ChartPatternCategory | 'ALL'>('ALL')
  const [isExpanded, setIsExpanded] = useState(false)

  // Types de figures détectées actuellement sur cet asset
  const detectedTypes = useMemo(() => {
    return new Set(detectedPatterns.map((p) => p.type))
  }, [detectedPatterns])

  const allPatterns = useMemo(() => Object.values(PATTERN_INFO), [])

  const filteredPatterns = useMemo(() => {
    let list = allPatterns

    // Appliquer le filtre de catégorie
    if (filter !== 'ALL') {
      list = list.filter((p) => p.category === filter)
    }

    // Tri : détectées d'abord, puis alphabétique
    return [...list].sort((a, b) => {
      const aDetected = detectedTypes.has(a.type)
      const bDetected = detectedTypes.has(b.type)
      if (aDetected && !bDetected) return -1
      if (!aDetected && bDetected) return 1
      return a.name.localeCompare(b.name)
    })
  }, [allPatterns, filter, detectedTypes])

  // Figures à afficher par défaut : détectées ET activées dans les filtres du chart
  const activeAndDetected = useMemo(() => {
    return filteredPatterns.filter(p => detectedTypes.has(p.type) && activePatternTypes.has(p.type))
  }, [filteredPatterns, detectedTypes, activePatternTypes])

  // Sélection finale des patterns à afficher
  const displayedPatterns = isExpanded ? filteredPatterns : activeAndDetected;

  return (
    <div className="mt-8 rounded-xl border border-slate-300 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Lexique des Figures Chartistes</h2>
          <p className="text-base text-slate-600 dark:text-slate-400">
            {activeAndDetected.length > 0 
              ? `${activeAndDetected.length} figure(s) active(s) détectée(s)` 
              : "Consultez le lexique pour comprendre les figures techniques"}
          </p>
        </div>

        {/* Filtres de catégorie */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50">
          {[
            { id: 'ALL', label: 'Tout' },
            { id: 'BULLISH', label: '📈 Bullish' },
            { id: 'BEARISH', label: '📉 Bearish' },
            { id: 'NEUTRAL', label: '➖ Neutre' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id as any)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                filter === cat.id
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grille de cartes */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {displayedPatterns.length > 0 ? (
          displayedPatterns.map((pattern) => (
            <PatternCard 
              key={pattern.type} 
              pattern={pattern} 
              isDetected={detectedTypes.has(pattern.type)} 
            />
          ))
        ) : !isExpanded && (
          <div className="col-span-full py-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Aucune des figures sélectionnées n'est détectée sur cet asset.
            </p>
          </div>
        )}
      </div>

      {/* Bouton Voir Plus */}
      {!isExpanded && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="rounded-lg bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {activeAndDetected.length > 0 
              ? `Voir les autres figures (${filteredPatterns.length - activeAndDetected.length})`
              : "Parcourir tout le lexique"}
          </button>
        </div>
      )}
      
      {isExpanded && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Réduire à la sélection active
          </button>
        </div>
      )}
    </div>
  )
}

interface PatternCardProps {
  pattern: PatternDefinition
  isDetected: boolean
}

function PatternCard({ pattern, isDetected }: PatternCardProps) {
  const categoryStyles = {
    BULLISH: 'border-green-500/20 bg-green-50/50 text-green-700 dark:bg-green-500/5 dark:text-green-400',
    BEARISH: 'border-red-500/20 bg-red-50/50 text-red-700 dark:bg-red-500/5 dark:text-red-400',
    NEUTRAL: 'border-slate-500/20 bg-slate-50/50 text-slate-700 dark:bg-slate-500/5 dark:text-slate-400',
  }

  return (
    <div className={cn(
      "relative flex flex-col sm:flex-row gap-8 rounded-2xl border p-8 transition-all",
      isDetected 
        ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20" 
        : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    )}>
      {isDetected && (
        <span className="absolute -top-3 right-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
          Détecté
        </span>
      )}
      
      {/* Visualisation Mini-Chart */}
      <div className="flex h-44 w-60 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/50">
        <MiniPatternChart candles={pattern.exampleCandles} width={220} height={160} />
      </div>

      <div className="flex-1">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pattern.name}</h3>
          <span className={cn("rounded-md px-2.5 py-1 text-xs font-bold uppercase", categoryStyles[pattern.category])}>
            {pattern.category}
          </span>
        </div>
        <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
          {pattern.description}
        </p>
      </div>
    </div>
  )
}
