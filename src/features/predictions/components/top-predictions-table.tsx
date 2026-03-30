import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'
import type { PredictionResponse } from '@/types/api'

interface TopPredictionsTableProps {
  predictions: PredictionResponse[]
  isLoading: boolean
  error: string | null
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

function TrendingDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  )
}

export function TopPredictionsTable({ predictions, isLoading, error }: TopPredictionsTableProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex justify-center p-12 text-slate-500 dark:text-slate-400">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-600 dark:bg-red-900/20 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 p-12 text-center text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Aucune prédiction disponible pour cette date.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 font-semibold">Actif</th>
              <th className="px-6 py-4 font-semibold">Direction</th>
              <th className="px-6 py-4 font-semibold">Variation</th>
              <th className="px-6 py-4 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {predictions.map((pred) => {
              const isUp = pred.predictedVariationPct >= 0
              const colorClass = isUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              const bgClass = isUp ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
              
              // Helper to generate a determinist color for the circle based on symbol
              const hue = pred.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 35 % 360
              
              return (
                <tr key={pred.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-xs"
                        style={{ backgroundColor: `hsl(${hue}, 70%, 50%)` }}
                      >
                        {pred.symbol.slice(0, 2)}
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {pred.symbol}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn('inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold', bgClass, colorClass)}>
                      {isUp ? <TrendingUpIcon className="h-3.5 w-3.5" /> : <TrendingDownIcon className="h-3.5 w-3.5" />}
                      {pred.predictedVariationPct >= 0 ? 'UP' : 'DOWN'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn('font-semibold', colorClass)}>
                      {pred.predictedVariationPct > 0 ? '+' : ''}{(pred.predictedVariationPct).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/assets/${pred.symbol}`)}
                      className="inline-flex items-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-900"
                    >
                      Détails
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
