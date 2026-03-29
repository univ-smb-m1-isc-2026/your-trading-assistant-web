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

import { Link } from 'react-router-dom'
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
      'flex items-start gap-3 rounded-lg border p-4 transition-colors shadow-sm',
      today
        ? triggered.direction === 'ABOVE'
          ? 'border-green-200 bg-green-50 dark:border-green-800/50 dark:bg-green-900/20'
          : 'border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-900/20'
        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/30',
    )}>
      {/* Icône direction */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
        today
          ? triggered.direction === 'ABOVE'
            ? 'bg-green-200 text-green-800 dark:bg-green-800/50 dark:text-green-300'
            : 'bg-red-200 text-red-800 dark:bg-red-800/50 dark:text-red-300'
          : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
      )}>
        {triggered.direction === 'ABOVE' ? '↑' : '↓'}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 min-w-0">
        {/* Ligne 1 : Symbole + Type */}
        <div className="flex items-center justify-between gap-2">
          <Link
            to={`/assets/${triggered.symbol}`}
            className={cn(
              'text-sm font-bold transition-colors hover:text-primary dark:hover:text-blue-400 truncate',
              today
                ? 'text-primary dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400',
            )}
          >
            {triggered.symbol}
          </Link>
          <span className={cn(
            'rounded px-1.5 py-0.5 text-[10px] font-semibold shrink-0',
            today
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-500',
          )}>
            {formatAlertType(triggered.type)}
          </span>
        </div>

        {/* Ligne 2 : Description technique (EN DESSOUS du symbole) */}
        <p className={cn(
          'text-sm font-medium leading-snug break-words',
          today
            ? 'text-slate-700 dark:text-slate-200'
            : 'text-slate-500 dark:text-slate-400',
        )}>
          {isMACross ? (
            `${triggered.alert.maType}(${triggered.alert.shortPeriod}) croise ${triggered.direction === 'ABOVE' ? 'au-dessus de' : 'en-dessous de'} ${triggered.alert.maType}(${triggered.alert.longPeriod})`
          ) : (
            `${formatAlertType(triggered.type)} ${triggered.direction === 'ABOVE' ? 'hausse' : 'baisse'}`
          )}
        </p>

        {/* Ligne 3 : Footer (Valeurs + Horodatage) */}
        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="font-mono text-[11px] truncate">
            {isMACross ? (
              <span className={cn(today ? 'text-slate-900 dark:text-slate-300' : 'text-slate-500')}>
                Prix : <span className="font-bold">{triggered.triggeredValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</span>
              </span>
            ) : (
              <span className={cn(today ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500')}>
                Seuil <span className="font-semibold">{triggered.thresholdValue?.toLocaleString('fr-FR')}</span> → <span className="font-bold text-slate-900 dark:text-slate-200">{triggered.triggeredValue.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}</span>
              </span>
            )}
          </div>

          <div className="text-right shrink-0">
            <span className={cn(
              'text-[10px] font-medium',
              today ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500',
            )}>
              {new Date(triggered.triggeredAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              {', '}
              {new Date(triggered.triggeredAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
