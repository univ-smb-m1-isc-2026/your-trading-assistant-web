import { useState } from 'react'
import { PredictionBadge } from '../components/prediction-badge'
import { PredictionStatsBanner } from '../components/prediction-stats-banner'
import { TopPredictionsTable } from '../components/top-predictions-table'
import { useTopPredictions } from '../hooks/use-top-predictions'
import { useBacktestAssets } from '../hooks/use-backtest-assets'

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  )
}

export function SignalsPage() {
  const [limit, setLimit] = useState<number>(10)
  
  // Par défaut, on utilise la date d'hier
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const defaultDate = yesterday.toISOString().split('T')[0]
  const [date, setDate] = useState<string | undefined>(defaultDate)

  const { predictions, isLoading, error } = useTopPredictions(limit, date)

  // Fetch stats for the last 30 days to display reliability
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const { stats: backtestStats } = useBacktestAssets(thirtyDaysAgo.toISOString().split('T')[0])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    setDate(newDate || undefined)
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-12">
      {/* En-tête */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Signaux IA
          </h1>
          <PredictionBadge />
        </div>
        
        {/* Contrôles */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative flex items-center">
            <div className="pointer-events-none absolute left-3 text-slate-400">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <input
              type="date"
              value={date || ''}
              onChange={handleDateChange}
              className="rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm font-medium text-slate-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Bannière Stats (Debug) */}
      <PredictionStatsBanner />

      {/* Tableau des signaux */}
      <TopPredictionsTable predictions={predictions} isLoading={isLoading} error={error} backtestStats={backtestStats} />
    </div>
  )
}
