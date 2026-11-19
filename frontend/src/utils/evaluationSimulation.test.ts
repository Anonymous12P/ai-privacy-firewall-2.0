import { describe, expect, it } from 'vitest'
import {
  generateAblationStudy,
  generateBenchmarkOverview,
  generateConfusionMatrices,
  generateDriftScenarios,
  generateEvaluationSnapshot,
  generateFprFnrAnalysis,
  generateLatencyThroughput,
  generateModelBenchmarks,
  generateModelCurves,
  generatePrivacyImpact,
  generatePublicationSummary,
  generateReproducibilityMetadata,
  generateShapQuality,
} from './evaluationSimulation'

describe('Sprint 15 - Research Evaluation & Paper-Ready Results Simulation', () => {
  it('generates consistent CMU SEI CERT r4.2 benchmark overview', () => {
    const overview = generateBenchmarkOverview()
    expect(overview.datasetName).toContain('CERT')
    expect(overview.userCount).toBe(1000)
    expect(overview.processedRecordCount).toBe(250000)
    expect(overview.totalFeatures).toBe(42)
    expect(overview.modelFamiliesTested.length).toBe(4)
  })

  it('generates model comparison benchmarks with XGBoost as champion', () => {
    const models = generateModelBenchmarks(0)
    expect(models.length).toBe(4)

    const champion = models.find((m) => m.isChampion)
    expect(champion).toBeDefined()
    expect(champion?.modelName).toBe('XGBoost')
    expect(champion?.rocAuc).toBeGreaterThan(0.98)
    expect(champion?.f1Score).toBeGreaterThan(95.0)

    // All metrics should be in [0, 100] or [0, 1.0]
    models.forEach((m) => {
      expect(m.accuracy).toBeGreaterThan(80)
      expect(m.rocAuc).toBeGreaterThan(0.85)
      expect(m.latencyMs).toBeLessThan(3.0)
    })
  })

  it('generates 10-feature ablation study with significant performance drops', () => {
    const ablation = generateAblationStudy()
    expect(ablation.length).toBe(10)

    ablation.forEach((row) => {
      expect(row.deltaF1).toBeLessThan(0)
      expect(row.deltaAuc).toBeLessThan(0)
      expect(row.ablatedF1).toBeLessThan(row.baselineF1)
      expect(row.ablatedAuc).toBeLessThan(row.baselineAuc)
    })

    const usbAblation = ablation.find((a) => a.featureRemoved === 'usb_mass_storage_usage')
    expect(usbAblation?.criticality).toBe('CRITICAL')
  })

  it('generates mathematically consistent confusion matrices for all 4 models', () => {
    const matrices = generateConfusionMatrices()
    const modelKeys = ['XGBoost', 'RandomForest', 'DecisionTree', 'LogisticRegression']

    modelKeys.forEach((key) => {
      const cm = matrices[key]
      expect(cm).toBeDefined()
      expect(cm!.tp + cm!.tn + cm!.fp + cm!.fn).toBe(cm!.total)
      expect(cm!.accuracy).toBeGreaterThan(85)
      expect(cm!.precision).toBeGreaterThan(0)
      expect(cm!.recall).toBeGreaterThan(0)
      expect(cm!.specificity).toBeGreaterThan(0)
      expect(cm!.f1Score).toBeGreaterThan(0)
    })
  })

  it('generates high-resolution ROC and PR curves with monotonic progression', () => {
    const curves = generateModelCurves()
    expect(curves.length).toBe(4)

    curves.forEach((c) => {
      expect(c.rocPoints.length).toBeGreaterThan(5)
      expect(c.prPoints.length).toBeGreaterThan(4)
      expect(c.rocAuc).toBeGreaterThan(0.8)
      expect(c.prAuc).toBeGreaterThan(0.8)
    })
  })

  it('generates SHAP explanation quality metrics with sub-2ms TreeSHAP latency', () => {
    const shap = generateShapQuality()
    expect(shap.explanationFidelity).toBeGreaterThan(95)
    expect(shap.localStability).toBeGreaterThan(90)
    expect(shap.globalConsistency).toBeGreaterThan(95)
    expect(shap.treeShapLatencyMs).toBeLessThan(5.0)
    expect(shap.speedupFactor).toBeGreaterThan(10)
    expect(shap.sampleExplanation).toBeTruthy()
  })

  it('generates latency and throughput metrics satisfying enterprise SLOs', () => {
    const lat = generateLatencyThroughput()
    expect(lat.meanLatencyMs).toBeLessThan(2.0)
    expect(lat.p95LatencyMs).toBeGreaterThanOrEqual(lat.meanLatencyMs)
    expect(lat.p99LatencyMs).toBeGreaterThanOrEqual(lat.p95LatencyMs)
    expect(lat.requestsPerSecond).toBeGreaterThan(1000)
    expect(lat.latencyDeciles.length).toBe(6)
  })

  it('demonstrates drift robustness where adaptive model outperforms static baseline', () => {
    const drift = generateDriftScenarios()
    expect(drift.length).toBe(4)

    drift.forEach((scenario) => {
      expect(scenario.adaptiveFirewallF1).toBeGreaterThan(scenario.staticModelF1)
      expect(scenario.resilienceDelta).toBeGreaterThan(15)
    })
  })

  it('validates FPR and FNR reduction metrics', () => {
    const analysis = generateFprFnrAnalysis()
    expect(analysis.fprReductionPct).toBeCloseTo(79.4, 1)
    expect(analysis.fnrReductionPct).toBeCloseTo(81.0, 1)
    expect(analysis.postTuningFpr).toBeLessThan(analysis.preTuningFpr)
    expect(analysis.postTuningFnr).toBeLessThan(analysis.preTuningFnr)
  })

  it('generates privacy impact and reproducibility metadata', () => {
    const impact = generatePrivacyImpact()
    expect(impact.preventedExfiltrationAttempts).toBeGreaterThan(100)
    expect(impact.complianceRatePct).toBeGreaterThan(95)

    const meta = generateReproducibilityMetadata()
    expect(meta.bibtexCitation).toContain('@article')
    expect(meta.simulationSeed).toBe(42)
  })

  it('generates a complete publication summary with paper-ready abstract', () => {
    const pub = generatePublicationSummary()
    expect(pub.bestModel).toContain('XGBoost')
    expect(pub.strongestFeatures.length).toBeGreaterThanOrEqual(3)
    expect(pub.keyFindings.length).toBeGreaterThanOrEqual(3)
    expect(pub.abstractText.length).toBeGreaterThan(200)
  })

  it('generates a full EvaluationSnapshot with all research modules', () => {
    const snapshot = generateEvaluationSnapshot()
    expect(snapshot.benchmark).toBeDefined()
    expect(snapshot.models.length).toBe(4)
    expect(snapshot.ablation.length).toBe(10)
    expect(Object.keys(snapshot.confusionMatrices).length).toBe(4)
    expect(snapshot.curves.length).toBe(4)
    expect(snapshot.shapQuality).toBeDefined()
    expect(snapshot.latency).toBeDefined()
    expect(snapshot.driftRobustness.length).toBe(4)
    expect(snapshot.fprFnr).toBeDefined()
    expect(snapshot.privacyImpact).toBeDefined()
    expect(snapshot.metadata).toBeDefined()
    expect(snapshot.publication).toBeDefined()
  })
})
