import { useEffect, useState } from 'react'
import {
  AcademicCapIcon,
  BoltIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { DepartmentPolicyAdaptationCard } from '../components/policy-learning/DepartmentPolicyAdaptationCard'
import { FalseNegativeReductionCard } from '../components/policy-learning/FalseNegativeReductionCard'
import { FalsePositiveReductionCard } from '../components/policy-learning/FalsePositiveReductionCard'
import { FeedbackLoopDiagram } from '../components/policy-learning/FeedbackLoopDiagram'
import { FeedbackSummaryCard } from '../components/policy-learning/FeedbackSummaryCard'
import { LearnedThresholdsTable } from '../components/policy-learning/LearnedThresholdsTable'
import { PolicyComparisonChart } from '../components/policy-learning/PolicyComparisonChart'
import { PolicyConfidenceCard } from '../components/policy-learning/PolicyConfidenceCard'
import { PolicyEvolutionChart } from '../components/policy-learning/PolicyEvolutionChart'
import { PolicyImprovementTimeline } from '../components/policy-learning/PolicyImprovementTimeline'
import { PolicyLearningSummary } from '../components/policy-learning/PolicyLearningSummary'
import { PolicyRecommendationPanel } from '../components/policy-learning/PolicyRecommendationPanel'
import type { PolicyLearningSnapshot } from '../types/policyLearning'
import { generatePolicyLearningSnapshot } from '../utils/policyLearningSimulation'

export function PolicyLearningPage() {
  const [snapshot, setSnapshot] = useState<PolicyLearningSnapshot>(() =>
    generatePolicyLearningSnapshot(),
  )
  const [isStreaming, setIsStreaming] = useState(true)

  // Simulation loop updating every 5 seconds
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setSnapshot(generatePolicyLearningSnapshot())
    }, 5000)

    return () => clearInterval(interval)
  }, [isStreaming])

  const handleRetrain = () => {
    setSnapshot(generatePolicyLearningSnapshot())
    toast.success('Triggered online Bayesian gradient policy recalibration across all departments')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <AcademicCapIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight sm:text-2xl">
                  Adaptive Policy Learning & Feedback Optimization
                </h1>
                <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                  LEARN
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Closed-loop policy improvement driven by SOC analyst feedback, false positive pruning, and behavioral divergence.
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

          {/* Manual Re-learn */}
          <button
            type="button"
            onClick={handleRetrain}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <BoltIcon className="h-4 w-4" />
            Recalibrate Policies
          </button>
        </div>
      </div>

      {/* 1. Feedback Summary Metrics */}
      <FeedbackSummaryCard summary={snapshot.feedbackSummary} />

      {/* 2. Policy Evolution Architecture Trajectory */}
      <PolicyEvolutionChart evolution={snapshot.evolution} />

      {/* 3. Error Reduction Engines (Side-by-Side: FP & FN) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FalsePositiveReductionCard metrics={snapshot.fpReduction} />
        <FalseNegativeReductionCard metrics={snapshot.fnReduction} />
      </div>

      {/* 4. Closed-Loop Feedback Pipeline Diagram */}
      <FeedbackLoopDiagram stages={snapshot.feedbackLoopStages} />

      {/* 5. Department-Specific Learned Decision Thresholds */}
      <LearnedThresholdsTable thresholds={snapshot.learnedThresholds} />

      {/* 6. Policy Confidence & Calibration Gain */}
      <PolicyConfidenceCard metrics={snapshot.confidenceMetrics} />

      {/* 7. Autonomous Policy Recommendations */}
      <PolicyRecommendationPanel recommendations={snapshot.recommendations} />

      {/* 8. Before & After Policy Differential Inspection */}
      <PolicyComparisonChart comparisons={snapshot.beforeAfterComparisons} />

      {/* 9. Departmental Divergent Policy Adaptation */}
      <DepartmentPolicyAdaptationCard adaptations={snapshot.departmentAdaptations} />

      {/* 10. 30-Day Policy Optimization Timeline */}
      <PolicyImprovementTimeline timeline={snapshot.timeline} />

      {/* 11. Executive Research Synthesis */}
      <PolicyLearningSummary summary={snapshot.summary} />
    </div>
  )
}
