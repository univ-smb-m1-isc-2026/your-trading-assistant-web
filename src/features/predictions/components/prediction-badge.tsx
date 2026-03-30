import { cn } from '@/utils/cn'
import { usePredictionHealth } from '../hooks/use-prediction-health'

export function PredictionBadge({ className }: { className?: string }) {
  const { health, isLoading } = usePredictionHealth()

  const isOk = health?.status === 'ok'

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium',
        isLoading ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
        isOk ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        className
      )}
    >
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          isLoading ? 'bg-slate-400 animate-pulse' :
          isOk ? 'bg-green-500' : 'bg-red-500'
        )}
      />
      {isLoading ? 'Vérification...' : isOk ? 'IA Opérationnelle' : 'IA Indisponible'}
    </div>
  )
}
