import { describe, expect, it, vi } from 'vitest'
import { evaluateAccess, getModelPipeline } from './firewallService'
import { apiClient } from '../api/client'
import type { FirewallModelPipelineResponse } from '../types/api'

describe('Real AI Model Pipeline Service', () => {
  it('fetches model pipeline metadata and validates benchmark schema', async () => {
    const mockPipeline: FirewallModelPipelineResponse = {
      status: 'LOADED_AND_OPERATIONAL',
      champion_model: 'DecisionTree',
      primary_metric: 'f1_score',
      models: [
        {
          model_name: 'DecisionTree',
          accuracy: 0.9928,
          f1_score: 0.993,
          precision: 0.9932,
          recall: 0.9928,
          roc_auc: 0.7628,
          pr_auc: 0.9968,
          log_loss: 0.2374,
          parameter_count: 3969,
          model_size_bytes: 40627,
          training_time_seconds: 7.29,
          prediction_time_seconds: 1.29,
          rank: 1,
          configuration: { criterion: 'gini' },
        },
        {
          model_name: 'RandomForest',
          accuracy: 0.9932,
          f1_score: 0.9924,
          precision: 0.9918,
          recall: 0.9932,
          roc_auc: 0.9311,
          pr_auc: 0.9991,
          log_loss: 0.0441,
          parameter_count: 457704,
          model_size_bytes: 4112387,
          training_time_seconds: 8.25,
          prediction_time_seconds: 1.3,
          rank: 2,
          configuration: { n_estimators: 100 },
        },
        {
          model_name: 'XGBoost',
          accuracy: 0.9932,
          f1_score: 0.9914,
          precision: 0.9909,
          recall: 0.9932,
          roc_auc: 0.9781,
          pr_auc: 0.9998,
          log_loss: 0.0212,
          parameter_count: 15136,
          model_size_bytes: 210579,
          training_time_seconds: 7.0,
          prediction_time_seconds: 1.63,
          rank: 3,
          configuration: { learning_rate: 0.1 },
        },
        {
          model_name: 'LogisticRegression',
          accuracy: 0.9932,
          f1_score: 0.9899,
          precision: 0.9865,
          recall: 0.9932,
          roc_auc: 0.9719,
          pr_auc: 0.9998,
          log_loss: 0.0227,
          parameter_count: 115,
          model_size_bytes: 5849,
          training_time_seconds: 22.28,
          prediction_time_seconds: 1.4,
          rank: 4,
          configuration: { C: 1.0 },
        },
      ],
      global_features: [
        {
          feature_name: 'indicator.usb',
          display_name: 'Removable USB Storage',
          mean_absolute_shap_value: 1.5282,
          percentage_contribution: 32.87,
          rank: 1,
          positive_contribution_count: 4003,
          negative_contribution_count: 1017,
        },
        {
          feature_name: 'behavioral_risk_index',
          display_name: 'Behavioral Risk Index',
          mean_absolute_shap_value: 0.5126,
          percentage_contribution: 11.02,
          rank: 2,
          positive_contribution_count: 3248,
          negative_contribution_count: 1772,
        },
      ],
      dataset: {
        dataset_name: 'CERT Insider Threat Test Dataset',
        dataset_version: 'r4.2 Subset Benchmark',
        total_records: 33466,
        feature_dimensions: 134,
        source_record_counts: { device: 49628, logon: 84446 },
        target_column: 'insider',
      },
      threshold_bands: [
        { action: 'ALLOW', risk_level: 'Low', min_score: 0.0, max_score: 0.25, description: 'Low risk' },
        { action: 'WARN', risk_level: 'Medium', min_score: 0.25, max_score: 0.6, description: 'Medium risk' },
        { action: 'RESTRICT', risk_level: 'High', min_score: 0.6, max_score: 0.85, description: 'Elevated risk' },
        { action: 'BLOCK', risk_level: 'Critical', min_score: 0.85, max_score: 1.0, description: 'Critical risk' },
      ],
      active_features: ['indicator.usb', 'behavioral_risk_index'],
    }

    vi.spyOn(apiClient, 'get').mockResolvedValueOnce({ data: mockPipeline })

    const result = await getModelPipeline()
    expect(result.status).toBe('LOADED_AND_OPERATIONAL')
    expect(result.champion_model).toBe('DecisionTree')
    expect(result.models).toHaveLength(4)
    expect(result.models[0].f1_score).toBeGreaterThan(0.98)
    expect(result.global_features[0].percentage_contribution).toBeCloseTo(32.87)
    expect(result.threshold_bands).toHaveLength(4)
  })

  it('evaluates access with specific model architecture', async () => {
    const mockEval = {
      evaluation_id: 'eval-1234',
      subject_id: 'PSF0133',
      resource: 'Customer Database',
      action: 'Bulk Download',
      decision: 'BLOCK' as const,
      risk_level: 'Critical' as const,
      risk_score: 0.95,
      policy_name: 'high-confidence-block',
      reasons: ['Mass USB data exfiltration observed'],
      explanation: {
        summary: 'Access blocked by XGBoost with 95.0% threat confidence.',
        reasons: ['Mass USB data exfiltration observed'],
        contributing_factors: { 'indicator.usb': 0.72 },
        confidence: 0.95,
        model_name: 'XGBoost',
      },
      behavior: {
        anomaly_score: 0.88,
        anomalous_indicators: ['indicator.usb'],
        risk_factors: ['USB mount during bulk query'],
        indicators_present: { 'indicator.usb': true },
      },
      timestamp: '2026-11-16T06:00:00Z',
    }

    vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: mockEval })

    const result = await evaluateAccess({
      features: { 'indicator.usb': 5.0, behavioral_risk_index: 1.0 },
      subject_id: 'PSF0133',
      resource: 'Customer Database',
      action: 'Bulk Download',
      model_name: 'XGBoost',
    })

    expect(result.decision).toBe('BLOCK')
    expect(result.risk_level).toBe('Critical')
    expect(result.risk_score).toBe(0.95)
    expect(result.explanation.model_name).toBe('XGBoost')
    expect(result.explanation.contributing_factors['indicator.usb']).toBe(0.72)
  })
})
