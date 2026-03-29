import { useState, useMemo } from 'react'
import { usePatterns } from '../hooks/use-patterns'
import { PatternCard } from '../components/pattern-card'
import { cn } from '@/utils/cn'
import type { ChartPatternCategory } from '@/types/api'

export function PatternsPage() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined)
  const [selectedCategory, setSelectedCategory] = useState<ChartPatternCategory | undefined>(undefined)
  
  const { 
    patterns, 
    stats,
    loading, 
    error, 
    totalPages, 
    currentPage, 
    setPage 
  } = usePatterns(20, search || undefined, selectedType, selectedCategory)

  // Calcule les types disponibles depuis les stats du backend
  const availableTypes = useMemo(() => {
    return Object.keys(stats).sort()
  }, [stats])

  const totalPatternsCount = useMemo(() => {
    return Object.values(stats).reduce((acc, curr) => acc + curr, 0)
  }, [stats])

  const todayPatterns = patterns.filter(p => new Date(p.date).toDateString() === new Date().toDateString())
  const olderPatterns = patterns.filter(p => new Date(p.date).toDateString() !== new Date().toDateString())

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Figures Détectées</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Consultez les dernières figures chartistes identifiées par l'assistant.
        </p>
      </div>

      {/* Filtres */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-xs">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher un actif..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(0)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Filtre par Catégorie (BULLISH, BEARISH, NEUTRAL) */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-800/50">
            {(['HAUSSIER', 'BAISSIER', 'NEUTRE'] as const).map((label, i) => {
              const categories: ChartPatternCategory[] = ['BULLISH', 'BEARISH', 'NEUTRAL']
              const cat = categories[i]
              const isActive = selectedCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(isActive ? undefined : cat)
                    setPage(0)
                  }}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-bold transition-all',
                    isActive
                      ? cat === 'BULLISH' ? 'bg-green-600 text-white' :
                        cat === 'BEARISH' ? 'bg-red-600 text-white' :
                        'bg-slate-600 text-white'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700'
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Filtre par Type (Candes) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedType(undefined)
              setPage(0)
            }}
            className={cn(
              'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
              !selectedType
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
            )}
          >
            Tous les types <span className="ml-1 opacity-60">({totalPatternsCount})</span>
          </button>
          {availableTypes.map(type => (
            <button
              key={type}
              onClick={() => {
                setSelectedType(type)
                setPage(0)
              }}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-bold transition-all',
                selectedType === type
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
              )}
            >
              {type.replace(/_/g, ' ')} <span className="ml-1 opacity-60">({stats[type]})</span>
            </button>
          ))}
        </div>
      </div>

      {loading && patterns.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">Erreur : {error}</p>
        </div>
      ) : patterns.length === 0 ? (
        <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">Aucune figure trouvée pour ces filtres.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {todayPatterns.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Aujourd'hui</h2>
              <div className="space-y-3">
                {todayPatterns.map(p => (
                  <PatternCard key={p.id} pattern={p} />
                ))}
              </div>
            </section>
          )}

          {olderPatterns.length > 0 && (
            <section>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Historique</h2>
              <div className="space-y-3">
                {olderPatterns.map(p => (
                  <PatternCard key={p.id} pattern={p} />
                ))}
              </div>
            </section>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                disabled={currentPage === 0 || loading}
                onClick={() => setPage(currentPage - 1)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Précédent
              </button>
              
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {currentPage + 1} sur {totalPages}
              </span>

              <button
                disabled={currentPage >= totalPages - 1 || loading}
                onClick={() => setPage(currentPage + 1)}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              >
                Suivant
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
