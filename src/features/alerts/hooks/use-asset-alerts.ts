/**
 * Hook : alertes filtrées pour un asset spécifique.
 *
 * Utilisé dans asset-detail-page.tsx pour afficher :
 *   - Les alertes actives configurées pour ce symbole
 *   - Les déclenchements passés pour ce symbole
 *
 * Ce hook ne fait PAS d'appel API dédié — il filtre les données
 * déjà présentes dans le store (chargées par useAlerts et useTriggeredAlerts).
 * Si les données ne sont pas encore chargées, il délègue le fetch
 * en consommant useAlerts() et useTriggeredAlerts() directement.
 *
 * Pourquoi un hook séparé plutôt qu'un filtre inline dans la page ?
 *   → Le filtrage + la combinaison des deux sources (alerts + triggered)
 *   est de la logique métier. L'extraire dans un hook garde la page
 *   concentrée sur le JSX, conformément à la convention du projet.
 */

import { useMemo } from 'react'
import { useAlerts } from './use-alerts'
import { useTriggeredAlerts } from './use-triggered-alerts'
import type { Alert, TriggeredAlert, CreateAlertRequest, UpdateAlertRequest } from '@/types/api'

interface UseAssetAlertsReturn {
  /** Alertes configurées pour ce symbole. */
  assetAlerts: Alert[]
  /** Déclenchements passés pour ce symbole. */
  assetTriggered: TriggeredAlert[]
  /** true pendant le chargement initial des deux sources. */
  loading: boolean
  /** Message d'erreur combiné, null si OK. */
  error: string | null
  /** Crée une nouvelle alerte (symbol pré-rempli). */
  create: (data: CreateAlertRequest) => Promise<void>
  /** Modifie une alerte existante. */
  update: (id: number, data: UpdateAlertRequest) => Promise<void>
  /** Supprime une alerte. */
  remove: (id: number) => Promise<void>
}

export function useAssetAlerts(symbol: string): UseAssetAlertsReturn {
  const {
    alerts,
    loading: alertsLoading,
    error: alertsError,
    create,
    update,
    remove,
  } = useAlerts()

  const {
    triggeredAlerts,
    loading: triggeredLoading,
    error: triggeredError,
  } = useTriggeredAlerts()

  // Filtrage par symbole — useMemo pour éviter un filter() à chaque render
  const assetAlerts = useMemo(
    () => alerts.filter((a) => a.symbol === symbol),
    [alerts, symbol],
  )

  const assetTriggered = useMemo(
    () => triggeredAlerts.filter((t) => t.symbol === symbol),
    [triggeredAlerts, symbol],
  )

  const loading = alertsLoading || triggeredLoading
  const error = alertsError ?? triggeredError

  return { assetAlerts, assetTriggered, loading, error, create, update, remove }
}
