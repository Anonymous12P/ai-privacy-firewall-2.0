import { useQuery } from '@tanstack/react-query'
import {
  getExperiments,
  getModels,
  getSystemInfo,
  getUsers,
} from '../services/adminService'
import { useSettings } from './useSettings'

export function useSystemInfo() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['admin', 'system'],
    queryFn: getSystemInfo,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}

export function useModels() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['admin', 'models'],
    queryFn: getModels,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}

export function useUsers() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getUsers,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}

export function useExperiments() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['admin', 'experiments'],
    queryFn: getExperiments,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}
