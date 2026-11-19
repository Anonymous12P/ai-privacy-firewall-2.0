import { describe, expect, it } from 'vitest'
import {
  INITIAL_ADAPTIVE_POLICIES,
  deleteAdaptivePolicy,
  duplicateAdaptivePolicy,
  evaluateCondition,
  fetchAdaptivePolicies,
  saveAdaptivePolicy,
  simulatePolicyEvaluation,
  toggleAdaptivePolicyStatus,
} from './policyService'
import type { PolicyCondition, SimulatorRequest } from '../types/policy'

describe('policyService & Adaptive Rule Evaluation', () => {
  const baseRequest: SimulatorRequest = {
    employee: 'Pavan',
    department: 'Engineering',
    role: 'Senior Software Engineer',
    resource: 'Source Code Repository',
    device: 'MacBook Pro MDM',
    country: 'US',
    usb: false,
    afterHours: false,
    failedLogins: 0,
    httpBurst: false,
    email: false,
    massDownload: false,
    vpn: true,
    byod: false,
    impossibleTravel: false,
    riskScore: 12,
    threatScore: 10,
  }

  describe('evaluateCondition', () => {
    it('evaluates boolean EQUALS correctly', () => {
      const cond: PolicyCondition = { id: '1', field: 'usb', operator: 'EQUALS', value: true }
      expect(evaluateCondition({ ...baseRequest, usb: true }, cond)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, usb: false }, cond)).toBe(false)
    })

    it('evaluates numeric comparisons correctly', () => {
      const condGte: PolicyCondition = { id: '2', field: 'riskScore', operator: 'GREATER_THAN_OR_EQUAL', value: 75 }
      expect(evaluateCondition({ ...baseRequest, riskScore: 75 }, condGte)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, riskScore: 80 }, condGte)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, riskScore: 74 }, condGte)).toBe(false)

      const condLt: PolicyCondition = { id: '3', field: 'riskScore', operator: 'LESS_THAN', value: 25 }
      expect(evaluateCondition({ ...baseRequest, riskScore: 20 }, condLt)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, riskScore: 25 }, condLt)).toBe(false)
    })

    it('evaluates CONTAINS and IN operators correctly', () => {
      const condContains: PolicyCondition = { id: '4', field: 'resource', operator: 'CONTAINS', value: 'Medical Records' }
      expect(evaluateCondition({ ...baseRequest, resource: 'Medical Records' }, condContains)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, resource: 'mongo://med-cluster/Medical Records/v1' }, condContains)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, resource: 'GitLab' }, condContains)).toBe(false)

      const condIn: PolicyCondition = { id: '5', field: 'department', operator: 'IN', value: 'Engineering, Finance' }
      expect(evaluateCondition({ ...baseRequest, department: 'Engineering' }, condIn)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, department: 'Finance' }, condIn)).toBe(true)
      expect(evaluateCondition({ ...baseRequest, department: 'Healthcare' }, condIn)).toBe(false)
    })
  })

  describe('simulatePolicyEvaluation', () => {
    it('matches Strict Exfiltration Policy and outputs BLOCK on USB + High Risk', () => {
      const req: SimulatorRequest = {
        ...baseRequest,
        usb: true,
        riskScore: 85,
        threatScore: 90,
      }
      const result = simulatePolicyEvaluation(req, INITIAL_ADAPTIVE_POLICIES)

      expect(result.matchedPolicy).not.toBeNull()
      expect(result.matchedPolicy?.name).toBe('Strict Mass Exfiltration Prevention Policy')
      expect(result.decision).toBe('BLOCK')
      expect(result.matchedConditions.length).toBeGreaterThanOrEqual(2)
      expect(result.evaluationTimeMs).toBeGreaterThanOrEqual(0)
    })

    it('matches HIPAA Clinical Records Policy and outputs RESTRICT', () => {
      const req: SimulatorRequest = {
        ...baseRequest,
        department: 'Healthcare',
        resource: 'Medical Records',
        riskScore: 60,
        threatScore: 65,
      }
      const result = simulatePolicyEvaluation(req, INITIAL_ADAPTIVE_POLICIES)

      expect(result.matchedPolicy).not.toBeNull()
      expect(result.matchedPolicy?.name).toBe('Healthcare HIPAA Clinical Records Guard')
      expect(result.decision).toBe('RESTRICT')
    })

    it('matches BYOD Policy and outputs WARN', () => {
      const req: SimulatorRequest = {
        ...baseRequest,
        byod: true,
        riskScore: 35,
        threatScore: 30,
      }
      const result = simulatePolicyEvaluation(req, INITIAL_ADAPTIVE_POLICIES)

      expect(result.matchedPolicy).not.toBeNull()
      expect(result.decision).toBe('WARN')
    })

    it('matches Baseline Policy and outputs ALLOW for routine access', () => {
      const req: SimulatorRequest = {
        ...baseRequest,
        vpn: true,
        riskScore: 12,
        threatScore: 10,
      }
      const result = simulatePolicyEvaluation(req, INITIAL_ADAPTIVE_POLICIES)

      expect(result.matchedPolicy).not.toBeNull()
      expect(result.decision).toBe('ALLOW')
    })
  })

  describe('CRUD operations', () => {
    it('fetches initial policies array', async () => {
      const policies = await fetchAdaptivePolicies()
      expect(policies.length).toBeGreaterThanOrEqual(6)
    })

    it('creates, duplicates, toggles, and deletes a policy', async () => {
      // 1. Create
      const newPolicy = await saveAdaptivePolicy({
        name: 'Unit Test Ephemeral Policy',
        description: 'Test rule created by vitest runner',
        priority: 15,
        departmentScope: 'Engineering',
        category: 'Threat Defense',
        conditions: [{ id: 't1', field: 'httpBurst', operator: 'EQUALS', value: true }],
        action: 'WARN',
        riskLevel: 'Medium',
        enforcementMode: 'ENFORCING',
        enabled: true,
        notificationChannel: 'SOC Alert',
      })
      expect(newPolicy.id).toBeDefined()
      expect(newPolicy.version).toBe('1.0')

      // 2. Duplicate
      const clone = await duplicateAdaptivePolicy(newPolicy.id)
      expect(clone.name).toContain('(Copy)')
      expect(clone.priority).toBe(newPolicy.priority + 1)

      // 3. Toggle Status
      const toggled = await toggleAdaptivePolicyStatus(newPolicy.id)
      expect(toggled.enabled).toBe(false)

      // 4. Delete
      const deleted1 = await deleteAdaptivePolicy(newPolicy.id)
      const deleted2 = await deleteAdaptivePolicy(clone.id)
      expect(deleted1).toBe(true)
      expect(deleted2).toBe(true)
    })
  })
})
