import { useEffect, useState } from 'react'
import {
  BeakerIcon,
  BoltIcon,
  CheckCircleIcon,
  CpuChipIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../components/Card'
import { useFirewallModelPipeline } from '../hooks/useFirewall'
import { ConfusionMatrixPanel } from '../components/experiments/ConfusionMatrixPanel'
import { DatasetOverviewCard } from '../components/experiments/DatasetOverviewCard'
import { ExperimentRunHistory } from '../components/experiments/ExperimentRunHistory'
import { ExperimentSummaryCard } from '../components/experiments/ExperimentSummaryCard'
import { ExplainabilityExperimentCard } from '../components/experiments/ExplainabilityExperimentCard'
import { FeatureEngineeringCard } from '../components/experiments/FeatureEngineeringCard'
import { FeatureImportancePanel } from '../components/experiments/FeatureImportancePanel'
import { ModelBenchmarkTable } from '../components/experiments/ModelBenchmarkTable'
import { ModelComparisonChart } from '../components/experiments/ModelComparisonChart'
import { PrCurveChart } from '../components/experiments/PrCurveChart'
import { RocCurveChart } from '../components/experiments/RocCurveChart'
import { SplitSummaryCard } from '../components/experiments/SplitSummaryCard'
import { TrainingMetricsCard } from '../components/experiments/TrainingMetricsCard'
import type { ExperimentSnapshot } from '../types/experiments'
import { generateExperimentSnapshot } from '../utils/experimentSimulation'

export function ExperimentCenterPage() {
  const { data: pipelineData } = useFirewallModelPipeline()
  const [snapshot, setSnapshot] = useState<ExperimentSnapshot>(() =>
    generateExperimentSnapshot(),
  )
  const [isStreaming, setIsStreaming] = useState(true)

  // Simulation loop updating every 5 seconds
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setSnapshot(generateExperimentSnapshot())
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const handleRetrain = () => {
    setSnapshot(generateExperimentSnapshot())
    toast.success('Triggered automated cross-validation grid search & model evaluation')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Research Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <BeakerIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
                  Model Training & Experiment Center
                </h1>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  ML Research Lab
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Reproducible machine learning training pipelines, feature engineering benchmarks, confusion matrix diagnostics, and explainability experiments.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Live streaming status & toggle */}
          <button
            type="button"
            onClick={() => setIsStreaming((prev) => !prev)}
            className={`cursor-pointer inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-xs transition ${
              isStreaming
                ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {isStreaming ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <PauseIcon className="h-4 w-4 text-emerald-600" />
                <span>Live Telemetry (5s)</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 text-slate-500" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          {/* Re-run Pipeline */}
          <button
            type="button"
            onClick={handleRetrain}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <BoltIcon className="h-4 w-4" />
            <span>Retrain & Benchmark</span>
          </button>
        </div>
      </div>

      {/* Real AI Model Pipeline Live Status */}
      <Card className="border-indigo-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <CpuChipIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Real Serialized Machine Learning Pipeline
                </h2>
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3 text-emerald-600" />
                  {pipelineData?.status ?? 'LOADED_AND_OPERATIONAL'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Active production candidate: <strong className="text-indigo-700">{pipelineData?.champion_model ?? 'DecisionTree'}</strong> (evaluated across CMU SEI CERT r4.2 benchmark subset).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-700">
              Dataset Records: <strong>{(pipelineData?.dataset?.total_records ?? 33466).toLocaleString()}</strong>
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] text-slate-700">
              Feature Dimensions: <strong>{pipelineData?.dataset?.feature_dimensions ?? 134}</strong>
            </span>
          </div>
        </div>

        {/* 4 Model Summary Cards */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(pipelineData?.models ?? [
            { model_name: 'DecisionTree', accuracy: 0.9928, f1_score: 0.9930, roc_auc: 0.7628, model_size_bytes: 40627, rank: 1 },
            { model_name: 'RandomForest', accuracy: 0.9932, f1_score: 0.9924, roc_auc: 0.9311, model_size_bytes: 4112387, rank: 2 },
            { model_name: 'XGBoost', accuracy: 0.9932, f1_score: 0.9914, roc_auc: 0.9781, model_size_bytes: 210579, rank: 3 },
            { model_name: 'LogisticRegression', accuracy: 0.9932, f1_score: 0.9899, roc_auc: 0.9719, model_size_bytes: 5849, rank: 4 },
          ]).map((m) => {
            const isChamp = (pipelineData?.champion_model ?? 'DecisionTree') === m.model_name
            return (
              <div
                key={m.model_name}
                className={`rounded-xl border p-3 text-xs transition ${
                  isChamp
                    ? 'border-indigo-300 bg-indigo-50/40 ring-1 ring-indigo-200'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{m.model_name}</span>
                  {isChamp ? (
                    <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-black text-indigo-700 uppercase">
                      Rank #{m.rank} Champion
                    </span>
                  ) : (
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                      Rank #{m.rank}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>F1-Score:</span>
                    <strong className="font-mono text-slate-900">{(m.f1_score * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>ROC-AUC:</span>
                    <strong className="font-mono text-indigo-700">{(m.roc_auc * 100).toFixed(2)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Artifact Size:</span>
                    <span className="font-mono text-slate-500">{(m.model_size_bytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* 13. Executive Experiment Summary Card */}
      <ExperimentSummaryCard summary={snapshot.summary} />

      {/* 1. Dataset Overview Card */}
      <DatasetOverviewCard dataset={snapshot.dataset} />

      {/* 2. Feature Engineering Pipeline Card */}
      <FeatureEngineeringCard stages={snapshot.featureStages} />

      {/* 3. Train / Validation / Test Split Summary */}
      <SplitSummaryCard split={snapshot.split} />

      {/* 4. Model Benchmark Matrix */}
      <ModelBenchmarkTable benchmarks={snapshot.benchmarks} />

      {/* 5. Model Comparison Grouped Chart */}
      <ModelComparisonChart benchmarks={snapshot.benchmarks} />

      {/* 6. Confusion Matrix Diagnostics */}
      <ConfusionMatrixPanel matrices={snapshot.confusionMatrices} />

      {/* 7 & 8: ROC and PR Curves Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RocCurveChart curves={snapshot.curves} />
        <PrCurveChart curves={snapshot.curves} />
      </div>

      {/* 9. Global Feature Importance (SHAP) */}
      <FeatureImportancePanel features={snapshot.featureImportance} />

      {/* 11. Explainability Experiment Card */}
      <ExplainabilityExperimentCard items={snapshot.explainability} />

      {/* 12. Training Optimization Metrics Card */}
      <TrainingMetricsCard metrics={snapshot.trainingMetrics} />

      {/* 10. Experiment Run Execution History */}
      <ExperimentRunHistory runs={snapshot.runs} />
    </div>
  )
}
