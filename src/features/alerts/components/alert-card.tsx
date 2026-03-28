/**
 * Carte d'une alerte active — affichage + actions edit/delete.
 *
 * Fonctionnalités :
 *   - Affiche le type (Prix/Volume), la direction (↑/↓), le seuil,
 *     le statut (actif/inactif), et si elle est récurrente
 *   - Mode édition inline : les champs deviennent modifiables
 *   - Suppression avec confirmation inline : le bouton se transforme
 *     en "Confirmer ?" pendant 3 secondes, puis revient à "Supprimer"
 *
 * Pourquoi la confirmation inline plutôt qu'un modal ?
 *   → Plus léger, pas besoin de portal/overlay. L'utilisateur voit
 *   directement le contexte (quelle alerte il supprime). Le timeout
 *   de 3 secondes est un bon compromis entre sécurité et rapidité.
 */

import { cn } from '@/utils/cn'
import type { Alert, AlertType, AlertDirection, UpdateAlertRequest, MAType } from '@/types/api'
import { useAlertCard } from '../hooks/use-alert-card'

interface AlertCardProps {
  alert: Alert
  onUpdate: (id: number, data: UpdateAlertRequest) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

function formatAlertType(type: AlertType): string {
  if (type === 'PRICE_THRESHOLD') return 'Prix'
  if (type === 'VOLUME_THRESHOLD') return 'Volume'
  return 'MA Crossover'
}

function formatDirection(direction: AlertDirection, type: AlertType): string {
  if (type === 'MA_CROSSOVER') {
    return direction === 'ABOVE' ? 'Golden Cross' : 'Death Cross'
  }
  return direction === 'ABOVE' ? 'Hausse' : 'Baisse'
}

export function AlertCard({ alert, onUpdate, onDelete }: AlertCardProps) {
  const {
    editing,
    confirming,
    submitting,
    editForm,
    setField,
    handlers,
  } = useAlertCard({ alert, onUpdate, onDelete })

  const { 
    type: editType, 
    direction: editDirection, 
    threshold: editThreshold, 
    shortPeriod: editShortPeriod,
    longPeriod: editLongPeriod,
    maType: editMaType,
    recurring: editRecurring, 
    error: editError 
  } = editForm
  const { setType, setDirection, setThreshold, setShortPeriod, setLongPeriod, setMaType, setRecurring } = setField
  const { startEdit, cancelEdit, saveEdit, deleteClick, toggleActive } = handlers

  const isMACross = alert.type === 'MA_CROSSOVER'
  const isEditingMACross = editType === 'MA_CROSSOVER'

  // ─── Mode édition ────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">Modification</span>
          <div className="flex gap-2">
            <button
              onClick={cancelEdit}
              className="rounded px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              onClick={() => void saveEdit()}
              disabled={submitting}
              className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Type */}
          <div className="flex overflow-hidden rounded border border-slate-300 dark:border-slate-700">
            {([
              { value: 'PRICE_THRESHOLD' as const, label: 'Prix' },
              { value: 'VOLUME_THRESHOLD' as const, label: 'Volume' },
              { value: 'MA_CROSSOVER' as const, label: 'MA Cross' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={cn(
                  'flex-1 px-2 py-1 text-[10px] font-semibold transition-colors sm:text-xs',
                  editType === opt.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Direction */}
          <div className="flex overflow-hidden rounded border border-slate-300 dark:border-slate-700">
            {([
              { 
                value: 'ABOVE' as const, 
                label: isEditingMACross ? 'Golden Cross' : 'Hausse' 
              },
              { 
                value: 'BELOW' as const, 
                label: isEditingMACross ? 'Death Cross' : 'Baisse' 
              },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDirection(opt.value)}
                className={cn(
                  'flex-1 px-2 py-1 text-[10px] font-semibold transition-colors sm:text-xs',
                  editDirection === opt.value
                    ? opt.value === 'ABOVE' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Champs conditionnels */}
          {!isEditingMACross ? (
            <input
              type="number"
              step="any"
              value={editThreshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={editShortPeriod}
                  onChange={(e) => setShortPeriod(e.target.value)}
                  placeholder="Courte"
                  className="w-1/2 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="number"
                  value={editLongPeriod}
                  onChange={(e) => setLongPeriod(e.target.value)}
                  placeholder="Longue"
                  className="w-1/2 rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <select
                value={editMaType}
                onChange={(e) => setMaType(e.target.value as MAType)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="SMA">SMA</option>
                <option value="EMA">EMA</option>
              </select>
            </>
          )}

          {/* Récurrente */}
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={editRecurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600"
            />
            Récurrente
          </label>
        </div>

        {editError && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400">{editError}</p>
        )}
      </div>
    )
  }

  // ─── Mode affichage ──────────────────────────────────────────────
  return (
    <div className={cn(
      'flex items-center justify-between rounded-lg border p-4 transition-colors',
      alert.active
        ? 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800/50'
        : 'border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-900/50',
    )}>
      <div className="flex items-center gap-3">
        {/* Icône direction */}
        <div className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
          alert.direction === 'ABOVE'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        )}>
          {alert.direction === 'ABOVE' ? '↑' : '↓'}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {!isMACross ? (
                `${formatAlertType(alert.type)} ${formatDirection(alert.direction, alert.type).toLowerCase()}`
              ) : (
                `${alert.maType}(${alert.shortPeriod}) croise ${alert.direction === 'ABOVE' ? 'au-dessus de' : 'en-dessous de'} ${alert.maType}(${alert.longPeriod})`
              )}
            </span>
            {/* Badge récurrente */}
            {alert.recurring && (
              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                Récurrente
              </span>
            )}
            {/* Badge actif/inactif */}
            <span className={cn(
              'rounded px-1.5 py-0.5 text-[10px] font-semibold',
              alert.active
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
            )}>
              {alert.active ? 'Active' : 'Inactive'}
            </span>
          </div>
          {!isMACross && (
            <p className="mt-0.5 font-mono text-xs text-slate-600 dark:text-slate-400">
              Seuil : {alert.thresholdValue?.toLocaleString('fr-FR')}
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Toggle actif/inactif */}
        <button
          onClick={() => void toggleActive()}
          disabled={submitting}
          title={alert.active ? 'Désactiver' : 'Réactiver'}
          className="rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          {alert.active ? (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>

        {/* Modifier */}
        <button
          onClick={startEdit}
          disabled={submitting}
          title="Modifier"
          className="rounded p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Supprimer — avec confirmation inline */}
        <button
          onClick={deleteClick}
          disabled={submitting}
          title={confirming ? 'Cliquer pour confirmer' : 'Supprimer'}
          className={cn(
            'rounded px-2 py-1.5 text-xs font-medium transition-colors',
            confirming
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950 dark:hover:text-red-400',
          )}
        >
          {confirming ? 'Confirmer ?' : (
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3,6 5,6 21,6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
