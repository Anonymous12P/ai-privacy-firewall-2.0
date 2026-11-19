import { apiClient } from '../api/client'
import type {
  FirewallAuditResponse,
  FirewallEvaluationResponse,
  FirewallModelPipelineResponse,
  FirewallPoliciesResponse,
  FirewallStatusResponse,
} from '../types/api'

export interface FirewallAuditQuery {
  page?: number
  pageSize?: number
  subjectId?: string
  action?: string
  riskLevel?: string
  enforcedOnly?: boolean
}

export interface FirewallEvaluatePayload {
  features: Record<string, number>
  subject_id?: string
  resource?: string
  action?: string
  model_name?: string
  context?: Record<string, unknown>
}

export interface FirewallEnforcePayload extends FirewallEvaluatePayload {
  enforce?: boolean
}

export async function getFirewallStatus(): Promise<FirewallStatusResponse> {
  const { data } = await apiClient.get<FirewallStatusResponse>('/firewall/status')
  return data
}

export async function getFirewallPolicies(): Promise<FirewallPoliciesResponse> {
  const { data } = await apiClient.get<FirewallPoliciesResponse>('/firewall/policies')
  return data
}

export async function getFirewallAudit(
  query: FirewallAuditQuery = {},
): Promise<FirewallAuditResponse> {
  const { data } = await apiClient.get<FirewallAuditResponse>('/firewall/audit', {
    params: {
      page: query.page ?? 1,
      page_size: query.pageSize ?? 20,
      subject_id: query.subjectId,
      action: query.action,
      risk_level: query.riskLevel,
      enforced_only: query.enforcedOnly,
    },
  })
  return data
}

export async function evaluateAccess(
  payload: FirewallEvaluatePayload,
): Promise<FirewallEvaluationResponse> {
  const { data } = await apiClient.post<FirewallEvaluationResponse>(
    '/firewall/evaluate',
    payload,
  )
  return data
}

export async function enforceAccess(
  payload: FirewallEnforcePayload,
): Promise<unknown> {
  const { data } = await apiClient.post('/firewall/enforce', payload)
  return data
}

export async function getModelPipeline(): Promise<FirewallModelPipelineResponse> {
  const { data } = await apiClient.get<FirewallModelPipelineResponse>('/firewall/model-pipeline')
  return data
}

