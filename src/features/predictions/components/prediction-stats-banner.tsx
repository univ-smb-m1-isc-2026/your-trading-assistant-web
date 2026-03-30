import { cn } from '@/utils/cn'
import { usePredictionStats } from '../hooks/use-prediction-stats'

function formatPct(value: number) {
  const pct = value
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function StatBadge({ label, value, isPct = true }: { label: string, value: number, isPct?: boolean }) {
  const isPositive = value > 0
  const isNegative = value < 0
  
  let colorClass = 'text-slate-700 dark:text-slate-300'
  if (isPct && isPositive) colorClass = 'text-green-600 dark:text-green-400'
  if (isPct && isNegative) colorClass = 'text-red-600 dark:text-red-400'

  return (
    <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1.5 shadow-sm ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={cn("text-sm font-bold font-mono", colorClass)}>
        {isPct ? formatPct(value) : value.toString()}
      </span>
    </div>
  )
}

export function PredictionStatsBanner() {
  const { stats, isLoading, error } = usePredictionStats()

  if (isLoading) {
    return (
      <div className="flex h-12 w-full animate-pulse items-center gap-4 rounded-lg bg-slate-100 px-4 dark:bg-slate-800/50">
        <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-6 w-32 rounded bg-slate-200 dark:bg-slate-700" />
      </div>
    )
  }

  if (error || !stats) {
    return null // Fail silently for debug banner
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg bg-slate-50 p-4 border border-slate-200 dark:bg-slate-900/50 dark:border-slate-800">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
        Statistiques globales (Debug)
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <StatBadge label="Min" value={stats.min} />
        <StatBadge label="Max" value={stats.max} />
        <StatBadge label="Moyenne" value={stats.mean} />
        <StatBadge label="Médiane" value={stats.median} />
        <StatBadge label="Total" value={stats.count} isPct={false} />
      </div>
    </div>
  )
}
