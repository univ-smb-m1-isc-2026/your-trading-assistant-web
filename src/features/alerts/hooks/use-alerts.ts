/**
 * Hook : gestion CRUD des alertes utilisateur.
 *
 * Responsabilités :
 *   1. Fetch initial — charge GET /alerts au montage (si pas déjà en store)
 *   2. Expose la liste des alertes depuis le store
 *   3. Fournit des fonctions create / update / delete
 *
 * Pattern identique à useFavorites :
 *   - Flag `alertsLoaded` dans le store → empêche les double-fetch
 *   - Flag `cancelled` dans useEffect → évite setState sur composant démonté
 *   - void fetch() → satisfait no-floating-promises
 *
 * Pourquoi les mutations mettent-elles à jour le store localement ?
 *   → Après un POST/PUT/DELETE réussi, on met à jour le store directement
 *   (addAlert, updateAlert, removeAlert) au lieu de refaire un GET /alerts.
 *   Cela donne un retour instantané à l'utilisateur et évite un aller-retour
 *   réseau supplémentaire. Le store reste la source de vérité côté client.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAlertsStore } from '@/stores/use-alerts-store'
import { getAlerts, createAlert, updateAlert, deleteAlert } from '@/services/alert-service'
import type { Alert, CreateAlertRequest, UpdateAlertRequest } from '@/types/api'

interface UseAlertsReturn {
  /** Liste des alertes configurées (actives + inactives). */
  alerts: Alert[]
  /** true pendant le chargement initial. */
  loading: boolean
  /** Message d'erreur du fetch initial, null si OK. */
  error: string | null
  /** Crée une nouvelle alerte. */
  create: (data: CreateAlertRequest) => Promise<void>
  /** Modifie une alerte existante (partiel). */
  update: (id: number, data: UpdateAlertRequest) => Promise<void>
  /** Supprime une alerte et son historique. */
  remove: (id: number) => Promise<void>
}

export function useAlerts(): UseAlertsReturn {
  const alerts = useAlertsStore((s) => s.alerts)
  const alertsLoaded = useAlertsStore((s) => s.alertsLoaded)
  const setAlerts = useAlertsStore((s) => s.setAlerts)
  const addAlert = useAlertsStore((s) => s.addAlert)
  const updateAlertInStore = useAlertsStore((s) => s.updateAlert)
  const removeAlert = useAlertsStore((s) => s.removeAlert)

  const [loading, setLoading] = useState(!alertsLoaded)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Si les alertes sont déjà en store (loaded), pas besoin de refetch.
    if (alertsLoaded) return

    let cancelled = false

    async function fetch() {
      try {
        const data = await getAlerts()
        if (!cancelled) {
          setAlerts(data)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue')
          setLoading(false)
        }
      }
    }

    void fetch()
    return () => { cancelled = true }
  }, [alertsLoaded, setAlerts])

  const create = useCallback(async (data: CreateAlertRequest) => {
    const newAlert = await createAlert(data)
    addAlert(newAlert)
  }, [addAlert])

  const update = useCallback(async (id: number, data: UpdateAlertRequest) => {
    const updated = await updateAlert(id, data)
    updateAlertInStore(updated)
  }, [updateAlertInStore])

  const remove = useCallback(async (id: number) => {
    await deleteAlert(id)
    removeAlert(id)
  }, [removeAlert])

  return { alerts, loading, error, create, update, remove }
}
