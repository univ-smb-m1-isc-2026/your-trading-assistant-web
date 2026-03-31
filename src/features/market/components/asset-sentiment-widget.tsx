import { useAssetSentiment } from '../hooks/use-asset-sentiment'
import { cn } from '@/utils/cn'

interface AssetSentimentWidgetProps {
  symbol: string
  className?: string
}

export function AssetSentimentWidget({ symbol, className }: AssetSentimentWidgetProps) {
  const { poll, userVote, loading, vote } = useAssetSentiment(symbol)

  if (loading && !poll) {
    return (
      <div className={cn("rounded-xl border border-slate-300 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 animate-pulse", className)}>
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-4"></div>
        <div className="flex gap-3 mb-4">
          <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-12 flex-1 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        </div>
        <div className="flex justify-between mb-2">
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
        </div>
        <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
    )
  }

  // Fallback si pas de poll (erreur API ou jamais de vote)
  const bullishPct = poll?.bullishPercentage ?? 0
  const bearishPct = poll?.totalVotes ? 100 - bullishPct : 0
  const totalVotes = poll?.totalVotes ?? 0
  const bullishCount = poll?.bullishCount ?? 0
  const bearishCount = poll?.bearishCount ?? 0

  return (
    <div className={cn("rounded-xl border border-slate-300 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sentiment de la communauté</h2>
      </div>

      <div className="mb-5 flex gap-3">
        <button
          onClick={() => vote('BULLISH')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all",
            "hover:opacity-90 active:scale-[0.98]",
            // Si l'utilisateur a voté Bearish, on estompe Bullish
            userVote === 'BEARISH' 
              ? "bg-green-500/30 text-green-700 dark:text-green-300 opacity-60" 
              : "bg-green-500"
          )}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
            <polyline points="16 7 22 7 22 13" />
          </svg>
          Bullish
        </button>
        <button
          onClick={() => vote('BEARISH')}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white transition-all",
            "hover:opacity-90 active:scale-[0.98]",
            // Si l'utilisateur a voté Bullish, on estompe Bearish
            userVote === 'BULLISH' 
              ? "bg-red-500/30 text-red-700 dark:text-red-300 opacity-60" 
              : "bg-red-500"
          )}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
            <polyline points="16 17 22 17 22 11" />
          </svg>
          Bearish
        </button>
      </div>

      {userVote ? (
        <>
          <div className="flex items-center justify-between mb-2 px-1 text-xs font-medium">
            <span className="text-green-600 dark:text-green-500">
              {bullishPct.toFixed(0)}% ({bullishCount} votes)
            </span>
            <span className="text-red-600 dark:text-red-500">
              {bearishPct.toFixed(0)}% ({bearishCount} votes)
            </span>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            {totalVotes === 0 ? (
              // Barre grise si aucun vote
              <div className="absolute inset-0 bg-slate-300 dark:bg-slate-600" />
            ) : (
              <>
                {/* Partie Bullish (Vert) */}
                <div 
                  className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500 ease-out"
                  style={{ width: `${bullishPct}%` }}
                />
                {/* Partie Bearish (Rouge) */}
                <div 
                  className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-500 ease-out"
                  style={{ width: `${bearishPct}%` }}
                />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-2 text-sm text-slate-500 dark:text-slate-400 italic">
          Votez pour voir l'avis de la communauté
        </div>
      )}
    </div>
  )
}
