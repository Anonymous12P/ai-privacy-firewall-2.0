import { useEffect, useState } from 'react'
import {
  AdjustmentsHorizontalIcon,
  BoltIcon,
  CpuChipIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../components/Card'
import { useFirewallModelPipeline } from '../hooks/useFirewall'
import type { FirewallModelName } from '../types/api'
import { CalibrationMetricsCard } from '../components/risk/CalibrationMetricsCard'
import { DecisionBoundaryChart } from '../components/risk/DecisionBoundaryChart'
import { DepartmentThresholdOverrides } from '../components/risk/DepartmentThresholdOverrides'
import { PrivacyRiskScoreCard } from '../components/risk/PrivacyRiskScoreCard'
import { RiskTrendChart } from '../components/risk/RiskTrendChart'
import { RiskTuningSummary } from '../components/risk/RiskTuningSummary'
import { ScoreDecompositionPanel } from '../components/risk/ScoreDecompositionPanel'
import { SensitivityAnalysisCard } from '../components/risk/SensitivityAnalysisCard'
import { ThresholdHistoryTable } from '../components/risk/ThresholdHistoryTable'
import { ThresholdSliderCard } from '../components/risk/ThresholdSliderCard'
import type { FirewallThresholds, RiskTuningSnapshot } from '../types/riskTuning'
import { generateRiskTuningSnapshot } from '../utils/riskTuningSimulation'

export function RiskTuningPage() {
  const { data: pipelineData } = useFirewallModelPipeline()
  const [activeModel, setActiveModel] = useState<FirewallModelName>('XGBoost')
  const [selectedUserId, setSelectedUserId] = useState<string>('EMP-1002')
  const [customThresholds, setCustomThresholds] = useState<Partial<FirewallThresholds>>({
    allowThreshold: 35,
    warnThreshold: 65,
    restrictThreshold: 82,
    blockThreshold: 90,
  })
  const [snapshot, setSnapshot] = useState<RiskTuningSnapshot>(() =>
    generateRiskTuningSnapshot('EMP-1002', customThresholds),
  )
  const [isStreaming, setIsStreaming] = useState(true)

  // Simulation polling every 5 seconds
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setSnapshot(generateRiskTuningSnapshot(selectedUserId, customThresholds))
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming, selectedUserId, customThresholds])

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
    setSnapshot(generateRiskTuningSnapshot(userId, customThresholds))
    toast.info(`Subject shifted to ${userId}`)
  }

  const handleUpdateThresholds = (updated: FirewallThresholds) => {
    setCustomThresholds(updated)
    setSnapshot(generateRiskTuningSnapshot(selectedUserId, updated))
  }

  const handleRecalibrate = () => {
    setSnapshot(generateRiskTuningSnapshot(selectedUserId, customThresholds))
    toast.success('Empirical Bayesian re-calibration completed across enterprise decision boundaries')
  }

  const activeProgression =
    snapshot.userProgressions[selectedUserId] ??
    Object.values(snapshot.userProgressions)[0]!

  const activeDecomposition =
    snapshot.scoreDecompositions[selectedUserId] ??
    Object.values(snapshot.scoreDecompositions)[0]!

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
                  Privacy Risk Scoring & Adaptive Threshold Tuning
                </h1>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  RISK
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Continuous Bayesian risk scoring, decision boundary sensitivity, and explainable decision calibration.
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
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isStreaming ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <PauseIcon className="h-3.5 w-3.5" />
                Live 5s Stream
              </>
            ) : (
              <>
                <PlayIcon className="h-3.5 w-3.5 text-slate-500" />
                Stream Paused
              </>
            )}
          </button>

          {/* Manual Re-calibrate */}
          <button
            type="button"
            onClick={handleRecalibrate}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <BoltIcon className="h-4 w-4" />
            Re-Calibrate Boundaries
          </button>
        </div>
      </div>

      {/* Real AI Model Pipeline Calibration Card */}
      <Card className="border-indigo-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
              <CpuChipIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Real AI Model Decision Calibration & Sensitivity
                </h2>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  Production Champion: {pipelineData?.champion_model ?? 'XGBoost'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Calibrated threat probability thresholds P(threat | x) mapped to deterministic firewall policy actions.
              </p>
            </div>
          </div>

          {/* Model Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['XGBoost', 'RandomForest', 'DecisionTree', 'LogisticRegression'] as const).map((m) => {
              const isSelected = activeModel === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setActiveModel(m)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </div>

        {/* 4 Threshold Bands Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(pipelineData?.threshold_bands ?? [
            { action: 'ALLOW', risk_level: 'Low', min_score: 0.0, max_score: 0.25, description: 'Low privacy risk. Auto-allowed under standard monitoring.' },
            { action: 'WARN', risk_level: 'Medium', min_score: 0.25, max_score: 0.60, description: 'Moderate behavioral deviation. Allowed with real-time audit advisory warning.' },
            { action: 'RESTRICT', risk_level: 'High', min_score: 0.60, max_score: 0.85, description: 'Elevated anomaly score. Access restricted to read-only with step-up verification.' },
            { action: 'BLOCK', risk_level: 'Critical', min_score: 0.85, max_score: 1.0, description: 'High confidence insider threat. Access immediately blocked and incident triggered.' },
          ]).map((b) => (
            <div
              key={b.action}
              className={`rounded-xl border p-3 text-xs ${
                b.action === 'BLOCK'
                  ? 'border-rose-200 bg-rose-50/40'
                  : b.action === 'RESTRICT'
                    ? 'border-amber-200 bg-amber-50/40'
                    : b.action === 'WARN'
                      ? 'border-yellow-200 bg-yellow-50/40'
                      : 'border-emerald-200 bg-emerald-50/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase font-mono ${
                    b.action === 'BLOCK'
                      ? 'bg-rose-100 text-rose-800'
                      : b.action === 'RESTRICT'
                        ? 'bg-amber-100 text-amber-800'
                        : b.action === 'WARN'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {b.action}
                </span>
                <span className="font-mono text-xs font-bold text-slate-700">
                  {(b.min_score * 100).toFixed(0)}% - {(b.max_score * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-[11px] text-slate-600 leading-tight">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 1. Privacy Risk Score Dashboard (User Hero + Department Badges) */}
      <PrivacyRiskScoreCard
        users={snapshot.users}
        departments={snapshot.departments}
        selectedUserId={selectedUserId}
        onSelectUser={handleSelectUser}
      />

      {/* 2. Adaptive Threshold Tuning */}
      <ThresholdSliderCard
        thresholds={snapshot.thresholds}
        onUpdateThresholds={handleUpdateThresholds}
      />

      {/* 3. Decision Boundary Visualization */}
      <DecisionBoundaryChart
        points={snapshot.decisionBoundaryPoints}
        samples={snapshot.activeRequests}
        thresholds={snapshot.thresholds}
      />

      {/* 4. Score Decomposition (Explainable 10-factor breakdown) */}
      <ScoreDecompositionPanel decomposition={activeDecomposition} />

      {/* 5. Sensitivity Analysis */}
      <SensitivityAnalysisCard scenarios={snapshot.sensitivityScenarios} />

      {/* 6. Calibration Metrics & Reliability Curve */}
      <CalibrationMetricsCard calibration={snapshot.calibration} />

      {/* 7. Risk Trend Progression */}
      <RiskTrendChart progression={activeProgression} />

      {/* 8. Department Overrides */}
      <DepartmentThresholdOverrides overrides={snapshot.departmentOverrides} />

      {/* 9. Threshold History Audit Ledger */}
      <ThresholdHistoryTable history={snapshot.thresholdHistory} />

      {/* 10. Executive Summary Synthesis */}
      <RiskTuningSummary summary={snapshot.summary} />
    </div>
  )
}
