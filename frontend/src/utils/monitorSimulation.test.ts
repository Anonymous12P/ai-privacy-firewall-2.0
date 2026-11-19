import { describe, expect, it } from 'vitest'
import {
  BEHAVIOR_INDICATORS,
  DEPARTMENTS,
  EMPLOYEES,
  OPERATIONS,
  RESOURCES,
  generateInitialEvents,
  generateLiveFirewallEvent,
  getDecisionForRisk,
} from './monitorSimulation'

describe('monitorSimulation - Decision Rules & Generator', () => {
  describe('getDecisionForRisk', () => {
    it('returns ALLOW when risk is strictly less than 25', () => {
      expect(getDecisionForRisk(0)).toBe('ALLOW')
      expect(getDecisionForRisk(10)).toBe('ALLOW')
      expect(getDecisionForRisk(24)).toBe('ALLOW')
      expect(getDecisionForRisk(24.9)).toBe('ALLOW')
    })

    it('returns WARN when risk is between 25 and 50 inclusive', () => {
      expect(getDecisionForRisk(25)).toBe('WARN')
      expect(getDecisionForRisk(35)).toBe('WARN')
      expect(getDecisionForRisk(50)).toBe('WARN')
    })

    it('returns RESTRICT when risk is between 50 and 75 inclusive', () => {
      expect(getDecisionForRisk(51)).toBe('RESTRICT')
      expect(getDecisionForRisk(60)).toBe('RESTRICT')
      expect(getDecisionForRisk(75)).toBe('RESTRICT')
    })

    it('returns BLOCK when risk is strictly greater than 75', () => {
      expect(getDecisionForRisk(76)).toBe('BLOCK')
      expect(getDecisionForRisk(88)).toBe('BLOCK')
      expect(getDecisionForRisk(100)).toBe('BLOCK')
    })
  })

  describe('generateLiveFirewallEvent', () => {
    it('produces events with valid schema and required domain entities', () => {
      const event = generateLiveFirewallEvent()

      expect(typeof event.id).toBe('string')
      expect(EMPLOYEES).toContain(event.employeeName)
      expect(DEPARTMENTS).toContain(event.department)
      expect(RESOURCES).toContain(event.requestedResource)
      expect(OPERATIONS).toContain(event.operation)
      expect(event.riskScore).toBeGreaterThanOrEqual(0)
      expect(event.riskScore).toBeLessThanOrEqual(100)
      expect(event.threatScore).toBeGreaterThanOrEqual(0)
      expect(event.aiConfidence).toBeGreaterThan(0.7)
      expect(event.aiConfidence).toBeLessThanOrEqual(1.0)
      expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(event.firewallDecision)
      expect(typeof event.policyTriggered).toBe('string')
      expect(event.policyTriggered.length).toBeGreaterThan(0)
      expect(Array.isArray(event.behaviorIndicators)).toBe(true)
      expect(Array.isArray(event.reasons)).toBe(true)
      expect(event.reasons.length).toBeGreaterThan(0)
      expect(typeof event.timestamp).toBe('string')

      event.behaviorIndicators.forEach((indicator) => {
        expect(BEHAVIOR_INDICATORS).toContain(indicator)
      })
    })

    it('accurately respects forced BLOCK decision', () => {
      const event = generateLiveFirewallEvent('BLOCK')
      expect(event.firewallDecision).toBe('BLOCK')
      expect(event.riskScore).toBeGreaterThan(75)
    })

    it('accurately respects forced WARN decision', () => {
      const event = generateLiveFirewallEvent('WARN')
      expect(event.firewallDecision).toBe('WARN')
      expect(event.riskScore).toBeGreaterThanOrEqual(25)
      expect(event.riskScore).toBeLessThanOrEqual(50)
    })

    it('accurately respects forced RESTRICT decision', () => {
      const event = generateLiveFirewallEvent('RESTRICT')
      expect(event.firewallDecision).toBe('RESTRICT')
      expect(event.riskScore).toBeGreaterThan(50)
      expect(event.riskScore).toBeLessThanOrEqual(75)
    })

    it('accurately respects forced ALLOW decision', () => {
      const event = generateLiveFirewallEvent('ALLOW')
      expect(event.firewallDecision).toBe('ALLOW')
      expect(event.riskScore).toBeLessThan(25)
    })
  })

  describe('generateInitialEvents', () => {
    it('seeds the requested number of events with unique IDs and timestamps', () => {
      const events = generateInitialEvents(8)
      expect(events.length).toBe(8)
      const ids = new Set(events.map((e) => e.id))
      expect(ids.size).toBe(8)
    })
  })
})
