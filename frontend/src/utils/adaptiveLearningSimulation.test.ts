import { describe, expect, it } from 'vitest'
import {
  generateAdaptiveLearningSnapshot,
  generateAdaptiveSummary,
  generateAdaptiveThresholds,
  generateAnomalyTrends,
  generateBaselineTimeline,
  generateBehaviorComparison,
  generateDriftTrends,
  generateFeedbackLoopEvents,
  generatePrivacyRiskScores,
  generateUserBaselines,
} from './adaptiveLearningSimulation'

describe('Adaptive Learning & Behavior Baseline Simulation Engine', () => {
  it('generates a complete and consistent adaptive learning snapshot', () => {
    const snapshot = generateAdaptiveLearningSnapshot('EMP-1001')

    expect(snapshot).toBeDefined()
    expect(snapshot.users.length).toBeGreaterThanOrEqual(5)
    expect(snapshot.activeUser.userId).toBe('EMP-1001')
    expect(snapshot.driftTrends.length).toBe(14)
    expect(snapshot.privacyScores.length).toBeGreaterThanOrEqual(5)
    expect(snapshot.thresholds.length).toBeGreaterThanOrEqual(3)
    expect(snapshot.feedbackEvents.length).toBeGreaterThanOrEqual(3)
    expect(snapshot.comparison.length).toBeGreaterThanOrEqual(4)
    expect(snapshot.anomalies.length).toBeGreaterThanOrEqual(4)
    expect(snapshot.timelineStages.length).toBe(4)
    expect(snapshot.summary.conceptDriftMetric).toBeDefined()
  })

  it('correctly adapts active user selection across different profiles', () => {
    const pavanSnapshot = generateAdaptiveLearningSnapshot('EMP-1001')
    expect(pavanSnapshot.activeUser.userName).toBe('Pavan')
    expect(pavanSnapshot.activeUser.driftCategory).toBe('Stabilized')

    const marcusSnapshot = generateAdaptiveLearningSnapshot('EMP-1006')
    expect(marcusSnapshot.activeUser.userName).toBe('Marcus Vance')
    expect(marcusSnapshot.activeUser.driftCategory).toBe('Sudden Spike')
    expect(marcusSnapshot.activeUser.currentThreatScore).toBeGreaterThan(70)
  })

  it('generates 14 drift trend data points with valid scores and thresholds', () => {
    const users = generateUserBaselines()
    const marcus = users.find((u) => u.userId === 'EMP-1006')!
    const trends = generateDriftTrends(marcus)

    expect(trends.length).toBe(14)
    trends.forEach((t) => {
      expect(t.normalDrift).toBeGreaterThanOrEqual(0)
      expect(t.suspiciousDrift).toBeGreaterThanOrEqual(0)
      expect(t.currentRiskScore).toBeGreaterThanOrEqual(0)
      expect(t.currentRiskScore).toBeLessThanOrEqual(100)
      expect(t.adaptedThreshold).toBeGreaterThanOrEqual(30)
    })
  })

  it('calculates privacy risk scores across all severity tiers', () => {
    const scores = generatePrivacyRiskScores()
    expect(scores.length).toBeGreaterThanOrEqual(5)

    const tiers = new Set(scores.map((s) => s.tier))
    expect(tiers.has('Low')).toBe(true)
    expect(tiers.has('Critical') || tiers.has('High')).toBe(true)

    scores.forEach((s) => {
      expect(s.score).toBeGreaterThanOrEqual(0)
      expect(s.score).toBeLessThanOrEqual(100)
      expect(s.piiAccessRate).toBeGreaterThanOrEqual(0)
      expect(s.consentCompliancePct).toBeGreaterThanOrEqual(0)
      expect(s.consentCompliancePct).toBeLessThanOrEqual(100)
      expect(s.explanation.length).toBeGreaterThan(10)
    })
  })

  it('verifies adaptive thresholds reflect feedback and mathematical deltas', () => {
    const thresholds = generateAdaptiveThresholds()
    expect(thresholds.length).toBeGreaterThan(0)

    thresholds.forEach((t) => {
      expect(['Tightened', 'Relaxed']).toContain(t.direction)
      expect(t.previousThreshold).toBeGreaterThan(0)
      expect(t.updatedThreshold).toBeGreaterThan(0)
      expect(t.delta).toBe(t.updatedThreshold - t.previousThreshold)
      expect(t.reason.length).toBeGreaterThan(10)
    })
  })

  it('generates real-time anomaly events with valid trajectories and decisions', () => {
    const anomalies = generateAnomalyTrends()
    expect(anomalies.length).toBeGreaterThanOrEqual(4)
    anomalies.forEach((a) => {
      expect(a.id).toBeDefined()
      expect(a.user).toBeDefined()
      expect(a.anomalyType).toBeDefined()
      expect(a.score).toBeGreaterThanOrEqual(0)
      expect(a.score).toBeLessThanOrEqual(100)
      expect(['Spiking', 'Increasing', 'Decaying', 'Stabilizing']).toContain(a.trend)
      expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(a.decision)
    })
  })

  it('generates behavior comparisons with explainable driver features', () => {
    const users = generateUserBaselines()
    const marcus = users.find((u) => u.userId === 'EMP-1006')!
    const comparison = generateBehaviorComparison(marcus)

    expect(comparison.length).toBeGreaterThanOrEqual(4)
    comparison.forEach((c) => {
      expect(c.metric).toBeDefined()
      expect(c.oldBehavior).toBeDefined()
      expect(c.currentBehavior).toBeDefined()
      expect(c.driverFeature).toBeDefined()
      expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(c.decisionBefore)
      expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(c.decisionAfter)
    })
  })

  it('generates 4 evolution stages in baseline timeline', () => {
    const users = generateUserBaselines()
    const active = users[0]!
    const timeline = generateBaselineTimeline(active)

    expect(timeline.length).toBe(4)
    expect(timeline[0]?.phase).toContain('Phase 1')
    expect(timeline[3]?.phase).toContain('Phase 4')
  })

  it('generates an explainable adaptive summary narrative', () => {
    const users = generateUserBaselines()
    const thresholds = generateAdaptiveThresholds()
    const feedback = generateFeedbackLoopEvents()
    const summary = generateAdaptiveSummary(users[0]!, thresholds, feedback)

    expect(summary.userRiskTrends).toBeDefined()
    expect(summary.deptBaselineShift).toBeDefined()
    expect(summary.usbNormalizationInsight).toBeDefined()
    expect(summary.policyFeedbackTuning).toBeDefined()
    expect(summary.conceptDriftMetric).toContain('Concept drift score')
  })
})
