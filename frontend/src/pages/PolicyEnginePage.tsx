import {
  AdjustmentsHorizontalIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { Card } from '../components/Card'
import { FirewallActionBadge } from '../components/FirewallActionBadge'
import { formatThreatScore } from '../utils/threatScore'

interface PolicyRule {
  id: string
  ruleName: string
  threatScoreThreshold: number
  decision: 'ALLOW' | 'WARN' | 'BLOCK'
  reason: string
  triggeredRule: string
  description: string
  enabled: boolean
}

const POLICY_RULES: PolicyRule[] = [
  {
    id: 'POL-001',
    ruleName: 'Mass Exfiltration & Removable Storage Interception',
    threatScoreThreshold: 0.75,
    decision: 'BLOCK',
    reason: 'Removable USB storage attached during off-hours mass file export.',
    triggeredRule: 'RULE-USB-EXFILTRATION-BLOCK-01',
    description: 'Instantly resets TCP connection and revokes active API tokens when USB transfer rate surges.',
    enabled: true,
  },
  {
    id: 'POL-002',
    ruleName: 'Elevated Behavioral Anomaly Step-Up Challenge',
    threatScoreThreshold: 0.4,
    decision: 'WARN',
    reason: 'Elevated behavioral anomaly score exceeding department advisory threshold.',
    triggeredRule: 'RULE-ELEVATED-UBA-WARN-02',
    description: 'Demands hardware FIDO2 MFA re-authentication when user deviates from peer baseline.',
    enabled: true,
  },
  {
    id: 'POL-003',
    ruleName: 'Data Analytics & ML Feature Store Access',
    threatScoreThreshold: 0.35,
    decision: 'ALLOW',
    reason: 'Conforms to baseline data science role profile within scheduled working hours.',
    triggeredRule: 'RULE-DATA-ANALYTICS-ALLOW-03',
    description: 'Permits high-volume batch reads for authenticated data science team members.',
    enabled: true,
  },
  {
    id: 'POL-004',
    ruleName: 'Default Baseline Role Allowance',
    threatScoreThreshold: 0.0,
    decision: 'ALLOW',
    reason: 'Access conforms to baseline role privileges with valid MFA assertion.',
    triggeredRule: 'RULE-DEFAULT-ALLOW-04',
    description: 'Grants continuous access to authorized employees operating within nominal parameters.',
    enabled: true,
  },
]

export function PolicyEnginePage() {
  const [rules] = useState<PolicyRule[]>(POLICY_RULES)
  const [simulatedScore, setSimulatedScore] = useState<number>(0.82)

  // Calculate simulated decision from policy rules
  const evaluatedDecision: {
    threatScore: number
    decision: 'ALLOW' | 'WARN' | 'BLOCK'
    reason: string
    triggeredRule: string
    confidence: number
  } = simulatedScore >= 0.75
    ? {
        threatScore: simulatedScore,
        decision: 'BLOCK',
        reason: 'Removable USB storage attached during off-hours mass file export.',
        triggeredRule: 'RULE-USB-EXFILTRATION-BLOCK-01',
        confidence: 0.98,
      }
    : simulatedScore >= 0.4
      ? {
          threatScore: simulatedScore,
          decision: 'WARN',
          reason: 'Elevated behavioral anomaly score exceeding department advisory threshold.',
          triggeredRule: 'RULE-ELEVATED-UBA-WARN-02',
          confidence: 0.94,
        }
      : {
          threatScore: simulatedScore,
          decision: 'ALLOW',
          reason: 'Access conforms to baseline role privileges with valid MFA assertion.',
          triggeredRule: 'RULE-DEFAULT-ALLOW-04',
          confidence: 0.99,
        }

  return (
    <div className="space-y-8">
      {/* Module Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
              ZERO TRUST GOVERNANCE
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Autonomous Arbitration Rules
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Policy Engine & Decision Rules
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-2xl">
            Real-time policy arbitration evaluating continuous AI threat scores against deterministic compliance rules (ALLOW, WARN, BLOCK).
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
          <span>Active Rules: {rules.filter((r) => r.enabled).length} Enabled</span>
        </div>
      </div>

      {/* Mandatory Decision Simulator Banner */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              LIVE POLICY ARBITRATION EVALUATION
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Real-Time Decision State & Matched Governance Rule
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600">Simulate Threat Score:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={simulatedScore}
              onChange={(e) => setSimulatedScore(Number(e.target.value))}
              className="w-36 accent-blue-600 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-slate-900 w-16 text-right">
              {formatThreatScore(simulatedScore)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 font-mono">
          {/* 1. Threat Score */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold font-sans">
              Threat Score
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatThreatScore(evaluatedDecision.threatScore)}
              </span>
              <span className="text-xs text-slate-500 font-sans">({evaluatedDecision.threatScore.toFixed(2)})</span>
            </div>
          </div>

          {/* 2. Decision */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold font-sans">
              Arbitration Decision
            </span>
            <div className="mt-2">
              <FirewallActionBadge action={evaluatedDecision.decision} />
            </div>
          </div>

          {/* 3. Matched Rule */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold font-sans">
              Matched Rule
            </span>
            <span className="mt-1 block text-sm font-bold text-blue-600">
              {evaluatedDecision.triggeredRule}
            </span>
          </div>

          {/* 4. Confidence */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold font-sans">
              AI Confidence
            </span>
            <span className="mt-1 block text-2xl font-extrabold text-emerald-600">
              {(evaluatedDecision.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Reason Display Banner */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
          <div className="flex items-start gap-2.5">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-blue-950 uppercase tracking-wide">
                Evaluation Reason Justification:
              </span>
              <p className="mt-0.5 text-xs text-blue-800 font-medium">
                {evaluatedDecision.reason}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Policy Rules Directory */}
      <Card className="p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
              RULE CATALOG
            </span>
            <h2 className="text-base font-extrabold text-slate-900">
              Zero Trust Policy Rules Catalog
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">Autonomous Enforcement</span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {rules.map((rule) => (
            <div key={rule.id} className="py-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-blue-600">{rule.id}</span>
                  <span className="font-bold text-slate-900 text-sm">{rule.ruleName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">
                    Threshold &gt;= {formatThreatScore(rule.threatScoreThreshold)}
                  </span>
                  <FirewallActionBadge action={rule.decision} />
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{rule.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
                <span>Trigger ID: <strong className="text-slate-800">{rule.triggeredRule}</strong></span>
                <span>Enforcement: <strong className="text-emerald-700">Autonomous Active</strong></span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
