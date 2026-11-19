import { apiClient } from '../api/client'
import type {
  AnalyticsSummary,
  ModelAnalytics,
  RiskAnalytics,
} from '../types/api'

export async function getAnalytics(): Promise<AnalyticsSummary> {
  return (await apiClient.get<AnalyticsSummary>('/analytics')).data
}

export async function getRiskAnalytics(): Promise<RiskAnalytics> {
  return (await apiClient.get<RiskAnalytics>('/analytics/risk')).data
}

export async function getModelAnalytics(): Promise<ModelAnalytics> {
  return (await apiClient.get<ModelAnalytics>('/analytics/models')).data
}
