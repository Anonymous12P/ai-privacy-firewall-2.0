import { useQuery } from '@tanstack/react-query'
import {
  getAnalytics,
  getModelAnalytics,
  getRiskAnalytics,
} from '../services/analyticsService'
import { useSettings } from './useSettings'

export function useAnalytics() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: getAnalytics,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}

export function useRiskAnalytics() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['analytics', 'risk'],
    queryFn: getRiskAnalytics,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}

export function useModelAnalytics() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['analytics', 'models'],
    queryFn: getModelAnalytics,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}
