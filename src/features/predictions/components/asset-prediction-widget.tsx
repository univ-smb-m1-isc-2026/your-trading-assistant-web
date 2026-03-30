import { cn } from '@/utils/cn'
import { useAssetPredictions } from '../hooks/use-asset-predictions'
import { useBacktestSingleAsset } from '../hooks/use-backtest-single-asset'

interface AssetPredictionWidgetProps {
  symbol: string
  className?: string
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

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  )
}

// Helper to format date nicely
function formatDateLabel(dateString: string) {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) return "Aujourd'hui"
  if (date.toDateString() === yesterday.toDateString()) return "Hier"
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function AssetPredictionWidget({ symbol, className }: AssetPredictionWidgetProps) {
  const { predictions, isLoading, error } = useAssetPredictions(symbol)
  // On récupère les stats de l'actif sur les 30 derniers jours par défaut pour la jauge de fiabilité
  const today = new Date()
  const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30))
  const { stats: backtestStats } = useBacktestSingleAsset(symbol, thirtyDaysAgo.toISOString().split('T')[0])

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900", className)}>
        <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Prédiction IA</h2>
        </div>
      </div>

        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (error || predictions.length === 0) {
    return null; // Don't show the widget if there are no predictions or an error occurs to not clutter the UI
  }

  const currentPred = predictions[0]
  const historyPreds = predictions.slice(1, 4) // Show up to 3 older predictions
  
  const isUp = currentPred.predictedVariationPct >= 0
  const colorClass = isUp ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
  const bgClass = isUp ? 'bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800' : 'bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800'
  const iconBoxClass = isUp ? 'bg-green-600 text-white dark:bg-green-500' : 'bg-red-600 text-white dark:bg-red-500'

  return (
    <div className={cn("flex flex-col gap-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Prédiction IA</h2>
      </div>

      {/* Bannière de Fiabilité */}
      {backtestStats && (
        <div className="flex items-center flex-wrap gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm dark:bg-slate-800">
          <span className="text-slate-500 dark:text-slate-400">💡 Fiabilité 30J :</span>
          <span className={cn(
            "font-semibold",
            backtestStats.successRatePct >= 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          )}>
            {backtestStats.successRatePct.toFixed(1)}% succès
          </span>
          <span 
            className="text-xs font-medium text-blue-600 dark:text-blue-400 cursor-help"
            title="Taux de réussite potentiel si la position avait été fermée au meilleur moment de la journée (indique des opportunités de gain en cours de journée, même si la clôture était défavorable)."
          >
            (Max: {backtestStats.maxPotentialSuccessRatePct.toFixed(1)}%)
          </span>
          <span className="text-xs text-slate-400">
            | Err: {backtestStats.meanAbsoluteErrorPct.toFixed(1)}%
          </span>
        </div>
      )}

      <div className={cn("flex flex-col gap-3 rounded-lg border p-5", bgClass)}>
        <div className="flex items-center justify-between">
          <span className={cn("text-sm font-medium", colorClass)}>
            {formatDateLabel(currentPred.date)}
          </span>
          <SparklesIcon className={cn("h-4 w-4", colorClass)} />
        </div>
        <div className="flex items-center gap-3">
          <div className={cn("flex rounded-lg p-2", iconBoxClass)}>
            {isUp ? <TrendingUpIcon className="h-6 w-6" /> : <TrendingDownIcon className="h-6 w-6" />}
          </div>
          <span className={cn("text-3xl font-bold tracking-tight", colorClass)}>
            {currentPred.predictedVariationPct > 0 ? '+' : ''}{(currentPred.predictedVariationPct).toFixed(2)}%
          </span>
        </div>
      </div>

      {historyPreds.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Historique récent</h3>
          <div className="flex flex-col">
            {historyPreds.map((pred, index) => {
              const isHistUp = pred.predictedVariationPct >= 0
              const histColor = isHistUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              
              return (
                <div 
                  key={pred.id} 
                  className={cn(
                    "flex items-center justify-between py-2",
                    index < historyPreds.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""
                  )}
                >
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {formatDateLabel(pred.date)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={cn("text-sm font-semibold", histColor)}>
                      {pred.predictedVariationPct > 0 ? '+' : ''}{(pred.predictedVariationPct).toFixed(2)}%
                    </span>
                    
                    {/* Affichage visible de l'erreur absolue */}
                    {pred.absoluteError !== undefined && pred.absoluteError !== null && (
                      <span className="text-base font-bold text-slate-500 dark:text-slate-400">
                        Err: {pred.absoluteError}%
                      </span>
                    )}

                    {/* Indicateur de succès réel (si la date est passée et évaluée) */}
                    {pred.isSuccess !== undefined && pred.isSuccess !== null ? (
                      <span>
                        {pred.isSuccess ? '✅' : '❌'}
                      </span>
                    ) : (
                      // Sinon, on garde l'icône de direction
                      isHistUp ? (
                        <TrendingUpIcon className={cn("h-3.5 w-3.5", histColor)} />
                      ) : (
                        <TrendingDownIcon className={cn("h-3.5 w-3.5", histColor)} />
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
