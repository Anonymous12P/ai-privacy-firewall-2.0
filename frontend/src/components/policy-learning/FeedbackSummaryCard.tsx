import {
  ArrowPathRoundedSquareIcon,
  CheckBadgeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FeedbackSummary } from '../../types/policyLearning'

interface FeedbackSummaryCardProps {
  summary: FeedbackSummary
}

export function FeedbackSummaryCard({ summary }: FeedbackSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowPathRoundedSquareIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Analyst Feedback & Policy Triage Summary
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Telemetry from human-in-the-loop analyst incident validations driving continuous firewall policy learning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
            <CheckBadgeIcon className="h-4 w-4" />
            {summary.analystAccuracy}% Validation Fidelity
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-mono font-medium text-slate-600">
            {summary.totalFeedbackEvents} Total Events
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Confirmed TPs */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Confirmed TPs
            </span>
            <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-700">
            {summary.confirmedTruePositives}
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600 font-medium">True Threats Captured</p>
        </div>

        {/* Marked FPs */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Marked FPs
            </span>
            <ExclamationCircleIcon className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-700">
            {summary.markedFalsePositives}
          </p>
          <p className="mt-0.5 text-[10px] text-amber-600 font-medium">Benign Alarms Taged</p>
        </div>

        {/* Confirmed FNs */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
              Confirmed FNs
            </span>
            <ShieldExclamationIcon className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-rose-700">
            {summary.confirmedFalseNegatives}
          </p>
          <p className="mt-0.5 text-[10px] text-rose-600 font-medium">Leakage Vectors Flagged</p>
        </div>

        {/* Policy Adjustments */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider">
              Adjustments
            </span>
            <ArrowPathRoundedSquareIcon className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-indigo-800">
            {summary.policyAdjustmentsApplied}
          </p>
          <p className="mt-0.5 text-[10px] text-indigo-600 font-medium">Rules Live Updated</p>
        </div>

        {/* Policies Improved */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Improved
            </span>
            <CheckBadgeIcon className="h-4 w-4 text-slate-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900">
            {summary.policiesImproved}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Active Policy Sets</p>
        </div>

        {/* Pending Reviews */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
              Pending
            </span>
            <ClockIcon className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-600">
            {summary.pendingReviewItems}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500 font-medium">Awaiting SOC Signoff</p>
        </div>
      </div>
    </Card>
  )
}
