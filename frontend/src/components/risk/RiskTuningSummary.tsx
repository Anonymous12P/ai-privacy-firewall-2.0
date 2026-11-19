import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BuildingOffice2Icon,
  CheckBadgeIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { RiskTuningSummaryData } from '../../types/riskTuning'

interface RiskTuningSummaryProps {
  summary: RiskTuningSummaryData
}

export function RiskTuningSummary({ summary }: RiskTuningSummaryProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Executive Synthesis: Risk Scoring & Decision Calibration
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Autonomous analytical summary of departmental privacy risk posture and threshold adaptation dynamics.
          </p>
        </div>

        {/* Firewall Stance Badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
            summary.firewallStance === 'CONSERVATIVE'
              ? 'bg-purple-100 text-purple-800 border border-purple-200'
              : summary.firewallStance === 'PERMISSIVE'
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
          }`}
        >
          <ShieldCheckIcon className="h-4 w-4" />
          {summary.firewallStance} STANCE
        </span>
      </div>

      {/* Top Level Summary Cards */}
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Highest Risk Dept */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <BuildingOffice2Icon className="h-4 w-4 text-indigo-600" />
            Highest Risk Department
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {summary.highestRiskDepartment}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-red-600">
            {summary.highestRiskDeptScore}/100 Mean Score
          </p>
        </div>

        {/* Highest Risk User */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <UserIcon className="h-4 w-4 text-indigo-600" />
            Highest Risk Individual
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {summary.highestRiskUser}
          </p>
          <p className="mt-0.5 text-xs font-semibold text-red-600">
            {summary.highestRiskUserScore}/100 (Critical Tier)
          </p>
        </div>

        {/* Threshold Trend */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ArrowTrendingDownIcon className="h-4 w-4 text-purple-600" />
            Threshold Calibration
          </div>
          <p className="mt-2 text-lg font-bold text-purple-800">
            {summary.thresholdTrend}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Bayesian Drift Response
          </p>
        </div>

        {/* FP / Block Evolution */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ArrowTrendingUpIcon className="h-4 w-4 text-indigo-600" />
            Rate Trajectory
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {summary.blockRateDelta > 0 ? `+${summary.blockRateDelta}%` : `${summary.blockRateDelta}%`}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            Block Rate ({summary.fpRateDelta}% FP Delta)
          </p>
        </div>
      </div>

      {/* Narrative Synthesis */}
      <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Executive Behavioral Narrative
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-slate-700">
          {summary.executiveNarrative}
        </p>
      </div>

      {/* Key Findings List */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Key Research & Operational Findings
        </h4>
        <ul className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
          {summary.keyFindings.map((finding) => (
            <li
              key={finding}
              className="flex items-start gap-2 rounded-lg border border-slate-100 bg-white p-2.5 text-xs text-slate-700 shadow-2xs"
            >
              <CheckBadgeIcon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
              <span>{finding}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actionable Policy Recommendation */}
      <div className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/60 p-4">
        <div className="flex items-start gap-2.5">
          <LightBulbIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Strategic SOC & Governance Recommendation
            </h4>
            <p className="mt-1 text-xs text-amber-900/90 leading-relaxed">
              {summary.recommendation}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
