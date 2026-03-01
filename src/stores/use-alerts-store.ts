/**
 * Store Zustand pour les alertes utilisateur.
 *
 * Stocke deux collections :
 *   - alerts: les alertes configurées (actives + inactives)
 *   - triggeredAlerts: l'historique des déclenchements
 *
 * Pourquoi un seul store pour les deux ?
 *   → Ce sont deux facettes du même domaine. Les séparer créerait deux stores
 *   quasi-identiques (loaded flag, reset, etc.) sans bénéfice tangible.
 *
 * Pattern `loaded` (même principe que useFavoritesStore) :
 *   → Empêche les re-fetches inutiles lors de la navigation entre
 *   la page /alerts, la page asset-detail et le dashboard.
 *   Deux flags séparés car les deux collections sont indépendantes.
 *
 * Actions granulaires (addAlert, updateAlert, removeAlert) :
 *   → Permettent des mises à jour optimistes dans les hooks.
 *   Après un POST/PUT/DELETE réussi, le hook met à jour le store
 *   sans refaire un GET /alerts complet.
 *
 * reset() est appelé au logout (top-navbar.tsx) pour éviter la
 * persistance de données entre utilisateurs.
 */

import { create } from 'zustand'
import type { Alert, TriggeredAlert } from '@/types/api'

interface AlertsState {
  /** Liste des alertes configurées par l'utilisateur. */
  alerts: Alert[]
  /** true après le premier fetch GET /alerts réussi. */
  alertsLoaded: boolean

  /** Historique des alertes déclenchées. */
  triggeredAlerts: TriggeredAlert[]
  /** true après le premier fetch GET /alerts/triggered réussi. */
  triggeredLoaded: boolean

  /** Remplace toute la liste des alertes configurées. */
  setAlerts: (alerts: Alert[]) => void
  /** Ajoute une alerte (après POST /alerts réussi). */
  addAlert: (alert: Alert) => void
  /** Met à jour une alerte dans la liste (après PUT /alerts/{id} réussi). */
  updateAlert: (updated: Alert) => void
  /** Retire une alerte de la liste (après DELETE /alerts/{id} réussi). */
  removeAlert: (id: number) => void

  /** Remplace tout l'historique des déclenchements. */
  setTriggeredAlerts: (triggered: TriggeredAlert[]) => void

  /** Remet le store dans son état initial (appelé au logout). */
  reset: () => void
}

const initialState = {
  alerts: [] as Alert[],
  alertsLoaded: false,
  triggeredAlerts: [] as TriggeredAlert[],
  triggeredLoaded: false,
}

export const useAlertsStore = create<AlertsState>((set) => ({
  ...initialState,

  setAlerts: (alerts) => set({ alerts, alertsLoaded: true }),

  addAlert: (alert) =>
    set((state) => ({ alerts: [...state.alerts, alert] })),

  updateAlert: (updated) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === updated.id ? updated : a)),
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
      // Retire aussi les déclenchements associés à cette alerte
      triggeredAlerts: state.triggeredAlerts.filter((t) => t.alertId !== id),
    })),

  setTriggeredAlerts: (triggered) =>
    set({ triggeredAlerts: triggered, triggeredLoaded: true }),

  reset: () => set({ ...initialState }),
}))
