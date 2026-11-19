import { describe, expect, it } from 'vitest'
import {
  generateConfusionMatrices,
  generateCurves,
  generateDatasetOverview,
  generateExperimentSnapshot,
  generateExperimentSummary,
  generateExplainabilityExperiments,
  generateFeatureEngineeringStages,
  generateFeatureImportance,
  generateModelBenchmarks,
  generateRunHistory,
  generateSplitSummary,
  generateTrainingMetrics,
} from './experimentSimulation'

describe('Model Training & Experiment Simulation Engine', () => {
  it('generates a complete and consistent experiment snapshot', () => {
    const snapshot = generateExperimentSnapshot()

    expect(snapshot).toBeDefined()
    expect(snapshot.dataset.datasetName).toContain('CERT')
    expect(snapshot.benchmarks.length).toBe(4)
    expect(snapshot.featureStages.length).toBe(5)
    expect(snapshot.featureImportance.length).toBe(10)
    expect(snapshot.runs.length).toBeGreaterThanOrEqual(4)
    expect(snapshot.explainability.length).toBe(4)
    expect(snapshot.trainingMetrics.lossHistory.length).toBe(45)
  })

  it('verifies dataset and split statistics are mathematically exact', () => {
    const dataset = generateDatasetOverview()
    const split = generateSplitSummary()

    expect(dataset.benchmarkRecords).toBe(250000)
    expect(split.trainRecords + split.valRecords + split.testRecords).toBe(250000)
    expect(split.trainPercent + split.valPercent + split.testPercent).toBe(100)

    const totalTestRecords =
      split.classDistribution.test.benign + split.classDistribution.test.threat
    expect(totalTestRecords).toBe(split.testRecords)
  })

  it('verifies confusion matrices match test set ground truth and mathematical definitions', () => {
    const matrices = generateConfusionMatrices()
    const models = ['XGBoost', 'RandomForest', 'DecisionTree', 'LogisticRegression'] as const

    models.forEach((m) => {
      const cm = matrices[m]
      expect(cm).toBeDefined()

      // Total test set instances evaluated must equal 37,500
      const total = cm.tp + cm.tn + cm.fp + cm.fn
      expect(total).toBe(37500)

      // Total actual threats in test set is 45
      expect(cm.tp + cm.fn).toBe(45)
      // Total actual benign in test set is 37,455
      expect(cm.tn + cm.fp).toBe(37455)

      // Verified metrics calculations
      const calculatedPrecision = (cm.tp / (cm.tp + cm.fp)) * 100
      expect(Math.abs(cm.precision - calculatedPrecision)).toBeLessThan(0.1)

      const calculatedRecall = (cm.tp / (cm.tp + cm.fn)) * 100
      expect(Math.abs(cm.recall - calculatedRecall)).toBeLessThan(0.1)
    })
  })

  it('ranks models correctly with XGBoost as top candidate', () => {
    const benchmarks = generateModelBenchmarks()

    expect(benchmarks.length).toBe(4)
    const topModel = benchmarks[0]!
    expect(topModel.modelName).toBe('XGBoost')
    expect(topModel.rank).toBe(1)
    expect(topModel.f1Score).toBeGreaterThan(95.0)
    expect(topModel.rocAuc).toBeGreaterThan(97.0)
    expect(topModel.status).toBe('Production Candidate')
  })

  it('generates valid ROC and Precision-Recall curve trajectories', () => {
    const curves = generateCurves()
    expect(curves.length).toBe(4)

    curves.forEach((curve) => {
      expect(curve.rocPoints.length).toBeGreaterThan(4)
      expect(curve.prPoints.length).toBeGreaterThan(4)
      expect(curve.aucScore).toBeGreaterThan(0.7)

      // ROC starts at (0,0) and ends at (1,1)
      expect(curve.rocPoints[0]?.x).toBe(0.0)
      expect(curve.rocPoints[0]?.y).toBe(0.0)
      expect(curve.rocPoints[curve.rocPoints.length - 1]?.x).toBe(1.0)
      expect(curve.rocPoints[curve.rocPoints.length - 1]?.y).toBe(1.0)
    })
  })

  it('ranks USB and mass download as top feature importances', () => {
    const features = generateFeatureImportance()
    expect(features.length).toBe(10)

    expect(features[0]?.displayName).toContain('USB')
    expect(features[0]?.importanceWeight).toBeGreaterThan(0.3)
    expect(features[1]?.displayName).toContain('Bulk File')
  })

  it('generates smooth training and validation loss convergence', () => {
    const metrics = generateTrainingMetrics()

    expect(metrics.epochsTotal).toBe(45)
    expect(metrics.bestEpoch).toBe(38)
    expect(metrics.convergenceStatus).toBe('Converged')

    // Initial loss is higher than final loss
    const firstEpoch = metrics.lossHistory[0]!
    const lastEpoch = metrics.lossHistory[metrics.lossHistory.length - 1]!
    expect(firstEpoch.trainLoss).toBeGreaterThan(lastEpoch.trainLoss)
    expect(lastEpoch.valAccuracy).toBeGreaterThan(95.0)
  })

  it('generates an informative research summary narrative', () => {
    const summary = generateExperimentSummary()

    expect(summary.bestModelName).toBe('XGBoost')
    expect(summary.strongestFeatures.length).toBeGreaterThan(2)
    expect(summary.majorFindings).toContain('SMOTE')
    expect(summary.productionRecommendation).toContain('Deploy the XGBoost')
  })

  it('verifies feature stages and run history collections', () => {
    const stages = generateFeatureEngineeringStages()
    const runs = generateRunHistory()
    const explainability = generateExplainabilityExperiments()

    expect(stages.length).toBe(5)
    expect(runs.length).toBe(4)
    expect(runs.some((r) => r.isBest)).toBe(true)
    expect(explainability.length).toBe(4)
  })
})
