import { apiClient } from '@/services/api-client'
import type { HelloResponse } from '@/types/api'

/**
 * Appelle GET /hello sur le backend.
 * Retourne la réponse typée HelloResponse.
 */
export async function getHello(): Promise<HelloResponse> {
  return apiClient.request<HelloResponse>('/')
}
