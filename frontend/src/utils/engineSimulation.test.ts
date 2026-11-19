import { describe, expect, it } from 'vitest'
import {
  GLOBAL_FEATURE_IMPORTANCE_DATA,
  MODEL_BENCHMARK_DATA,
  generateLiveEngineEvaluation,
} from './engineSimulation'

describe('engineSimulation', () => {
  it('generates a complete live evaluation with 9 indicators and 4 AI models', () => {
    const evaluation = generateLiveEngineEvaluation()

    // Evaluation Identity
    expect(typeof evaluation.id).toBe('string')
    expect(typeof evaluation.timestamp).toBe('string')
    expect(typeof evaluation.employee).toBe('string')
    expect(typeof evaluation.department).toBe('string')
    expect(typeof evaluation.resource).toBe('string')
    expect(typeof evaluation.operation).toBe('string')
    expect(typeof evaluation.device).toBe('string')
    expect(typeof evaluation.ipAddress).toBe('string')

    // 9 Behavioral Indicators
    expect(typeof evaluation.indicators.usb).toBe('boolean')
    expect(typeof evaluation.indicators.offHours).toBe('boolean')
    expect(typeof evaluation.indicators.failedLogins).toBe('boolean')
    expect(typeof evaluation.indicators.httpBurst).toBe('boolean')
    expect(typeof evaluation.indicators.emailAttachment).toBe('boolean')
    expect(typeof evaluation.indicators.massDownload).toBe('boolean')
    expect(typeof evaluation.indicators.vpn).toBe('boolean')
    expect(typeof evaluation.indicators.byod).toBe('boolean')
    expect(typeof evaluation.indicators.impossibleTravel).toBe('boolean')

    expect(evaluation.indicatorStates).toHaveLength(9)

    // 4 AI Models
    expect(evaluation.models.logisticRegression).toBeDefined()
    expect(evaluation.models.decisionTree).toBeDefined()
    expect(evaluation.models.randomForest).toBeDefined()
    expect(evaluation.models.xgboost).toBeDefined()

    expect(evaluation.aggregatedThreatScore).toBeGreaterThanOrEqual(0)
    expect(evaluation.aggregatedThreatScore).toBeLessThanOrEqual(100)
    expect(evaluation.ensembleConfidence).toBeGreaterThan(0.7)

    // Explainability
    expect(evaluation.featureContributions.length).toBeGreaterThan(0)
    expect(typeof evaluation.explanationSummary).toBe('string')
    expect(evaluation.reasons.length).toBeGreaterThan(0)

    // Decision
    expect(['ALLOW', 'WARN', 'RESTRICT', 'BLOCK']).toContain(evaluation.decision)
    expect(typeof evaluation.policyName).toBe('string')
    expect(typeof evaluation.enforcementAction).toBe('string')
  })

  it('correctly maps forced decision tiers and threat thresholds', () => {
    const blocked = generateLiveEngineEvaluation('BLOCK')
    expect(blocked.decision).toBe('BLOCK')
    expect(blocked.aggregatedThreatScore).toBeGreaterThan(75)

    const restricted = generateLiveEngineEvaluation('RESTRICT')
    expect(restricted.decision).toBe('RESTRICT')
    expect(restricted.aggregatedThreatScore).toBeGreaterThan(50)
    expect(restricted.aggregatedThreatScore).toBeLessThanOrEqual(75)

    const warned = generateLiveEngineEvaluation('WARN')
    expect(warned.decision).toBe('WARN')
    expect(warned.aggregatedThreatScore).toBeGreaterThanOrEqual(25)
    expect(warned.aggregatedThreatScore).toBeLessThanOrEqual(50)

    const allowed = generateLiveEngineEvaluation('ALLOW')
    expect(allowed.decision).toBe('ALLOW')
    expect(allowed.aggregatedThreatScore).toBeLessThan(25)
  })

  it('provides static benchmark and feature importance data', () => {
    expect(MODEL_BENCHMARK_DATA).toHaveLength(4)
    MODEL_BENCHMARK_DATA.forEach((m) => {
      expect(m.accuracy).toBeGreaterThan(90)
      expect(m.precision).toBeGreaterThan(90)
      expect(m.recall).toBeGreaterThan(90)
      expect(m.f1Score).toBeGreaterThan(90)
    })

    expect(GLOBAL_FEATURE_IMPORTANCE_DATA.length).toBeGreaterThanOrEqual(8)
    GLOBAL_FEATURE_IMPORTANCE_DATA.forEach((f) => {
      expect(f.importance).toBeGreaterThan(0)
      expect(typeof f.feature).toBe('string')
    })
  })
})
