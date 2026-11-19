import { useEffect, useState } from 'react'
import {
  ArrowPathRoundedSquareIcon,
  BoltIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { AdaptiveLearningSummary } from '../components/adaptive/AdaptiveLearningSummary'
import { AnomalyTrendTable } from '../components/adaptive/AnomalyTrendTable'
import { BaselineTimeline } from '../components/adaptive/BaselineTimeline'
import { BehaviorBaselineCard } from '../components/adaptive/BehaviorBaselineCard'
import { DriftTrendChart } from '../components/adaptive/DriftTrendChart'
import { FeedbackLoopPanel } from '../components/adaptive/FeedbackLoopPanel'
import { PrivacyRiskScoreCard } from '../components/adaptive/PrivacyRiskScoreCard'
import { ThresholdAdaptationCard } from '../components/adaptive/ThresholdAdaptationCard'
import { UserBaselineComparison } from '../components/adaptive/UserBaselineComparison'
import type { AdaptiveLearningSnapshot } from '../types/adaptiveLearning'
import { generateAdaptiveLearningSnapshot } from '../utils/adaptiveLearningSimulation'

export function AdaptiveLearningPage() {
  const [selectedUserId, setSelectedUserId] = useState<string>('EMP-1001')
  const [snapshot, setSnapshot] = useState<AdaptiveLearningSnapshot>(() =>
    generateAdaptiveLearningSnapshot('EMP-1001'),
  )
  const [isStreaming, setIsStreaming] = useState(true)

  // Simulation loop updating every 5 seconds
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setSnapshot(generateAdaptiveLearningSnapshot(selectedUserId))
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming, selectedUserId])

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId)
    setSnapshot(generateAdaptiveLearningSnapshot(userId))
    toast.info(`Switched active baseline subject to ${userId}`)
  }

  const handleManualAdapt = () => {
    setSnapshot(generateAdaptiveLearningSnapshot(selectedUserId))
    toast.success('Behavioral baseline recalculation executed across ensemble models')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Research Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <ArrowPathRoundedSquareIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
                  Adaptive Learning & User Behavior Baseline Center
                </h1>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  Bayesian Continuous Learning
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Self-calibrating behavioral baselines, covariate concept drift detection, dynamic threshold adaptation, and closed-loop feedback.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
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
                <span>Live Adaptation (5s)</span>
              </>
            ) : (
              <>
                <PlayIcon className="h-4 w-4 text-slate-500" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          {/* Trigger Adaptation Recalibration */}
          <button
            type="button"
            onClick={handleManualAdapt}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
          >
            <BoltIcon className="h-4 w-4" />
            <span>Recalibrate Weights</span>
          </button>
        </div>
      </div>

      {/* 8. Adaptive Learning Summary Narrative */}
      <AdaptiveLearningSummary summary={snapshot.summary} />

      {/* 1. Behavior Baseline Dashboard */}
      <BehaviorBaselineCard
        users={snapshot.users}
        activeUser={snapshot.activeUser}
        onSelectUser={handleSelectUser}
      />

      {/* 2. Longitudinal Drift Dynamics Chart */}
      <DriftTrendChart
        data={snapshot.driftTrends}
        user={snapshot.activeUser}
      />

      {/* 6. Before / After Behavioral Deviation & Decision Trace */}
      <UserBaselineComparison
        comparison={snapshot.comparison}
        user={snapshot.activeUser}
      />

      {/* 4. Adaptive Threshold Calibrations */}
      <ThresholdAdaptationCard thresholds={snapshot.thresholds} />

      {/* 5. Closed-Loop Analyst Feedback Loop Panel */}
      <FeedbackLoopPanel events={snapshot.feedbackEvents} />

      {/* 3. Departmental & Subject Privacy Risk Indices */}
      <PrivacyRiskScoreCard scores={snapshot.privacyScores} />

      {/* 7. Active Behavioral Anomaly Trajectory Table */}
      <AnomalyTrendTable anomalies={snapshot.anomalies} />

      {/* 9. Longitudinal Baseline Evolution Timeline */}
      <BaselineTimeline
        stages={snapshot.timelineStages}
        user={snapshot.activeUser}
      />
    </div>
  )
}
