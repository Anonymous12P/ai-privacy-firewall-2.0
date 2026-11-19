import {
  ClockIcon,
  ComputerDesktopIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import type { FirewallAction, FirewallLiveEvent, MonitorIndicator } from '../types/api'

interface FirewallEventCardProps {
  event: FirewallLiveEvent
  isNew?: boolean
}

// Color schemes mapped strictly to decision:
// BLOCK => Red
// WARN => Yellow
// RESTRICT => Orange
// ALLOW => Green
const cardColorStyles: Record<
  FirewallAction,
  {
    container: string
    badge: string
    progressBar: string
    threatText: string
    tag: string
    accentDot: string
  }
> = {
  BLOCK: {
    container:
      'border-rose-400/80 bg-rose-50/30 ring-1 ring-rose-200 hover:border-rose-500 shadow-xs',
    badge: 'bg-rose-100 text-rose-800 border-rose-300 ring-rose-500/20',
    progressBar: 'bg-rose-600',
    threatText: 'text-rose-700',
    tag: 'bg-rose-100/70 text-rose-800 border-rose-200',
    accentDot: 'bg-rose-600',
  },
  RESTRICT: {
    container:
      'border-amber-400/80 bg-amber-50/30 ring-1 ring-amber-200 hover:border-amber-500 shadow-xs',
    badge: 'bg-amber-100 text-amber-800 border-amber-300 ring-amber-500/20',
    progressBar: 'bg-amber-500',
    threatText: 'text-amber-700',
    tag: 'bg-amber-100/70 text-amber-800 border-amber-200',
    accentDot: 'bg-amber-500',
  },
  WARN: {
    container:
      'border-yellow-400/80 bg-yellow-50/30 ring-1 ring-yellow-200 hover:border-yellow-500 shadow-xs',
    badge: 'bg-yellow-100 text-yellow-850 border-yellow-300 ring-yellow-500/20',
    progressBar: 'bg-yellow-500',
    threatText: 'text-yellow-750',
    tag: 'bg-yellow-100/70 text-yellow-850 border-yellow-200',
    accentDot: 'bg-yellow-500',
  },
  ALLOW: {
    container:
      'border-emerald-400/80 bg-emerald-50/30 ring-1 ring-emerald-200 hover:border-emerald-500 shadow-xs',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-emerald-500/20',
    progressBar: 'bg-emerald-500',
    threatText: 'text-emerald-700',
    tag: 'bg-emerald-100/70 text-emerald-800 border-emerald-200',
    accentDot: 'bg-emerald-500',
  },
}

const operationBadgeStyles: Record<string, string> = {
  Read: 'bg-slate-100 text-slate-700 border-slate-200',
  Write: 'bg-blue-50 text-blue-700 border-blue-200',
  Export: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Delete: 'bg-red-50 text-red-700 border-red-200 font-bold',
  Modify: 'bg-purple-50 text-purple-700 border-purple-200',
  'Bulk Download': 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
}

const indicatorIcons: Record<MonitorIndicator, string> = {
  'USB Connected': '🔌 USB',
  'After Hours': '🌙 Off-Hours',
  'Impossible Travel': '✈️ Geo-Anomaly',
  'BYOD Device': '💻 BYOD',
  'Large Download': '📦 Mass Transfer',
  'Failed Logins': '⚠️ Failed Auth',
  'HTTP Burst': '⚡ HTTP Burst',
  VPN: '🛡️ VPN',
  'Email Attachment': '📧 Outbound Mail',
}

export function FirewallEventCard({ event, isNew = false }: FirewallEventCardProps) {
  const styles = cardColorStyles[event.firewallDecision]

  return (
    <div
      className={`relative rounded-xl border p-4 sm:p-5 transition-all duration-300 hover:shadow-md ${styles.container} ${
        isNew ? 'ring-2 ring-indigo-500/50' : ''
      }`}
    >
      {/* Top Bar: Subject, Device, Timestamp & Decision Badge */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/70 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Employee & Department */}
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <UserIcon className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{event.employeeName}</span>
          </div>
          <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            {event.department}
          </span>

          <span className="text-slate-300">•</span>

          {/* Device Type */}
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <ComputerDesktopIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>{event.deviceType}</span>
          </div>
        </div>

        {/* Right side: Timestamp & Decision */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
            <ClockIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>{event.timestamp}</span>
          </div>

          {/* Prominent Firewall Decision Badge */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-bold tracking-wider ring-1 ring-inset ${styles.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${styles.accentDot} animate-pulse`} />
            {event.firewallDecision}
          </span>
        </div>
      </div>

      {/* Middle Row: Requested Resource & Operation */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 uppercase tracking-wide">Target:</span>
          <span className="font-mono font-bold text-slate-900 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
            {event.requestedResource}
          </span>
          <span
            className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
              operationBadgeStyles[event.operation] ?? 'bg-slate-100 text-slate-700'
            }`}
          >
            {event.operation}
          </span>
        </div>

        {/* Policy Triggered */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <ShieldCheckIcon className="h-4 w-4 text-slate-500" />
          <span className="text-slate-500">Policy:</span>
          <span className="font-semibold text-slate-800">{event.policyTriggered}</span>
        </div>
      </div>

      {/* Scores & Progress Bar Grid */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-12 items-center bg-white/70 p-3 rounded-lg border border-slate-200/70">
        {/* Risk Progress Bar (takes 6 cols) */}
        <div className="sm:col-span-6 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600">Risk Assessment Score</span>
            <span className={`font-mono font-bold ${styles.threatText}`}>
              {event.riskScore} / 100
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className={`h-full transition-all duration-500 ${styles.progressBar}`}
              style={{ width: `${Math.min(event.riskScore, 100)}%` }}
            />
          </div>
        </div>

        {/* Threat Score (3 cols) */}
        <div className="sm:col-span-3 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase">
            Threat Score
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <ShieldExclamationIcon className={`h-4 w-4 ${styles.threatText}`} />
            <span className={`font-mono font-bold text-base ${styles.threatText}`}>
              {event.threatScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">pts</span>
          </div>
        </div>

        {/* AI Confidence (3 cols) */}
        <div className="sm:col-span-3 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0">
          <span className="block text-[11px] font-semibold text-slate-500 uppercase">
            AI Confidence
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <SparklesIcon className="h-4 w-4 text-indigo-500" />
            <span className="font-mono font-bold text-base text-slate-800">
              {(event.aiConfidence * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Behavior Indicators Badges */}
      {event.behaviorIndicators.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">
            Telemetry Indicators:
          </span>
          {event.behaviorIndicators.map((ind, idx) => (
            <span
              key={idx}
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${styles.tag}`}
            >
              {indicatorIcons[ind] ?? ind}
            </span>
          ))}
        </div>
      )}

      {/* Top AI Reasons */}
      {event.reasons.length > 0 && (
        <div className="mt-3 border-t border-slate-200/70 pt-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <InformationCircleIcon className="h-3.5 w-3.5 text-indigo-600" />
            <span>Top AI Explainability Reasons:</span>
          </div>
          <ul className="mt-1.5 space-y-1 text-xs text-slate-600">
            {event.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-indigo-500 font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
