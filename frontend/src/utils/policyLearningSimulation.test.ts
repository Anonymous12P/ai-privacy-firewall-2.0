import { describe, expect, it } from 'vitest'
import {
  generateBeforeAfterComparisons,
  generateFeedbackLoopStages,
  generateFeedbackSummary,
  generateFnReductionMetrics,
  generateFpReductionMetrics,
  generateLearnedThresholds,
  generatePolicyConfidenceMetrics,
  generatePolicyEvolution,
  generatePolicyLearningSnapshot,
  generatePolicyRecommendations,
} from './policyLearningSimulation'

describe('Sprint 14 - Adaptive Policy Learning & Feedback Optimization Simulation', () => {
  it('generates consistent feedback summary metrics', () => {
    const summary = generateFeedbackSummary(0)
    expect(summary.confirmedTruePositives).toBeGreaterThan(100)
    expect(summary.markedFalsePositives).toBeGreaterThan(20)
    expect(summary.confirmedFalseNegatives).toBeGreaterThan(5)
    expect(summary.totalFeedbackEvents).toBe(
      summary.confirmedTruePositives + summary.markedFalsePositives + summary.confirmedFalseNegatives,
    )
    expect(summary.analystAccuracy).toBeGreaterThan(90)
  })

  it('tracks monotonic policy evolution across 4 versions', () => {
    const versions = generatePolicyEvolution()
    expect(versions.length).toBe(4)
    expect(versions[0]!.version).toContain('v1.0')
    expect(versions[3]!.version).toContain('v4.2')

    // FPR and FNR should decrease, confidence should increase
    expect(versions[3]!.falsePositiveRate).toBeLessThan(versions[0]!.falsePositiveRate)
    expect(versions[3]!.falseNegativeRate).toBeLessThan(versions[0]!.falseNegativeRate)
    expect(versions[3]!.averageConfidence).toBeGreaterThan(versions[0]!.averageConfidence)
  })

  it('calculates mathematically sound false positive reduction metrics', () => {
    const fpMetrics = generateFpReductionMetrics(1.4)
    expect(fpMetrics.previousFpr).toBe(6.8)
    expect(fpMetrics.currentFpr).toBe(1.4)
    expect(fpMetrics.reductionPercentage).toBeCloseTo(79.4, 1)
    expect(fpMetrics.falseAlarmsPreventedMonthly).toBeGreaterThan(1000)
    expect(fpMetrics.historicalFprData.length).toBe(4)
  })

  it('calculates mathematically sound false negative reduction metrics', () => {
    const fnMetrics = generateFnReductionMetrics(0.8)
    expect(fnMetrics.previousFnr).toBe(4.2)
    expect(fnMetrics.currentFnr).toBe(0.8)
    expect(fnMetrics.reductionPercentage).toBeCloseTo(81.0, 1)
    expect(fnMetrics.missedThreatsPrevented).toBeGreaterThan(20)
    expect(fnMetrics.historicalFnrData.length).toBe(4)
  })

  it('generates learned thresholds for all 6 digital twin departments', () => {
    const thresholds = generateLearnedThresholds()
    expect(thresholds.length).toBe(6)

    const finance = thresholds.find((t) => t.department === 'Finance')
    expect(finance).toBeDefined()
    expect(finance?.direction).toBe('TIGHTENED')
    expect(finance?.delta).toBeLessThan(0)

    const engineering = thresholds.find((t) => t.department === 'Engineering')
    expect(engineering).toBeDefined()
    expect(engineering?.direction).toBe('RELAXED')
    expect(engineering?.delta).toBeGreaterThan(0)
  })

  it('generates 6 actionable policy recommendations with expected impacts', () => {
    const recs = generatePolicyRecommendations()
    expect(recs.length).toBe(6)
    expect(recs.some((r) => r.status === 'ACCEPTED')).toBe(true)
    expect(recs.some((r) => r.status === 'PENDING')).toBe(true)
  })

  it('generates before/after policy comparisons with expected decision shifts', () => {
    const comps = generateBeforeAfterComparisons()
    expect(comps.length).toBe(4)
    comps.forEach((c) => {
      expect(c.oldPolicy.condition).toBeTruthy()
      expect(c.newPolicy.condition).toBeTruthy()
      expect(c.newPolicy.fpRate).toBeLessThan(c.oldPolicy.fpRate)
      expect(c.expectedDecisionShift).toBeTruthy()
    })
  })

  it('generates 6 sequential feedback loop pipeline stages', () => {
    const stages = generateFeedbackLoopStages()
    expect(stages.length).toBe(6)
    expect(stages[0]!.name).toBe('Alert Ingestion')
    expect(stages[5]!.name).toBe('Decision Enforcement')
  })

  it('generates confidence metrics and decile bins', () => {
    const conf = generatePolicyConfidenceMetrics(0)
    expect(conf.afterCalibrationConfidence).toBeGreaterThan(conf.beforeCalibrationConfidence)
    expect(conf.confidenceGain).toBeGreaterThan(10)
    expect(conf.confidenceDeciles.length).toBe(5)
  })

  it('generates a full PolicyLearningSnapshot with research synthesis', () => {
    const snapshot = generatePolicyLearningSnapshot()
    expect(snapshot.feedbackSummary.confirmedTruePositives).toBeGreaterThan(0)
    expect(snapshot.evolution.length).toBe(4)
    expect(snapshot.fpReduction.reductionPercentage).toBeGreaterThan(70)
    expect(snapshot.learnedThresholds.length).toBe(6)
    expect(snapshot.departmentAdaptations.length).toBe(4)
    expect(snapshot.summary.keyAchievements.length).toBeGreaterThanOrEqual(4)
    expect(snapshot.summary.recommendedNextActions.length).toBeGreaterThanOrEqual(3)
  })
})
