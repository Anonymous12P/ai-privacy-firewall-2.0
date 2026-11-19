import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteHistoryItem, getHistoryItem, listHistory, type HistoryQuery } from '../services/historyService'
import type { HistoryResponse } from '../types/api'

export function useHistory(query: HistoryQuery) {
  return useQuery({ queryKey: ['history', query], queryFn: () => listHistory(query) })
}

export function useHistoryItem(scanId: string | null) {
  return useQuery({
    queryKey: ['history-item', scanId],
    queryFn: () => getHistoryItem(scanId as string),
    enabled: Boolean(scanId),
  })
}

export function useDeleteHistory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteHistoryItem,
    onMutate: async (scanId) => {
      await queryClient.cancelQueries({ queryKey: ['history'] })
      const previous = queryClient.getQueriesData<HistoryResponse>({ queryKey: ['history'] })
      queryClient.setQueriesData<HistoryResponse>({ queryKey: ['history'] }, (current) => current ? {
        ...current,
        items: current.items.filter((item) => item.scan_id !== scanId),
        total: Math.max(0, current.total - 1),
      } : current)
      return { previous }
    },
    onError: (_error, _scanId, context) => {
      context?.previous.forEach(([key, value]) => queryClient.setQueryData(key, value))
    },
    onSettled: (_data, _error, scanId) => {
      void queryClient.invalidateQueries({ queryKey: ['history'] })
      void queryClient.removeQueries({ queryKey: ['history-item', scanId] })
    },
  })
}
