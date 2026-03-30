import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useBacktestGlobal } from '../hooks/use-backtest-global'
import { useBacktestAssets } from '../hooks/use-backtest-assets'

type TimeFilter = '7J' | '30J' | '6M' | 'TOUT'

function getStartDate(filter: TimeFilter): string | undefined {
  if (filter === 'TOUT') return undefined
  
  const date = new Date()
  if (filter === '7J') date.setDate(date.getDate() - 7)
  else if (filter === '30J') date.setDate(date.getDate() - 30)
  else if (filter === '6M') date.setMonth(date.getMonth() - 6)
  
  return date.toISOString().split('T')[0]
}

export function BacktestPage() {
  const [filter, setFilter] = useState<TimeFilter>('30J')
  const startDate = getStartDate(filter)
  
  const { stats: globalStats, isLoading: globalLoading } = useBacktestGlobal(startDate)
  const { stats: assetsStats, isLoading: assetsLoading } = useBacktestAssets(startDate)

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-12">
      {/* En-tête */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Performances de l'IA
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Évaluation des prédictions passées (Backtesting)
          </p>
        </div>
        
        {/* Sélecteur de période (Pills) */}
        <div className="flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {(['7J', '30J', '6M', 'TOUT'] as TimeFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                filter === f 
                  ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cartes KPI Globales */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* KPI 1 : Total Prédictions */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total des prédictions évaluées</h3>
          {globalLoading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
              {globalStats?.totalPredictions || 0}
            </p>
          )}
        </div>

        {/* KPI 2 : Taux de réussite */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Taux de réussite global</h3>
          {globalLoading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ) : (
            <div className="mt-2 flex flex-col gap-1">
              <p className={cn(
                "text-3xl font-bold",
                (globalStats?.successRatePct || 0) >= 50 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {globalStats?.successRatePct.toFixed(1)}%
              </p>
              <p 
                className="text-sm text-slate-500 dark:text-slate-400 cursor-help"
                title="Taux de réussite potentiel si la position avait été fermée au meilleur moment de la journée (indique des opportunités de gain en cours de journée, même si la clôture était défavorable)."
              >
                Max potentiel : <span className="font-semibold text-blue-600 dark:text-blue-400">{globalStats?.maxPotentialSuccessRatePct.toFixed(1)}%</span>
              </p>
            </div>
          )}
        </div>

        {/* KPI 3 : Erreur absolue moyenne */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Marge d'erreur moyenne</h3>
          {globalLoading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          ) : (
            <p className="mt-2 text-3xl font-bold text-slate-700 dark:text-slate-300">
              {globalStats?.meanAbsoluteErrorPct.toFixed(2)}%
            </p>
          )}
        </div>
      </div>

      {/* Tableau par Actif */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <h2 className="font-semibold text-slate-900 dark:text-white">Classement par Actif</h2>
        </div>
        
        {assetsLoading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : assetsStats.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            Aucune donnée de backtest disponible pour cette période.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Actif</th>
                  <th className="px-6 py-4 font-semibold text-right">Nb Prédictions</th>
                  <th className="px-6 py-4 font-semibold">Taux de réussite</th>
                  <th className="px-6 py-4 font-semibold text-right">Erreur Moyenne</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Tri par taux de réussite descendant */}
                {[...assetsStats].sort((a, b) => b.successRatePct - a.successRatePct).map((stat) => {
                  const hue = stat.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) * 35 % 360
                  const isGood = stat.successRatePct >= 50
                  
                  return (
                    <tr key={stat.symbol} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white font-bold text-xs"
                            style={{ backgroundColor: `hsl(${hue}, 70%, 50%)` }}
                          >
                            {stat.symbol.slice(0, 2)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {stat.symbol}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {stat.totalPredictions}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={cn(
                              "font-bold",
                              isGood ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {stat.successRatePct.toFixed(1)}%
                            </span>
                            <span 
                              className="text-xs text-blue-600 dark:text-blue-400 font-medium cursor-help"
                              title="Taux de réussite potentiel si la position avait été fermée au meilleur moment de la journée (indique des opportunités de gain en cours de journée, même si la clôture était défavorable)."
                            >
                              Max: {stat.maxPotentialSuccessRatePct.toFixed(1)}%
                            </span>
                          </div>
                          {/* Barre de progression visuelle empilée */}
                          <div className="h-2 w-full min-w-[100px] overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 flex">
                            <div 
                              className={cn("h-full", isGood ? "bg-green-500" : "bg-red-500")}
                              style={{ width: `${Math.min(100, Math.max(0, stat.successRatePct))}%` }}
                            />
                            <div 
                              className="h-full bg-blue-400/50 dark:bg-blue-500/50 striped-bg"
                              style={{ width: `${Math.max(0, Math.min(100, stat.maxPotentialSuccessRatePct) - stat.successRatePct)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {stat.meanAbsoluteErrorPct.toFixed(2)}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
