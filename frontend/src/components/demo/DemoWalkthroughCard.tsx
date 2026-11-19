import { useState } from 'react'
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  FingerPrintIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import type { DemoScenario } from '../../utils/demoScenarioData'

interface DemoWalkthroughCardProps {
  scenario: DemoScenario
  isScreenshotMode?: boolean
}

export function DemoWalkthroughCard({
  scenario,
  isScreenshotMode = false,
}: DemoWalkthroughCardProps) {
  const [copiedHash, setCopiedHash] = useState(false)
  const [activeStepTab, setActiveStepTab] = useState<number>(0)

  const steps = [
    { title: '1. User Behavior Input', icon: FingerPrintIcon },
    { title: '2. Real AI Evaluation', icon: CpuChipIcon },
    { title: '3. Explainability (SHAP)', icon: SparklesIcon },
    { title: '4. Policy Decision', icon: ShieldCheckIcon },
    { title: '5. Audit & Telemetry', icon: DocumentCheckIcon },
    { title: '6. Adaptive Learning', icon: ArrowPathIcon },
  ]

  const handleCopyHash = () => {
    navigator.clipboard.writeText(scenario.auditLog.tamperProofHash)
    setCopiedHash(true)
    setTimeout(() => setCopiedHash(false), 2000)
  }

  const getDecisionBadge = (action: string) => {
    switch (action) {
      case 'BLOCK':
        return {
          icon: NoSymbolIcon,
          color: 'text-rose-700 bg-rose-50 border-rose-300',
          title: 'BLOCK - Automated Intercept',
        }
      case 'RESTRICT':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-amber-700 bg-amber-50 border-amber-300',
          title: 'RESTRICT - MFA Step-Up Challenge',
        }
      case 'WARN':
        return {
          icon: ShieldExclamationIcon,
          color: 'text-blue-700 bg-blue-50 border-blue-300',
          title: 'WARN - Security Flagging',
        }
      case 'ALLOW':
      default:
        return {
          icon: CheckCircleIcon,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
          title: 'ALLOW - Standard Passage Permitted',
        }
    }
  }

  const decisionBadge = getDecisionBadge(scenario.policyDecision.action)
  const DecisionIcon = decisionBadge.icon

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${isScreenshotMode ? 'p-8 space-y-8' : 'p-6 space-y-6'} shadow-xs`}>
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                scenario.severity === 'Critical'
                  ? 'border-rose-300 bg-rose-50 text-rose-700'
                  : scenario.severity === 'High'
                  ? 'border-amber-300 bg-amber-50 text-amber-700'
                  : scenario.severity === 'Medium'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-700'
              }`}
            >
              {scenario.badge}
            </span>
            <span className="text-xs text-slate-500">Scenario ID: {scenario.id}</span>
          </div>

          <h2 className={`${isScreenshotMode ? 'text-2xl' : 'text-xl'} font-bold text-slate-900 mt-1.5`}>
            {scenario.title}
          </h2>
          <p className="mt-1 text-xs text-slate-600 max-w-3xl leading-relaxed">
            {scenario.storyline}
          </p>
        </div>

        {/* Big Decision Badge */}
        <div className={`shrink-0 flex items-center gap-3 rounded-2xl border ${decisionBadge.color} p-4 shadow-2xs`}>
          <DecisionIcon className="h-8 w-8 shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Firewall Enforcement
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {decisionBadge.title}
            </div>
            <div className="text-[11px] text-slate-600">
              Threat Probability: {(scenario.aiEvaluation.threatProbability * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Step Navigation Pill Selector for Interactive Exploration */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        {steps.map((st, idx) => {
          const Icon = st.icon
          const isActive = activeStepTab === idx
          return (
            <button
              key={st.title}
              type="button"
              onClick={() => setActiveStepTab(idx)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition border cursor-pointer ${
                isActive
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{st.title}</span>
            </button>
          )
        })}
      </div>

      {/* Grid of the 6 Stages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Step 1: User Behavior Input */}
        <div
          className={`rounded-xl border p-4.5 transition ${
            activeStepTab === 0
              ? 'border-sky-500 bg-sky-50/40 ring-2 ring-sky-400/20'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
            <FingerPrintIcon className="h-5 w-5 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900">1. User Behavior Input</h3>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Subject:</span>
              <strong className="text-slate-800">{scenario.actor.name} ({scenario.actor.id})</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Role & Dept:</span>
              <span className="text-slate-700 truncate max-w-[180px]">{scenario.actor.role}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Target Asset:</span>
              <span className="font-mono text-[11px] text-slate-800 truncate max-w-[180px]">{scenario.request.resource}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Sensitivity:</span>
              <span className="rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                {scenario.request.dataSensitivity}
              </span>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5 space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">USB Mounts:</span>
                <strong className={scenario.behaviorTelemetry.usbEvents > 0 ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                  {scenario.behaviorTelemetry.usbEvents} devices
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Session Length:</span>
                <span className="text-slate-700">{(scenario.behaviorTelemetry.sessionDurationSeconds / 3600).toFixed(1)} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Behavioral Risk Index:</span>
                <strong className="text-indigo-700">{scenario.behaviorTelemetry.behavioralRiskIndex.toFixed(2)} / 1.00</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Real AI Evaluation */}
        <div
          className={`rounded-xl border p-4.5 transition ${
            activeStepTab === 1
              ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-400/20'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
            <CpuChipIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900">2. Real AI Model Pipeline</h3>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Active Champion:</span>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                {scenario.aiEvaluation.championModel}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Threat Probability P(threat):</span>
              <strong className="text-sm font-bold text-slate-900">
                {(scenario.aiEvaluation.threatProbability * 100).toFixed(1)}%
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Threshold Band:</span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold border ${decisionBadge.color}`}>
                {scenario.aiEvaluation.thresholdBand}
              </span>
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-white p-2.5 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Multi-Model Ensemble Scores
              </span>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                  <span className="text-slate-500">XGBoost:</span>
                  <strong className="text-indigo-700">{(scenario.aiEvaluation.modelComparison.xgboost * 100).toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                  <span className="text-slate-500">RandomForest:</span>
                  <strong className="text-slate-700">{(scenario.aiEvaluation.modelComparison.randomForest * 100).toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                  <span className="text-slate-500">DecisionTree:</span>
                  <strong className="text-slate-700">{(scenario.aiEvaluation.modelComparison.decisionTree * 100).toFixed(1)}%</strong>
                </div>
                <div className="flex justify-between bg-slate-50 p-1.5 rounded">
                  <span className="text-slate-500">LogisticReg:</span>
                  <strong className="text-slate-700">{(scenario.aiEvaluation.modelComparison.logisticRegression * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Explainability & SHAP */}
        <div
          className={`rounded-xl border p-4.5 transition ${
            activeStepTab === 2
              ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-400/20'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-900">3. Explainable AI (TreeSHAP)</h3>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <p className="text-[11px] text-slate-600 line-clamp-2">
              {scenario.explainability.summary}
            </p>

            <div className="space-y-1.5 pt-1">
              {scenario.explainability.topFactors.slice(0, 2).map((factor) => (
                <div key={factor.feature} className="rounded-lg border border-slate-200 bg-white p-2 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{factor.label}</span>
                    <span
                      className={`text-[10px] font-bold ${
                        factor.direction === 'increases_risk' ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {factor.direction === 'increases_risk' ? '+' : ''}{factor.shapValue.toFixed(2)} SHAP
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{factor.rationale}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-2 text-[10px] text-purple-900">
              <strong>Counterfactual Guidance:</strong> {scenario.explainability.counterfactualHint}
            </div>
          </div>
        </div>

        {/* Step 4: Deterministic Policy Decision */}
        <div
          className={`rounded-xl border p-4.5 transition ${
            activeStepTab === 3
              ? 'border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400/20'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
            <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900">4. Deterministic Policy Decision</h3>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Enforcement Action:</span>
              <span className={`rounded-md px-2 py-0.5 text-xs font-extrabold border ${decisionBadge.color}`}>
                {scenario.policyDecision.action}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Matched Policy:</span>
              <span className="text-slate-800 font-semibold">{scenario.policyDecision.policyName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Enforcement Type:</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                {scenario.policyDecision.enforcementType}
              </span>
            </div>

            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Triggered Rule Logic
              </span>
              <ul className="space-y-1 text-[10px] text-slate-700">
                {scenario.policyDecision.matchedRules.map((r) => (
                  <li key={r} className="font-mono text-emerald-900 bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100 truncate">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Step 5: Audit Log & Cryptographic Verification */}
        <div
          className={`rounded-xl border p-4.5 transition ${
            activeStepTab === 4
              ? 'border-slate-500 bg-slate-100 ring-2 ring-slate-400/20'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
            <DocumentCheckIcon className="h-5 w-5 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900">5. Cryptographic Audit Telemetry</h3>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Event ID:</span>
              <span className="font-mono text-slate-800 font-semibold">{scenario.auditLog.eventId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Event Timestamp:</span>
              <span className="text-slate-700 text-[11px]">{scenario.auditLog.timestamp}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Immutable Retention:</span>
              <span className="text-slate-800">{scenario.auditLog.retentionDays} Days (Compliant)</span>
            </div>

            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tamper-Evident SHA-256
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <ClipboardDocumentCheckIcon className="h-3 w-3" />
                  {copiedHash ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="mt-1 font-mono text-[9px] text-slate-600 break-all bg-slate-50 p-1.5 rounded border border-slate-200">
                {scenario.auditLog.tamperProofHash}
              </p>
            </div>
          </div>
        </div>

        {/* Step 6: Adaptive Learning & Feedback Loop */}
        <div
          className={`rounded-xl border p-4.5 transition ${
            activeStepTab === 5
              ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-400/20'
              : 'border-slate-200 bg-slate-50/50'
          }`}
        >
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-2.5">
            <ArrowPathIcon className="h-5 w-5 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-900">6. Adaptive Learning Loop</h3>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Analyst Feedback:</span>
              <span className="rounded-full bg-rose-50 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                {scenario.adaptiveLearning.feedbackReceived}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Post-Adaptation Action:</span>
              <strong className="text-indigo-700">
                {scenario.adaptiveLearning.postAdaptationDecision ?? scenario.policyDecision.action}
              </strong>
            </div>

            <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Threshold Adjustment
              </span>
              <p className="text-[11px] text-slate-700">
                {scenario.adaptiveLearning.thresholdAdjustment}
              </p>
            </div>

            <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-2 text-[10px] text-indigo-900">
              {scenario.adaptiveLearning.learningNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
