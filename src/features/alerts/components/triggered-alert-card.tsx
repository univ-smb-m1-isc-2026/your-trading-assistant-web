/**
 * Carte d'un déclenchement d'alerte (historique).
 *
 * Style temporel :
 *   - Aujourd'hui → couleurs vives (fond bleu/vert/rouge clair, texte sombre)
 *   - Plus de 1 jour → couleurs pastelles/atténuées (fond slate, texte grisé)
 *
 * Pourquoi comparer les dates côté client plutôt que via un flag du backend ?
 *   → Le backend ne fournit pas de flag "isToday". Comparer triggeredAt avec
 *   la date du jour est trivial et évite une modification backend.
 *   Le fuseau horaire utilisé est celui du navigateur (cohérent avec l'UX).
 */

import { cn } from '@/utils/cn'
import type { TriggeredAlert } from '@/types/api'

interface TriggeredAlertCardProps {
  triggered: TriggeredAlert
}

/**
 * Retourne true si la date ISO est aujourd'hui (dans le fuseau local).
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

function formatAlertType(type: string): string {
  if (type === 'PRICE_THRESHOLD') return 'Prix'
  if (type === 'VOLUME_THRESHOLD') return 'Volume'
  return 'MA Cross'
}

export function TriggeredAlertCard({ triggered }: TriggeredAlertCardProps) {
  const today = isToday(triggered.triggeredAt)
  const isMACross = triggered.type === 'MA_CROSSOVER'

  return (
    <div className={cn(
      'rounded-lg border p-4 transition-colors',
      today
        ? triggered.direction === 'ABOVE'
          ? 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20'
          : 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20'
        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Icône direction */}
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
            today
              ? triggered.direction === 'ABOVE'
                ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-300'
                : 'bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-300'
              : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
          )}>
            {triggered.direction === 'ABOVE' ? '↑' : '↓'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-sm font-semibold',
                today
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400',
              )}>
                {triggered.symbol}
              </span>
              <span className={cn(
                'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                today
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500',
              )}>
                {formatAlertType(triggered.type)}
              </span>
            </div>

            <div className={cn(
              'mt-0.5 font-mono text-xs',
              today
                ? 'text-slate-700 dark:text-slate-300'
                : 'text-slate-400 dark:text-slate-500',
            )}>
              {isMACross ? (
                <div className="flex flex-col gap-0.5">
                  <span>
                    {triggered.alert.maType}({triggered.alert.shortPeriod}) croise {triggered.direction === 'ABOVE' ? 'au-dessus de' : 'en-dessous de'} {triggered.alert.maType}({triggered.alert.longPeriod})
                  </span>
                  <span className="font-semibold">
                    Prix : {triggered.triggeredValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $
                  </span>
                </div>
              ) : (
                <span>
                  Seuil : {triggered.thresholdValue?.toLocaleString('fr-FR')}
                  {' → '}
                  Valeur : {triggered.triggeredValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Date/heure de déclenchement */}
        <div className="text-right">
          <p className={cn(
            'text-xs font-medium',
            today
              ? 'text-slate-700 dark:text-slate-300'
              : 'text-slate-400 dark:text-slate-500',
          )}>
            {new Date(triggered.triggeredAt).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: today ? undefined : 'numeric',
            })}
          </p>
          <p className={cn(
            'text-[10px]',
            today
              ? 'text-slate-600 dark:text-slate-400'
              : 'text-slate-400 dark:text-slate-600',
          )}>
            {new Date(triggered.triggeredAt).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
