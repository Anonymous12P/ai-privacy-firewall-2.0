import { apiClient } from '../api/client'
import type { HistoryResponse, RiskLevel, ScanResponse } from '../types/api'

export interface HistoryQuery {
  page: number
  pageSize: number
  sortOrder: 'asc' | 'desc'
  riskLevel?: RiskLevel
}

export async function listHistory(query: HistoryQuery): Promise<HistoryResponse> {
  const { data } = await apiClient.get<HistoryResponse>('/history', {
    params: {
      page: query.page,
      page_size: query.pageSize,
      sort_order: query.sortOrder,
      risk_level: query.riskLevel,
    },
  })
  return data
}

export async function getHistoryItem(scanId: string): Promise<ScanResponse> {
  return (await apiClient.get<ScanResponse>(`/history/${scanId}`)).data
}

export async function deleteHistoryItem(scanId: string): Promise<void> {
  await apiClient.delete(`/history/${scanId}`)
}
