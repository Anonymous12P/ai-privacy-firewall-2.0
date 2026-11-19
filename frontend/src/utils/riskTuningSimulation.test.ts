import { describe, expect, it } from 'vitest'
import {
  computeProjectedImpact,
  computeRiskTier,
  evaluateDecision,
  generateCalibrationMetrics,
  generateDecisionBoundaryPoints,
  generateRiskTuningSnapshot,
  generateScoreDecomposition,
  generateSensitivityScenarios,
} from './riskTuningSimulation'

describe('Sprint 13 - Privacy Risk Scoring & Adaptive Threshold Tuning Simulation', () => {
  it('correctly maps risk scores to risk tiers', () => {
    expect(computeRiskTier(15)).toBe('LOW')
    expect(computeRiskTier(35)).toBe('LOW')
    expect(computeRiskTier(36)).toBe('MEDIUM')
    expect(computeRiskTier(65)).toBe('MEDIUM')
    expect(computeRiskTier(66)).toBe('HIGH')
    expect(computeRiskTier(84)).toBe('HIGH')
    expect(computeRiskTier(85)).toBe('CRITICAL')
    expect(computeRiskTier(100)).toBe('CRITICAL')
  })

  it('evaluates decisions accurately according to decision boundaries', () => {
    const thresholds = {
      allowThreshold: 35,
      warnThreshold: 65,
      restrictThreshold: 82,
      blockThreshold: 90,
    }

    expect(evaluateDecision(20, thresholds)).toBe('ALLOW')
    expect(evaluateDecision(35, thresholds)).toBe('ALLOW')
    expect(evaluateDecision(36, thresholds)).toBe('WARN')
    expect(evaluateDecision(65, thresholds)).toBe('WARN')
    expect(evaluateDecision(66, thresholds)).toBe('RESTRICT')
    expect(evaluateDecision(82, thresholds)).toBe('RESTRICT')
    expect(evaluateDecision(83, thresholds)).toBe('BLOCK')
    expect(evaluateDecision(95, thresholds)).toBe('BLOCK')
  })

  it('ensures projected decision impact percentages sum to 100%', () => {
    const impact = computeProjectedImpact(35, 65, 82, 90)
    const total = impact.allowRate + impact.warnRate + impact.restrictRate + impact.blockRate
    expect(Math.round(total)).toBe(100)
    expect(impact.falsePositiveRate).toBeGreaterThan(0)
    expect(impact.falseNegativeRate).toBeGreaterThan(0)
  })

  it('generates 10 explainable score decomposition factors', () => {
    const decomp = generateScoreDecomposition('EMP-1002', 'John', 78)
    expect(decomp.userId).toBe('EMP-1002')
    expect(decomp.totalScore).toBe(78)
    expect(decomp.factors.length).toBe(10)

    const usbFactor = decomp.factors.find((f) => f.name.includes('USB'))
    expect(usbFactor).toBeDefined()
    expect(usbFactor?.direction).toBe('INCREASES_RISK')
    expect(usbFactor?.points).toBeGreaterThan(0)
  })

  it('generates all 6 sensitivity analysis scenarios with positive deltas', () => {
    const thresholds = {
      allowThreshold: 35,
      warnThreshold: 65,
      restrictThreshold: 82,
      blockThreshold: 90,
      mode: 'ADAPTIVE' as const,
      learningRate: 0.05,
      sensitivityFactor: 1.25,
      projectedImpact: computeProjectedImpact(35, 65, 82, 90),
    }

    const scenarios = generateSensitivityScenarios(thresholds)
    expect(scenarios.length).toBe(6)

    const usbScenario = scenarios.find((s) => s.factorName.includes('USB'))
    expect(usbScenario).toBeDefined()
    expect(usbScenario?.riskScoreDelta).toBeGreaterThan(30)
  })

  it('generates consistent calibration metrics and curve bins', () => {
    const cal = generateCalibrationMetrics(0)
    expect(cal.confidenceCalibration).toBeGreaterThan(90)
    expect(cal.brierScore).toBeLessThan(0.15)
    expect(cal.thresholdAccuracy).toBeGreaterThan(90)
    expect(cal.calibrationCurve.length).toBe(10)
  })

  it('generates decision boundary density curve across the 0-100 score range', () => {
    const thresholds = {
      allowThreshold: 35,
      warnThreshold: 65,
      restrictThreshold: 82,
      blockThreshold: 90,
      mode: 'ADAPTIVE' as const,
      learningRate: 0.05,
      sensitivityFactor: 1.25,
      projectedImpact: computeProjectedImpact(35, 65, 82, 90),
    }

    const points = generateDecisionBoundaryPoints(thresholds)
    expect(points.length).toBeGreaterThan(40)
    expect(points[0]!.riskScore).toBe(0)
    expect(points[points.length - 1]!.riskScore).toBe(100)
  })

  it('generates a complete RiskTuningSnapshot with mathematical consistency', () => {
    const snapshot = generateRiskTuningSnapshot('EMP-1002')

    expect(snapshot.users.length).toBe(6)
    expect(snapshot.departments.length).toBe(6)
    expect(snapshot.thresholds.allowThreshold).toBeLessThan(snapshot.thresholds.warnThreshold)
    expect(snapshot.thresholds.warnThreshold).toBeLessThan(snapshot.thresholds.restrictThreshold)
    expect(snapshot.thresholds.restrictThreshold).toBeLessThan(snapshot.thresholds.blockThreshold)
    expect(snapshot.activeRequests.length).toBeGreaterThan(0)
    expect(snapshot.thresholdHistory.length).toBeGreaterThan(0)
    expect(snapshot.summary.highestRiskDepartment).toBeTruthy()
    expect(snapshot.summary.highestRiskUser).toBeTruthy()
    expect(snapshot.summary.keyFindings.length).toBeGreaterThanOrEqual(3)
  })
})
