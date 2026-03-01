/**
 * Hook : historique des alertes déclenchées.
 *
 * Fetch GET /alerts/triggered au montage (si pas déjà en store).
 * Expose la liste triée par triggeredAt desc (le backend trie déjà,
 * mais on ne fait pas de re-tri côté client pour le moment).
 *
 * Séparé de useAlerts car :
 *   - Les pages n'ont pas toujours besoin des deux listes
 *   - Le dashboard n'a besoin que des déclenchements du jour
 *   - Séparer les fetches évite de bloquer l'affichage des alertes
 *     actives en attendant un historique potentiellement long
 */

import { useState, useEffect } from 'react'
import { useAlertsStore } from '@/stores/use-alerts-store'
import { getTriggeredAlerts } from '@/services/alert-service'

import type { TriggeredAlert } from '@/types/api'

interface UseTriggeredAlertsReturn {
  /** Historique des alertes déclenchées (trié par triggeredAt desc). */
  triggeredAlerts: TriggeredAlert[]
  /** true pendant le chargement initial. */
  loading: boolean
  /** Message d'erreur du fetch, null si OK. */
  error: string | null
}

export function useTriggeredAlerts(): UseTriggeredAlertsReturn {
  const triggeredAlerts = useAlertsStore((s) => s.triggeredAlerts)
  const triggeredLoaded = useAlertsStore((s) => s.triggeredLoaded)
  const setTriggeredAlerts = useAlertsStore((s) => s.setTriggeredAlerts)

  const [loading, setLoading] = useState(!triggeredLoaded)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (triggeredLoaded) return

    let cancelled = false

    async function fetch() {
      try {
        const data = await getTriggeredAlerts()
        if (!cancelled) {
          setTriggeredAlerts(data)
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
  }, [triggeredLoaded, setTriggeredAlerts])

  return { triggeredAlerts, loading, error }
}
