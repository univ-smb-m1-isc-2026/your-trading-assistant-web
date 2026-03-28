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
import type { AlertType, AlertDirection, CreateAlertRequest, MAType } from '@/types/api'

interface AlertFormProps {
  symbol: string
  onSubmit: (data: CreateAlertRequest) => Promise<void>
}

export function AlertForm({ symbol, onSubmit }: AlertFormProps) {
  const [type, setType] = useState<AlertType>('PRICE_THRESHOLD')
  const [direction, setDirection] = useState<AlertDirection>('ABOVE')
  const [thresholdValue, setThresholdValue] = useState('')
  const [shortPeriod, setShortPeriod] = useState('8')
  const [longPeriod, setLongPeriod] = useState('50')
  const [maType, setMaType] = useState<MAType>('SMA')
  const [recurring, setRecurring] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    let payload: CreateAlertRequest = { symbol, type, direction, recurring }

    if (type === 'MA_CROSSOVER') {
      const sp = parseInt(shortPeriod, 10)
      const lp = parseInt(longPeriod, 10)

      if (isNaN(sp) || sp <= 0 || isNaN(lp) || lp <= 0) {
        setError('Les périodes doivent être des nombres positifs.')
        return
      }
      if (sp >= lp) {
        setError('La période courte doit être inférieure à la période longue.')
        return
      }
      payload = { ...payload, shortPeriod: sp, longPeriod: lp, maType }
    } else {
      const value = parseFloat(thresholdValue)
      if (isNaN(value) || value <= 0) {
        setError('Le seuil doit être un nombre positif.')
        return
      }
      payload = { ...payload, thresholdValue: value }
    }

    setSubmitting(true)
    try {
      await onSubmit(payload)
      // Reset du formulaire après succès
      setThresholdValue('')
      setRecurring(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création.')
    } finally {
      setSubmitting(false)
    }
  }

  const isMACross = type === 'MA_CROSSOVER'

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
        Nouvelle alerte pour {symbol}
      </h3>

      <div className="flex flex-col gap-5">
        {/* Type : Prix / Volume / MA Cross */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Type d'alerte
          </label>
          <div className="flex overflow-hidden rounded-lg border border-slate-300 p-0.5 bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50">
            {([
              { value: 'PRICE_THRESHOLD' as const, label: 'Prix' },
              { value: 'VOLUME_THRESHOLD' as const, label: 'Volume' },
              { value: 'MA_CROSSOVER' as const, label: 'MA Cross' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                title={opt.label}
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all duration-200',
                  type === opt.value
                    ? 'bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direction : Hausse / Baisse ou Golden / Death Cross */}
        <div>
          <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Condition
          </label>
          <div className="flex gap-2">
            {([
              { 
                value: 'ABOVE' as const, 
                label: isMACross ? 'Golden Cross' : 'Franchissement Hausse', 
                icon: '↑' 
              },
              { 
                value: 'BELOW' as const, 
                label: isMACross ? 'Death Cross' : 'Franchissement Baisse', 
                icon: '↓' 
              },
            ]).map((opt) => {
              const isSelected = direction === opt.value
              const isAbove = opt.value === 'ABOVE'
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDirection(opt.value)}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all duration-200 flex items-center justify-center gap-2',
                    isSelected
                      ? isAbove
                        ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'border-red-600 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-700',
                  )}
                >
                  <span className={cn('text-sm', isSelected && isAbove ? 'text-green-600 dark:text-green-400' : isSelected && !isAbove ? 'text-red-600 dark:text-red-400' : 'text-slate-400')}>{opt.icon}</span> 
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Champs conditionnels */}
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
          {!isMACross ? (
            /* Seuil (Prix/Volume) */
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                Valeur cible ({type === 'PRICE_THRESHOLD' ? 'Prix' : 'Volume'})
              </label>
              <div className="relative">
                {type === 'PRICE_THRESHOLD' && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">$</span>
                )}
                <input
                  type="number"
                  step="any"
                  value={thresholdValue}
                  onChange={(e) => setThresholdValue(e.target.value)}
                  placeholder={type === 'PRICE_THRESHOLD' ? 'Ex: 100000' : 'Ex: 1000000'}
                  className={cn(
                    "w-full rounded-lg border border-slate-300 bg-white py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-primary",
                    type === 'PRICE_THRESHOLD' ? "pl-7 pr-3" : "px-3"
                  )}
                />
              </div>
            </div>
          ) : (
            /* Paramètres MA Cross */
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Période Courte
                  </label>
                  <input
                    type="number"
                    value={shortPeriod}
                    onChange={(e) => setShortPeriod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                    Période Longue
                  </label>
                  <input
                    type="number"
                    value={longPeriod}
                    onChange={(e) => setLongPeriod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">
                  Type de Moyenne Mobile
                </label>
                <select
                  value={maType}
                  onChange={(e) => setMaType(e.target.value as MAType)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-primary"
                >
                  <option value="SMA">SMA (Simple)</option>
                  <option value="EMA">EMA (Exponentielle)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Récurrente + bouton submit */}
        <div className="pt-2 flex flex-col gap-4">
          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-900"
            />
            <div>
              <span className="font-medium block">Alerte récurrente</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">L'alerte ne sera pas désactivée après déclenchement</span>
            </div>
          </label>
          
          <button
            type="submit"
            disabled={submitting || (!isMACross && !thresholdValue)}
            className={cn(
              'w-full rounded-lg px-4 py-3 text-sm font-bold transition-all flex justify-center items-center',
              submitting || (!isMACross && !thresholdValue)
                ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                : 'bg-primary text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-[0.98]',
            )}
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : 'Créer l\'alerte'}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </form>
  )
}
