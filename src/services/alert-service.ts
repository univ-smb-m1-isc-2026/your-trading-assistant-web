/**
 * Service pour les alertes utilisateur.
 *
 * CRUD complet + consultation de l'historique des déclenchements.
 * Toutes les fonctions utilisent apiClient.request() — jamais de fetch direct.
 *
 * Endpoints backend :
 *   GET    /alerts            → liste les alertes configurées
 *   POST   /alerts            → crée une nouvelle alerte
 *   PUT    /alerts/{id}       → modifie une alerte (mise à jour partielle)
 *   DELETE /alerts/{id}       → supprime une alerte + son historique
 *   GET    /alerts/triggered  → historique des déclenchements
 */

import { apiClient } from './api-client'
import type { Alert, TriggeredAlert, CreateAlertRequest, UpdateAlertRequest } from '@/types/api'

/**
 * Récupère toutes les alertes configurées par l'utilisateur connecté.
 * Inclut les alertes actives ET inactives.
 * GET /alerts — nécessite un JWT valide.
 */
export async function getAlerts(): Promise<Alert[]> {
  return apiClient.request<Alert[]>('/alerts')
}

/**
 * Crée une nouvelle alerte.
 * POST /alerts — nécessite un JWT valide.
 *
 * L'alerte est active par défaut côté backend.
 *
 * @throws Error HTTP 400 si champ manquant ou type/direction invalide
 * @throws Error HTTP 404 si symbol inconnu
 */
export async function createAlert(data: CreateAlertRequest): Promise<Alert> {
  return apiClient.request<Alert>('/alerts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Modifie une alerte existante (mise à jour partielle).
 * PUT /alerts/{id} — nécessite un JWT valide.
 *
 * Seuls les champs présents dans `data` sont modifiés.
 * Exemples :
 *   { thresholdValue: 105000 }         → ne modifie que le seuil
 *   { active: true }                    → réactive une alerte one-shot
 *   { type: "VOLUME_THRESHOLD" }        → change le type
 *
 * @throws Error HTTP 404 si alerte inexistante ou non possédée
 * @throws Error HTTP 400 si type ou direction invalide
 */
export async function updateAlert(id: number, data: UpdateAlertRequest): Promise<Alert> {
  return apiClient.request<Alert>(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

/**
 * Supprime une alerte et tout son historique de déclenchements.
 * DELETE /alerts/{id} — nécessite un JWT valide.
 *
 * Retourne 204 No Content (body vide — géré par api-client).
 *
 * @throws Error HTTP 404 si alerte inexistante ou non possédée
 */
export async function deleteAlert(id: number): Promise<void> {
  await apiClient.request<void>(`/alerts/${id}`, { method: 'DELETE' })
}

/**
 * Récupère l'historique des alertes déclenchées.
 * GET /alerts/triggered — nécessite un JWT valide.
 *
 * Trié par date de déclenchement décroissant (le plus récent en premier).
 */
export async function getTriggeredAlerts(): Promise<TriggeredAlert[]> {
  return apiClient.request<TriggeredAlert[]>('/alerts/triggered')
}
