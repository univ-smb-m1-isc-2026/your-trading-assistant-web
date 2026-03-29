import { useNavigate } from 'react-router-dom'
import type { ChartPatternResponse } from '@/types/api'
import { cn } from '@/utils/cn'

interface PatternCardProps {
  pattern: ChartPatternResponse
}

export function PatternCard({ pattern }: PatternCardProps) {
  const navigate = useNavigate()
  
  const isToday = new Date(pattern.date).toDateString() === new Date().toDateString()
  const isBullish = pattern.category === 'BULLISH'
  const isBearish = pattern.category === 'BEARISH'
  const isNeutral = pattern.category === 'NEUTRAL'

  return (
    <button
      onClick={() => navigate(`/assets/${pattern.assetSymbol}`)}
      className={cn(
        'flex w-full items-center justify-between gap-4 rounded-xl border p-4 transition-all hover:shadow-md',
        isToday
          ? isBullish
            ? 'border-green-500 bg-white dark:bg-slate-900'
            : isBearish
            ? 'border-red-500 bg-white dark:bg-slate-900'
            : 'border-slate-300 bg-white dark:bg-slate-900'
          : 'border-slate-200 bg-slate-50/50 opacity-80 dark:border-slate-800 dark:bg-slate-900/50'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Symbol Badge */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white shadow-sm">
          {pattern.assetSymbol}
        </div>

        <div className="flex flex-col items-start gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {pattern.type.replace(/_/g, ' ')}
            </span>
            <span className="text-slate-400">•</span>
            {isBullish && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M23 6l-9.5 9.5-5-5L1 18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 6h6v6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                HAUSSIER
              </div>
            )}
            {isBearish && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M23 18l-9.5-9.5-5 5L1 6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17 18h6v-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                BAISSIER
              </div>
            )}
            {isNeutral && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                NEUTRE
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isToday ? 'Aujourd\'hui' : new Date(pattern.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </p>
      </div>
    </button>
  )
}
