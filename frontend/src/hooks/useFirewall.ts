import { useQuery } from '@tanstack/react-query'
import {
  type FirewallAuditQuery,
  getFirewallAudit,
  getModelPipeline,
  getFirewallPolicies,
  getFirewallStatus,
} from '../services/firewallService'
import { useSettings } from './useSettings'

export function useFirewallStatus() {
  const { refreshInterval } = useSettings()
  return useQuery({
    queryKey: ['firewall', 'status'],
    queryFn: getFirewallStatus,
    staleTime: refreshInterval * 1000,
    refetchInterval: refreshInterval * 1000,
  })
}

export function useFirewallPolicies() {
  return useQuery({
    queryKey: ['firewall', 'policies'],
    queryFn: getFirewallPolicies,
    staleTime: 60000,
  })
}

export function useFirewallAudit(query: FirewallAuditQuery = {}) {
  return useQuery({
    queryKey: ['firewall', 'audit', query],
    queryFn: () => getFirewallAudit(query),
    staleTime: 30000,
  })
}

export function useFirewallModelPipeline() {
  return useQuery({
    queryKey: ['firewall', 'model-pipeline'],
    queryFn: getModelPipeline,
    staleTime: 60000,
  })
}

