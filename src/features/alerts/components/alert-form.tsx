/**
 * Formulaire de création d'alerte — toujours visible (inline).
 *
 * Props :
 *   - symbol : pré-rempli et non modifiable (on est sur la page d'un asset)
 *   - onSubmit : callback asynchrone qui reçoit un CreateAlertRequest
 *
 * Pourquoi l'état du formulaire est local (useState) et pas dans un store ?
 *   → Le formulaire est éphémère. Son état n'a pas besoin d'être partagé
 *   entre composants ni de persister entre navigations. useState est la
 *   solution la plus simple et la plus adaptée pour ce cas.
 *
 * Pourquoi un formulaire contrôlé (value + onChange) ?
 *   → Permet la validation en temps réel et le reset après soumission.
 *   Un formulaire non-contrôlé (ref) serait plus performant mais ne
 *   justifie pas la complexité supplémentaire pour 4 champs.
 */

import { useState } from 'react'
import { cn } from '@/utils/cn'
import type { AlertType, AlertDirection, CreateAlertRequest } from '@/types/api'

interface AlertFormProps {
  symbol: string
  onSubmit: (data: CreateAlertRequest) => Promise<void>
}

export function AlertForm({ symbol, onSubmit }: AlertFormProps) {
  const [type, setType] = useState<AlertType>('PRICE_THRESHOLD')
  const [direction, setDirection] = useState<AlertDirection>('ABOVE')
  const [thresholdValue, setThresholdValue] = useState('')
  const [recurring, setRecurring] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const value = parseFloat(thresholdValue)
    if (isNaN(value) || value <= 0) {
      setError('Le seuil doit être un nombre positif.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ symbol, type, direction, thresholdValue: value, recurring })
      // Reset du formulaire après succès
      setThresholdValue('')
      setRecurring(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Nouvelle alerte pour {symbol}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Type : Prix / Volume */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Type
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
            {([
              { value: 'PRICE_THRESHOLD' as const, label: 'Prix' },
              { value: 'VOLUME_THRESHOLD' as const, label: 'Volume' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-semibold transition-colors',
                  type === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direction : Hausse / Baisse */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Direction
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
            {([
              { value: 'ABOVE' as const, label: 'Hausse', icon: '↑' },
              { value: 'BELOW' as const, label: 'Baisse', icon: '↓' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDirection(opt.value)}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-semibold transition-colors',
                  direction === opt.value
                    ? opt.value === 'ABOVE'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800',
                )}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Seuil */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
            Seuil
          </label>
          <input
            type="number"
            step="any"
            value={thresholdValue}
            onChange={(e) => setThresholdValue(e.target.value)}
            placeholder={type === 'PRICE_THRESHOLD' ? 'Ex: 100000' : 'Ex: 1000000'}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary"
          />
        </div>

        {/* Récurrente + bouton submit */}
        <div className="flex flex-col justify-end gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600"
            />
            <span className="font-medium">Récurrente</span>
          </label>
          <button
            type="submit"
            disabled={submitting || !thresholdValue}
            className={cn(
              'rounded-lg px-4 py-2 text-xs font-semibold transition-colors',
              submitting || !thresholdValue
                ? 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-600'
                : 'bg-primary text-white hover:bg-blue-700',
            )}
          >
            {submitting ? 'Création...' : 'Créer l\'alerte'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  )
}
