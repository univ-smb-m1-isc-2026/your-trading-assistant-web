import { apiClient } from './api-client'

export interface AiHealthResponse {
  status: string
}

export interface AiPredictionResponse {
  predicted_variation_pct: number
  direction: 'UP' | 'DOWN'
}

export async function getAiHealth(): Promise<AiHealthResponse> {
  return apiClient.request<AiHealthResponse>('/ai/health')
}

export async function getAiPrediction(
  features: Record<string, number>,
): Promise<AiPredictionResponse> {
  return apiClient.request<AiPredictionResponse>('/ai/predict', {
    method: 'POST',
    body: JSON.stringify(features),
  })
}
