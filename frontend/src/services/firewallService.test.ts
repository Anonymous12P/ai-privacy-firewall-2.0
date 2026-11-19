import { describe, expect, it, vi } from 'vitest'
import { apiClient } from '../api/client'
import {
  evaluateAccess,
  enforceAccess,
  getFirewallPolicies,
  getFirewallStatus,
  getFirewallAudit,
} from './firewallService'
import type { FirewallEvaluationResponse, FirewallPoliciesResponse, FirewallStatusResponse, FirewallAuditResponse } from '../types/api'

describe('firewallService', () => {
  it('posts evaluateAccess payload to /firewall/evaluate', async () => {
    const mockResponse: FirewallEvaluationResponse = {
      evaluation_id: 'eval-123',
      timestamp: '2026-11-15T12:00:00Z',
      subject_id: 'Alice Vance (Senior Financial Analyst)',
      resource: 's3://vault/financials.parquet',
      action: 'bulk_download',
      risk_score: 0.88,
      risk_level: 'Critical',
      decision: 'BLOCK',
      policy_name: 'Strict Exfiltration Prevention Policy',
      reasons: ['High file volume', 'USB connected'],
      explanation: {
        model_name: 'LogisticRegression',
        summary: 'High insider threat probability',
        confidence: 0.94,
        reasons: ['File download exceeds threshold'],
        contributing_factors: { 'indicator.usb': 0.4 },
      },
      behavior: {
        anomaly_score: 0.88,
        anomalous_indicators: ['indicator.usb', 'indicator.file'],
        risk_factors: ['usb_attached'],
        indicators_present: { 'indicator.usb': true },
      },
    }

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockResponse })

    const payload = {
      features: { 'indicator.usb': 1.0, 'indicator.file': 5.0 },
      subject_id: 'Alice Vance (Senior Financial Analyst)',
      resource: 's3://vault/financials.parquet',
      action: 'bulk_download',
      model_name: 'LogisticRegression' as const,
      context: {
        employee_name: 'Alice Vance',
        department: 'Finance & Accounting',
      },
    }

    const result = await evaluateAccess(payload)

    expect(postSpy).toHaveBeenCalledWith('/firewall/evaluate', payload)
    expect(result.decision).toBe('BLOCK')
    expect(result.risk_level).toBe('Critical')
    expect(result.explanation.confidence).toBe(0.94)

    postSpy.mockRestore()
  })

  it('calls status, policies, audit, and enforce endpoints with expected paths', async () => {
    const mockStatus: FirewallStatusResponse = {
      status: 'HEALTHY',
      mode: 'ENFORCING',
      version: '2.0.0',
      uptime_seconds: 3600,
      models_available: ['LogisticRegression'],
      active_policies_count: 5,
      total_evaluations: 100,
      total_blocks: 10,
      total_warnings: 5,
      total_restrictions: 2,
      services: { ai_engine: 'ONLINE' },
    }

    const mockPolicies: FirewallPoliciesResponse = {
      policies: [],
      default_action: 'ALLOW',
      total_count: 0,
    }

    const mockAudit: FirewallAuditResponse = {
      items: [],
      total_count: 0,
      page: 1,
      page_size: 20,
      total_pages: 1,
    }

    const getSpy = vi.spyOn(apiClient, 'get')
      .mockResolvedValueOnce({ data: mockStatus })
      .mockResolvedValueOnce({ data: mockPolicies })
      .mockResolvedValueOnce({ data: mockAudit })

    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: { success: true } })

    const status = await getFirewallStatus()
    expect(getSpy).toHaveBeenNthCalledWith(1, '/firewall/status')
    expect(status.status).toBe('HEALTHY')

    const policies = await getFirewallPolicies()
    expect(getSpy).toHaveBeenNthCalledWith(2, '/firewall/policies')
    expect(policies.total_count).toBe(0)

    const audit = await getFirewallAudit({ page: 2, pageSize: 10, riskLevel: 'High' })
    expect(getSpy).toHaveBeenNthCalledWith(3, '/firewall/audit', {
      params: {
        page: 2,
        page_size: 10,
        subject_id: undefined,
        action: undefined,
        risk_level: 'High',
        enforced_only: undefined,
      },
    })
    expect(audit.page).toBe(1)

    const enforceResult = await enforceAccess({
      features: { 'indicator.file': 1.0 },
      enforce: true,
    })
    expect(postSpy).toHaveBeenCalledWith('/firewall/enforce', {
      features: { 'indicator.file': 1.0 },
      enforce: true,
    })
    expect(enforceResult).toEqual({ success: true })

    getSpy.mockRestore()
    postSpy.mockRestore()
  })
})
