import { cn } from '@/utils/cn'

interface SuccessRateBarProps {
  successRatePct: number
  maxPotentialSuccessRatePct: number
  className?: string
}

export function SuccessRateBar({ successRatePct, maxPotentialSuccessRatePct, className }: SuccessRateBarProps) {
  const isGood = successRatePct >= 50

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className={cn(
          "font-bold",
          isGood ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
        )}>
          {successRatePct.toFixed(1)}%
        </span>
        <span 
          className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-help"
          title="Taux de réussite potentiel si la position avait été fermée au meilleur moment de la journée (indique des opportunités de gain en cours de journée, même si la clôture était défavorable)."
        >
          Max: {maxPotentialSuccessRatePct.toFixed(1)}%
        </span>
      </div>
      {/* Barre de progression visuelle empilée */}
      <div className="h-2 w-full min-w-[100px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
        <div 
          className={cn("h-full", isGood ? "bg-green-500" : "bg-red-500")}
          style={{ width: `${Math.min(100, Math.max(0, successRatePct))}%` }}
        />
        <div 
          className="h-full bg-blue-400/50 dark:bg-blue-500/50 striped-bg"
          style={{ width: `${Math.max(0, Math.min(100, maxPotentialSuccessRatePct) - successRatePct)}%` }}
        />
      </div>
    </div>
  )
}
