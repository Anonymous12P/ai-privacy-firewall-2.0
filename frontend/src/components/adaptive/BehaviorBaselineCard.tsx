import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  FingerPrintIcon,
  MinusIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { DriftCategory, UserBaselineProfile } from '../../types/adaptiveLearning'

interface BehaviorBaselineCardProps {
  users: UserBaselineProfile[]
  activeUser: UserBaselineProfile
  onSelectUser: (userId: string) => void
}

export function BehaviorBaselineCard({
  users,
  activeUser,
  onSelectUser,
}: BehaviorBaselineCardProps) {
  const getDriftBadge = (drift: DriftCategory) => {
    switch (drift) {
      case 'Stabilized':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'Normal':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'Suspicious':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'Sudden Spike':
        return 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
    }
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'Elevating') {
      return <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-rose-600" />
    }
    if (trend === 'Declining') {
      return <ArrowTrendingDownIcon className="h-3.5 w-3.5 text-emerald-600" />
    }
    return <MinusIcon className="h-3.5 w-3.5 text-slate-400" />
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <FingerPrintIcon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                User Behavioral Baseline Profile & Drift Calibration
              </h3>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getDriftBadge(
                  activeUser.driftCategory,
                )}`}
              >
                {activeUser.driftCategory}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Longitudinal feature distribution across 10 behavioral dimensions trained on historical telemetry.
            </p>
          </div>
        </div>

        {/* User Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Subject:</span>
          <select
            value={activeUser.userId}
            onChange={(e) => onSelectUser(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
          >
            {users.map((u) => (
              <option key={u.userId} value={u.userId}>
                {u.userName} — {u.role} ({u.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* User Identity Header Card */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 lg:col-span-1">
          <div className="flex items-center gap-3">
            <img
              src={activeUser.avatar}
              alt={activeUser.userName}
              className="h-12 w-12 rounded-full border border-indigo-200 object-cover shadow-2xs"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {activeUser.userName}
              </h4>
              <p className="text-xs font-medium text-slate-600">
                {activeUser.role}
              </p>
              <span className="text-[10px] font-mono text-slate-400">
                {activeUser.userId} • {activeUser.department}
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 border-t border-slate-200 pt-3 text-xs">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                <span>Baseline Strength</span>
                <span className="font-bold text-indigo-700">
                  {activeUser.baselineStrength}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${activeUser.baselineStrength}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Model Confidence:</span>
              <span className="font-mono font-bold text-slate-800">
                {(activeUser.confidence * 100).toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Observation Window:</span>
              <span className="font-mono font-semibold text-slate-700">
                {activeUser.sampleWindowDays} days
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Risk Trajectory:</span>
              <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                {getTrendIcon(activeUser.metrics.riskHistory.trend)}
                {activeUser.metrics.riskHistory.trend}
              </span>
            </div>
          </div>
        </div>

        {/* 9 Behavioral Metrics Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:col-span-3">
          {/* 1. Login Time */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Ingress Time Shift
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.loginTime.current}
              </span>
              <span className="text-[10px] font-semibold text-indigo-600">
                Base: {activeUser.metrics.loginTime.baseline}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Dev: +{activeUser.metrics.loginTime.deviationPct}%
            </p>
          </div>

          {/* 2. USB Usage */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              2. USB Storage Events
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span
                className={`font-bold ${
                  Number(activeUser.metrics.usbUsage.current) > 0
                    ? 'text-rose-600'
                    : 'text-slate-900'
                }`}
              >
                {activeUser.metrics.usbUsage.current} events
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.usbUsage.baseline}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              {Number(activeUser.metrics.usbUsage.current) > 0
                ? 'Deviation: Violation'
                : 'Zero USB Baseline'}
            </p>
          </div>

          {/* 3. File Access Volume */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              3. File Egress Volume
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.fileAccessVolume.current} MB/day
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.fileAccessVolume.baseline} MB
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Surge: {activeUser.metrics.fileAccessVolume.deviationPct}%
            </p>
          </div>

          {/* 4. Email Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              4. Outbound Email Velocity
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.emailActivity.current} msgs/day
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.emailActivity.baseline}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Shift: {activeUser.metrics.emailActivity.deviationPct}%
            </p>
          </div>

          {/* 5. HTTP Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              5. HTTP REST Transactions
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.httpActivity.current} req/min
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.httpActivity.baseline}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Rate Delta: +{activeUser.metrics.httpActivity.deviationPct}%
            </p>
          </div>

          {/* 6. Session Duration */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              6. Daily Session Length
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.sessionDuration.current} hrs
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.sessionDuration.baseline} hrs
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Duration delta: {activeUser.metrics.sessionDuration.deviationPct}%
            </p>
          </div>

          {/* 7. Failed Logins */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              7. Failed Authentication
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.failedLogins.current} fails/mo
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.failedLogins.baseline}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500">
              Variance: {activeUser.metrics.failedLogins.deviationPct}%
            </p>
          </div>

          {/* 8. Device Trust */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              8. Hardware Device Trust
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.deviceTrust.current} / 100
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.deviceTrust.baseline}
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 truncate">
              {activeUser.metrics.deviceTrust.unit}
            </p>
          </div>

          {/* 9. Geo Consistency */}
          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              9. Geographic Consistency
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="font-bold text-slate-900">
                {activeUser.metrics.geoConsistency.current}%
              </span>
              <span className="text-[10px] text-slate-400">
                Base: {activeUser.metrics.geoConsistency.baseline}%
              </span>
            </div>
            <p className="mt-1 text-[10px] text-slate-500 truncate">
              {activeUser.metrics.geoConsistency.unit}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
