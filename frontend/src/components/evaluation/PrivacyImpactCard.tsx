import {
  LockClosedIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { PrivacyImpactMetrics } from '../../types/evaluation'

interface PrivacyImpactCardProps {
  privacyImpact: PrivacyImpactMetrics
}

export function PrivacyImpactCard({ privacyImpact }: PrivacyImpactCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LockClosedIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Enterprise Privacy Risk Reduction & Impact Metrics
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Empirical reduction in unauthorized corporate data exposure and compliance enforcement gains.
          </p>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
          <ShieldCheckIcon className="h-4 w-4" />
          {privacyImpact.complianceRatePct}% Regulatory Compliance
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Exfiltrations Prevented
          </p>
          <p className="mt-1 text-2xl font-black text-rose-700">
            {privacyImpact.preventedExfiltrationAttempts}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Attacks Intercepted</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Unauthorized Access
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            -{privacyImpact.unauthorizedAccessReductionPct}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Privilege Violations</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Risky Downloads
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {privacyImpact.riskyDownloadsBlockedGb} GB
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Bulk Data Blocked</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Compliance Score
          </p>
          <p className="mt-1 text-2xl font-black text-indigo-700">
            {privacyImpact.complianceRatePct}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">SOX / HIPAA / GDPR</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Workload Reduced
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            -{privacyImpact.analystWorkloadReductionPct}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Repetitive Triage</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Zero-Day Containment
          </p>
          <p className="mt-1 text-2xl font-black text-indigo-800">
            {privacyImpact.zeroDayContainmentRate}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Novel Behavioral Anomalies</p>
        </div>
      </div>
    </Card>
  )
}
