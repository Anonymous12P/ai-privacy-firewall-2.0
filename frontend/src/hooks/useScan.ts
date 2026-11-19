import { useMutation, useQuery } from '@tanstack/react-query'
import { createScan, getScanStatus } from '../services/scanService'
import type { ScanRequest } from '../types/api'

export function useScanStatus(scanId: string | null) {
  return useQuery({
    queryKey: ['scan', scanId],
    queryFn: () => getScanStatus(scanId as string),
    enabled: Boolean(scanId),
    refetchInterval: (query) => {
      const currentStatus = query.state.data?.status
      return currentStatus === 'PENDING' || currentStatus === 'RUNNING' ? 2000 : false
    },
  })
}

export function useCreateScan() {
  return useMutation({
    mutationFn: (payload: ScanRequest) => createScan(payload),
  })
}

export const useScan = useScanStatus
