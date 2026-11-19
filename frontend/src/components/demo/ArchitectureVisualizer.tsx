import { useState } from 'react'
import {
  ArrowPathRoundedSquareIcon,
  CpuChipIcon,
  DocumentCheckIcon,
  FingerPrintIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

interface ArchitectureNode {
  id: string
  title: string
  subtitle: string
  icon: typeof FingerPrintIcon
  color: string
  border: string
  bg: string
  badge: string
  details: string[]
  formula?: string
}

const ARCHITECTURE_NODES: ArchitectureNode[] = [
  {
    id: 'uba',
    title: '1. User Behavior Analytics (UBA)',
    subtitle: 'Telemetry Ingestion & Behavioral Baselines',
    icon: FingerPrintIcon,
    color: 'text-sky-700',
    border: 'border-sky-300',
    bg: 'bg-sky-50',
    badge: 'INGESTION',
    details: [
      '33 CERT r4.2 engineered indicators (logon, HTTP, file, USB, email)',
      'Per-user and per-role 90-day exponential moving average baselines',
      'Real-time behavioral drift tracking (session duration, off-hours velocity)',
    ],
    formula: 'DRIFT = \\| x_t - \\mu_{\\text{baseline}} \\|_2 / \\sigma',
  },
  {
    id: 'ai-engine',
    title: '2. Real AI Model Pipeline',
    subtitle: 'Champion XGBoost + Challenger Models',
    icon: CpuChipIcon,
    color: 'text-indigo-700',
    border: 'border-indigo-300',
    bg: 'bg-indigo-50',
    badge: 'CHAMPION: 0.978 AUC',
    details: [
      'XGBoost (15,136 parameters, 0.9998 PR-AUC, 0.9914 F1)',
      'Ensemble comparison: Random Forest, Decision Tree, Logistic Regression',
      'Continuous calibrated inference with sub-5ms latency',
    ],
    formula: 'P(\\text{threat} \\mid x) = \\sigma(f_{\\text{XGBoost}}(x))',
  },
  {
    id: 'explainability',
    title: '3. Explainability Engine',
    subtitle: 'TreeSHAP & Local Factor Attribution',
    icon: SparklesIcon,
    color: 'text-purple-700',
    border: 'border-purple-300',
    bg: 'bg-purple-50',
    badge: 'XAI / SHAP',
    details: [
      'TreeSHAP attribution over all 33 input dimensions',
      'Human-readable plain-English rationales for every access evaluation',
      'Counterfactual recommendation generation to safely re-grant access',
    ],
    formula: 'f(x) = \\phi_0 + \\sum_{i=1}^{M} \\phi_i(x)',
  },
  {
    id: 'privacy-firewall',
    title: '4. Privacy Risk Calibration',
    subtitle: 'Sensitivity Tuning & Risk Scoring',
    icon: ScaleIcon,
    color: 'text-amber-700',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    badge: 'CALIBRATION',
    details: [
      'Dynamic threshold boundaries: ALLOW (<0.40), WARN (0.40-0.70), RESTRICT (0.70-0.85), BLOCK (>=0.85)',
      'Sensitivity calibration curves protecting GDPR, HIPAA, and SEC compliance',
      'Department-specific risk multipliers and asset tier sensitivity',
    ],
    formula: 'Risk = \\alpha \\cdot P(\\text{threat}) + \\beta \\cdot Sensitivity(Asset)',
  },
  {
    id: 'policy-engine',
    title: '5. Deterministic Policy Engine',
    subtitle: 'Deterministic Rule Arbitration',
    icon: ShieldCheckIcon,
    color: 'text-emerald-700',
    border: 'border-emerald-300',
    bg: 'bg-emerald-50',
    badge: 'ENFORCEMENT',
    details: [
      'Deterministic rule evaluation overriding black-box uncertainty',
      'Automated intercept: immediate connection termination & token revoke',
      'Step-up MFA challenge or supervisory approval for RESTRICT band',
    ],
  },
  {
    id: 'audit-logging',
    title: '6. Immutable Audit Telemetry',
    subtitle: 'Cryptographic Event Verification',
    icon: DocumentCheckIcon,
    color: 'text-slate-700',
    border: 'border-slate-300',
    bg: 'bg-slate-50',
    badge: 'TAMPER-PROOF',
    details: [
      'SHA-256 hash chaining over access request, AI factors, and decision',
      'Regulatory audit readiness across SOC 2 Type II, ISO 27001, and HIPAA',
      'Full query telemetry with millisecond execution timestamps',
    ],
  },
  {
    id: 'adaptive-loop',
    title: '7. Adaptive Learning Loop',
    subtitle: 'Analyst Feedback & Online Calibration',
    icon: ArrowPathRoundedSquareIcon,
    color: 'text-rose-700',
    border: 'border-rose-300',
    bg: 'bg-rose-50',
    badge: 'CONTINUOUS FEEDBACK',
    details: [
      'Analyst confirmation or false-positive dispute integration',
      'Automated policy threshold tuning yielding 42% false positive reduction',
      'Periodic drift adaptation avoiding model degradation over time',
    ],
  },
]

export function ArchitectureVisualizer() {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('ai-engine')
  const activeNode = ARCHITECTURE_NODES.find((n) => n.id === selectedNodeId) ?? ARCHITECTURE_NODES[1]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              System Architecture
            </span>
            <span className="text-xs text-slate-500">7 Core End-to-End Pipeline Pillars</span>
          </div>
          <h2 className="mt-1 text-base font-bold text-slate-900">
            Explainable Adaptive AI Privacy Firewall Architecture
          </h2>
          <p className="text-xs text-slate-500">
            Click any architectural stage below to inspect mathematical formulations, models, and security guarantees.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          End-to-End Latency: &lt; 12ms
        </div>
      </div>

      {/* Interactive Horizontal Flow Grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {ARCHITECTURE_NODES.map((node, idx) => {
          const Icon = node.icon
          const isSelected = selectedNodeId === node.id
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNodeId(node.id)}
              className={`relative flex flex-col justify-between rounded-xl p-3.5 text-left transition border cursor-pointer ${
                isSelected
                  ? `${node.bg} ${node.border} shadow-sm ring-2 ring-indigo-500 ring-offset-1`
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${node.bg} ${node.color} border ${node.border}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">0{idx + 1}</span>
                </div>
                <h3 className="mt-2.5 text-xs font-bold text-slate-900 leading-tight">
                  {node.title.replace(/^\d+\.\s*/, '')}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                  {node.subtitle}
                </p>
              </div>

              <div className="mt-3">
                <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${node.bg} ${node.color} border ${node.border}`}>
                  {node.badge}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Active Node Detail Drawer */}
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${activeNode.bg} ${activeNode.color} border ${activeNode.border}`}>
                {activeNode.badge}
              </span>
              <h4 className="text-sm font-bold text-slate-900">{activeNode.title}</h4>
            </div>
            <p className="text-xs text-slate-600">{activeNode.subtitle}</p>

            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              {activeNode.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {activeNode.formula && (
            <div className="shrink-0 rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs md:max-w-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Formulation
              </span>
              <div className="mt-1.5 font-mono text-xs text-indigo-900 bg-indigo-50/50 p-2 rounded border border-indigo-100">
                {activeNode.formula}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
