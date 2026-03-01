/**
 * Page : Alertes — historique des déclenchements + gestion des alertes actives.
 *
 * Deux modes contrôlés par un toggle (icône roue crantée dans le header) :
 *
 *   1. Mode Historique (par défaut) :
 *      Liste des alertes déclenchées, triée par triggeredAt desc.
 *      - Aujourd'hui → couleurs vives (vert hausse, rouge baisse)
 *      - Plus de 1 jour → couleurs pastelles/atténuées
 *
 *   2. Mode Gestion :
 *      Liste des alertes configurées (actives + inactives).
 *      - Actions : modifier, supprimer, toggle actif/inactif
 *      - La roue crantée est en surbrillance pour indiquer le mode
 *
 * Pourquoi un toggle plutôt que deux onglets ?
 *   → L'historique est la vue la plus utile au quotidien. La gestion
 *   est une action ponctuelle. Un toggle discret (roue crantée) cache
 *   la complexité et garde l'UI propre. L'utilisateur comprend
 *   instinctivement qu'il "entre dans les réglages".
 */

import { useState } from 'react'
import { useAlerts } from '../hooks/use-alerts'
import { useTriggeredAlerts } from '../hooks/use-triggered-alerts'
import { AlertCard } from '../components/alert-card'
import { TriggeredAlertCard } from '../components/triggered-alert-card'
import { cn } from '@/utils/cn'

export function AlertsPage() {
  const { alerts, loading: alertsLoading, error: alertsError, update, remove } = useAlerts()
  const { triggeredAlerts, loading: triggeredLoading, error: triggeredError } = useTriggeredAlerts()

  /** true = mode gestion, false = mode historique */
  const [managementMode, setManagementMode] = useState(false)

  const loading = alertsLoading || triggeredLoading
  const error = alertsError ?? triggeredError

  // Compteurs pour le header
  const activeCount = alerts.filter((a) => a.active).length

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-primary dark:border-slate-700 dark:border-t-primary" />
          <p className="text-sm text-slate-600 dark:text-slate-400">Chargement des alertes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">Erreur : {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {managementMode ? 'Gérer mes alertes' : 'Alertes'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {managementMode
              ? `${alerts.length} alerte${alerts.length > 1 ? 's' : ''} configurée${alerts.length > 1 ? 's' : ''} — ${activeCount} active${activeCount > 1 ? 's' : ''}`
              : `${triggeredAlerts.length} déclenchement${triggeredAlerts.length > 1 ? 's' : ''} au total`}
          </p>
        </div>

        {/* Roue crantée — toggle mode gestion */}
        <button
          onClick={() => setManagementMode(!managementMode)}
          title={managementMode ? 'Voir l\'historique' : 'Gérer mes alertes'}
          className={cn(
            'rounded-lg p-2.5 transition-colors',
            managementMode
              ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
          )}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* ─── Mode Gestion ─────────────────────────────────────────────── */}
      {managementMode && (
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <svg viewBox="0 0 24 24" className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Aucune alerte configurée. Créez votre première alerte depuis la page d'un actif.
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onUpdate={update}
                onDelete={remove}
              />
            ))
          )}
        </div>
      )}

      {/* ─── Mode Historique ──────────────────────────────────────────── */}
      {!managementMode && (
        <div className="space-y-3">
          {triggeredAlerts.length === 0 ? (
            <div className="rounded-xl border border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
              <svg viewBox="0 0 24 24" className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Aucun déclenchement enregistré. Vos alertes apparaîtront ici lorsqu'elles se déclencheront.
              </p>
            </div>
          ) : (
            triggeredAlerts.map((triggered) => (
              <TriggeredAlertCard key={triggered.id} triggered={triggered} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
