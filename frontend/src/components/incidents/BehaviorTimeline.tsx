import {
  ArrowDownTrayIcon,
  ClockIcon,
  ComputerDesktopIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  GlobeAmericasIcon,
  KeyIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { BehaviorTimelineStep } from '../../types/incident'

interface BehaviorTimelineProps {
  steps: BehaviorTimelineStep[]
}

const DEFAULT_STEPS: BehaviorTimelineStep[] = [
  { indicator: 'Login', detected: true, severity: 'Low', time: '02:14:10', description: 'SSO login verified' },
  { indicator: 'USB', detected: true, severity: 'Critical', time: '02:14:22', description: 'SanDisk USB mounted' },
  { indicator: 'VPN', detected: false, severity: 'Benign', time: '02:14:25', description: 'On-prem connection' },
  { indicator: 'HTTP Burst', detected: true, severity: 'High', time: '02:14:30', description: 'API query burst spike' },
  { indicator: 'Email', detected: false, severity: 'Benign', time: '02:14:30', description: 'No mail relay' },
  { indicator: 'Downloads', detected: true, severity: 'Critical', time: '02:14:30', description: '45,000 ledger rows' },
  { indicator: 'After Hours', detected: true, severity: 'Medium', time: '02:14:31', description: 'Session at 02:14 AM' },
  { indicator: 'Geo Change', detected: false, severity: 'Benign', time: '02:14:31', description: 'Local IP match' },
  { indicator: 'Failed Logins', detected: false, severity: 'Benign', time: '02:14:31', description: '0 failed attempts' },
]

function getIndicatorIcon(name: string) {
  switch (name) {
    case 'Login':
      return <KeyIcon className="h-4 w-4" />
    case 'USB':
      return <ComputerDesktopIcon className="h-4 w-4" />
    case 'VPN':
      return <ShieldCheckIcon className="h-4 w-4" />
    case 'HTTP Burst':
      return <SparklesIcon className="h-4 w-4" />
    case 'Email':
      return <EnvelopeIcon className="h-4 w-4" />
    case 'Downloads':
      return <ArrowDownTrayIcon className="h-4 w-4" />
    case 'After Hours':
      return <ClockIcon className="h-4 w-4" />
    case 'Geo Change':
      return <GlobeAmericasIcon className="h-4 w-4" />
    case 'Failed Logins':
      return <ExclamationCircleIcon className="h-4 w-4" />
    default:
      return <KeyIcon className="h-4 w-4" />
  }
}

export function BehaviorTimeline({ steps }: BehaviorTimelineProps) {
  const displaySteps = steps && steps.length > 0 ? steps : DEFAULT_STEPS

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Behavioral Indicator Event Spectrum
          </h3>
          <p className="text-xs text-slate-500">
            Evaluation of individual behavioral telemetry triggers logged during the incident execution window.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
          9 Behavioral Probes
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
        {displaySteps.map((step) => {
          const isCritical = step.severity === 'Critical'
          const isHigh = step.severity === 'High'
          const isMed = step.severity === 'Medium'
          const isDetected = step.detected

          return (
            <div
              key={step.indicator}
              className={`flex flex-col justify-between rounded-xl border p-3 text-xs transition ${
                isCritical
                  ? 'border-rose-300 bg-rose-50/80 shadow-xs'
                  : isHigh
                  ? 'border-orange-300 bg-orange-50/70 shadow-xs'
                  : isMed
                  ? 'border-amber-300 bg-amber-50/60'
                  : isDetected
                  ? 'border-indigo-200 bg-indigo-50/50'
                  : 'border-slate-200/70 bg-slate-50/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`rounded-lg p-1.5 ${
                      isCritical
                        ? 'bg-rose-200 text-rose-800'
                        : isHigh
                        ? 'bg-orange-200 text-orange-800'
                        : isDetected
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {getIndicatorIcon(step.indicator)}
                  </div>

                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                      isDetected
                        ? isCritical
                          ? 'bg-rose-600 text-white'
                          : 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDetected ? 'DETECTED' : 'CLEAR'}
                  </span>
                </div>

                <h4 className="mt-2 font-bold text-slate-900">
                  {step.indicator}
                </h4>

                <span className="font-mono text-[10px] text-slate-400">
                  {step.time}
                </span>
              </div>

              <p className="mt-2 text-[10px] text-slate-600 line-clamp-2 leading-tight">
                {step.description}
              </p>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
