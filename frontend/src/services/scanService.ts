import { apiClient } from '../api/client'
import type { ScanRequest, ScanResponse } from '../types/api'

export async function createScan(request: ScanRequest): Promise<ScanResponse> {
  return (await apiClient.post<ScanResponse>('/scan', request)).data
}

export async function getScanStatus(scanId: string): Promise<ScanResponse> {
  return (await apiClient.get<ScanResponse>(`/scan/${scanId}`)).data
}
