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

import { useState, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'
import type { Alert, AlertType, AlertDirection, UpdateAlertRequest } from '@/types/api'

interface AlertCardProps {
  alert: Alert
  onUpdate: (id: number, data: UpdateAlertRequest) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

function formatAlertType(type: AlertType): string {
  return type === 'PRICE_THRESHOLD' ? 'Prix' : 'Volume'
}

function formatDirection(direction: AlertDirection): string {
  return direction === 'ABOVE' ? 'Hausse' : 'Baisse'
}

export function AlertCard({ alert, onUpdate, onDelete }: AlertCardProps) {
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── État d'édition ──────────────────────────────────────────────
  const [editType, setEditType] = useState<AlertType>(alert.type)
  const [editDirection, setEditDirection] = useState<AlertDirection>(alert.direction)
  const [editThreshold, setEditThreshold] = useState(String(alert.thresholdValue))
  const [editRecurring, setEditRecurring] = useState(alert.recurring)
  const [editError, setEditError] = useState<string | null>(null)

  // Cleanup du timer de confirmation au démontage
  useEffect(() => {
    return () => {
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
    }
  }, [])

  function handleStartEdit() {
    setEditType(alert.type)
    setEditDirection(alert.direction)
    setEditThreshold(String(alert.thresholdValue))
    setEditRecurring(alert.recurring)
    setEditError(null)
    setEditing(true)
  }

  function handleCancelEdit() {
    setEditing(false)
    setEditError(null)
  }

  async function handleSaveEdit() {
    setEditError(null)
    const value = parseFloat(editThreshold)
    if (isNaN(value) || value <= 0) {
      setEditError('Le seuil doit être un nombre positif.')
      return
    }

    setSubmitting(true)
    try {
      const data: UpdateAlertRequest = {}
      if (editType !== alert.type) data.type = editType
      if (editDirection !== alert.direction) data.direction = editDirection
      if (value !== alert.thresholdValue) data.thresholdValue = value
      if (editRecurring !== alert.recurring) data.recurring = editRecurring

      // Ne rien envoyer si rien n'a changé
      if (Object.keys(data).length > 0) {
        await onUpdate(alert.id, data)
      }
      setEditing(false)
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Erreur lors de la modification.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleDeleteClick() {
    if (confirming) {
      // Deuxième clic = confirmation
      if (confirmTimer.current) clearTimeout(confirmTimer.current)
      setConfirming(false)
      setSubmitting(true)
      void onDelete(alert.id).finally(() => setSubmitting(false))
    } else {
      // Premier clic = passage en mode confirmation
      setConfirming(true)
      confirmTimer.current = setTimeout(() => {
        setConfirming(false)
      }, 3000)
    }
  }

  async function handleToggleActive() {
    setSubmitting(true)
    try {
      await onUpdate(alert.id, { active: !alert.active })
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Mode édition ────────────────────────────────────────────────
  if (editing) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 dark:border-primary/20 dark:bg-primary/10">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-primary">Modification</span>
          <div className="flex gap-2">
            <button
              onClick={handleCancelEdit}
              className="rounded px-2 py-1 text-xs text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            >
              Annuler
            </button>
            <button
              onClick={() => void handleSaveEdit()}
              disabled={submitting}
              className="rounded bg-primary px-2 py-1 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? '...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Type */}
          <div className="flex overflow-hidden rounded border border-slate-300 dark:border-slate-700">
            {([
              { value: 'PRICE_THRESHOLD' as const, label: 'Prix' },
              { value: 'VOLUME_THRESHOLD' as const, label: 'Volume' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEditType(opt.value)}
                className={cn(
                  'flex-1 px-2 py-1 text-xs font-semibold transition-colors',
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
              { value: 'ABOVE' as const, label: '↑ Hausse' },
              { value: 'BELOW' as const, label: '↓ Baisse' },
            ]).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setEditDirection(opt.value)}
                className={cn(
                  'flex-1 px-2 py-1 text-xs font-semibold transition-colors',
                  editDirection === opt.value
                    ? opt.value === 'ABOVE' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    : 'bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Seuil */}
          <input
            type="number"
            step="any"
            value={editThreshold}
            onChange={(e) => setEditThreshold(e.target.value)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-primary dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          {/* Récurrente */}
          <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={editRecurring}
              onChange={(e) => setEditRecurring(e.target.checked)}
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
              {formatAlertType(alert.type)} {formatDirection(alert.direction).toLowerCase()}
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
          <p className="mt-0.5 font-mono text-xs text-slate-600 dark:text-slate-400">
            Seuil : {alert.thresholdValue.toLocaleString('fr-FR')}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Toggle actif/inactif */}
        <button
          onClick={() => void handleToggleActive()}
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
          onClick={handleStartEdit}
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
          onClick={handleDeleteClick}
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
