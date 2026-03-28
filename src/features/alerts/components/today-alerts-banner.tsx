/**
 * Bandeau des alertes déclenchées aujourd'hui — affiché sur le dashboard.
 *
 * Ce composant est conçu pour être compact et non intrusif :
 *   - S'il n'y a aucune alerte aujourd'hui → ne rend rien (null)
 *   - S'il y en a → affiche un bandeau avec icône cloche, compteur,
 *     aperçu des 3 premières, et lien "Voir tout" vers /alerts
 *
 * Pourquoi un composant séparé plutôt qu'inline dans AssetsPage ?
 *   → Le bandeau a sa propre logique (filtrage par date, hooks triggered
 *   alerts). L'extraire évite de surcharger AssetsPage et respecte la
 *   convention feature-based (le composant vit dans features/alerts/).
 */

import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTriggeredAlerts } from '../hooks/use-triggered-alerts'
import { cn } from '@/utils/cn'

/**
 * Retourne true si la date ISO est aujourd'hui (fuseau local).
 */
function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export function TodayAlertsBanner() {
  const { triggeredAlerts, loading } = useTriggeredAlerts()

  const todayAlerts = useMemo(
    () => triggeredAlerts.filter((t) => isToday(t.triggeredAt)),
    [triggeredAlerts],
  )

  // Ne rien rendre pendant le chargement ou si aucune alerte aujourd'hui
  if (loading || todayAlerts.length === 0) return null

  const preview = todayAlerts.slice(0, 3)
  const remaining = todayAlerts.length - preview.length

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-900/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icône cloche */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-800/40">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
              {todayAlerts.length} alerte{todayAlerts.length > 1 ? 's' : ''} déclenchée{todayAlerts.length > 1 ? 's' : ''} aujourd'hui
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              {preview.map((t) => (
                <Link
                  key={t.id}
                  to={`/assets/${t.symbol}`}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors hover:ring-1 hover:ring-amber-400',
                    t.direction === 'ABOVE'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
                  )}
                >
                  {t.direction === 'ABOVE' ? '↑' : '↓'} {t.symbol}
                </Link>
              ))}
              {remaining > 0 && (
                <span className="inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                  +{remaining} autre{remaining > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        <Link
          to="/alerts"
          className="shrink-0 rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-800/40"
        >
          Voir tout
        </Link>
      </div>
    </div>
  )
}
