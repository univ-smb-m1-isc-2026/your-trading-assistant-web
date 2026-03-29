import { apiClient } from './api-client'

export interface AiHealthResponse {
  status: string
}

export interface AiPredictionResponse {
  predicted_variation_pct: number
  direction: 'UP' | 'DOWN'
}

export interface AiLatestSampleResponse {
  ticker: string
  date: string
  features: Record<string, number>
  actual_variation_pct: number
}

export interface AiTestReportSummary {
  test_rows: number
  mae_pct: number
  rmse_pct: number
  r2: number
  direction_success: number
  direction_total: number
  direction_accuracy_pct: number
  worst_count: number
  best_count: number
}

export interface AiTestReportRow {
  margin_pp: string
  success: number
  total: number
  rate_pct: number
}

export interface AiTestReportExample {
  date: string
  ticker: string
  predicted_pct: number
  actual_pct: number
  abs_error_pp: number
}

export interface AiTestReportResponse {
  summary: AiTestReportSummary
  precision_table: AiTestReportRow[]
  worst_examples: AiTestReportExample[]
  best_examples: AiTestReportExample[]
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

export async function getAiTestReport(): Promise<AiTestReportResponse> {
  return apiClient.request<AiTestReportResponse>('/ai/test-report')
}

export async function getAiLatestSample(): Promise<AiLatestSampleResponse> {
  return apiClient.request<AiLatestSampleResponse>('/ai/latest-sample')
}
