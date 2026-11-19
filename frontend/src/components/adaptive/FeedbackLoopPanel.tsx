import { useState } from 'react'
import {
  ArrowPathIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { FeedbackLoopEvent } from '../../types/adaptiveLearning'

interface FeedbackLoopPanelProps {
  events: FeedbackLoopEvent[]
}

export function FeedbackLoopPanel({ events }: FeedbackLoopPanelProps) {
  const [eventList, setEventList] = useState<FeedbackLoopEvent[]>(events)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSimulateFeedback = (type: 'TP' | 'FP' | 'DRIFT') => {
    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      const newEvent: FeedbackLoopEvent = {
        id: `FBK-${Math.floor(Math.random() * 900) + 500}`,
        timestamp: 'Just now',
        analyst: 'Security Analyst (Active Session)',
        alertId: `ALT-${Math.floor(Math.random() * 900) + 8900}`,
        user: type === 'TP' ? 'Marcus Vance' : type === 'FP' ? 'Dr. Elena Rostova' : 'John',
        feedbackType:
          type === 'TP'
            ? 'Confirmed True Positive'
            : type === 'FP'
              ? 'Marked False Positive'
              : 'Benign Workload Drift',
        policyAction:
          type === 'TP'
            ? 'Policy Tightened'
            : type === 'FP'
              ? 'Policy Relaxed'
              : 'Baseline Updated',
        modelWeightShift:
          type === 'TP'
            ? 'Random Forest & XGBoost exfiltration weights boosted +12%'
            : type === 'FP'
              ? 'Relaxed false-positive threshold for research data lakes'
              : 'Gaussian baseline window expanded to include quarterly close',
        status: 'Committed',
      }

      setEventList((prev) => [newEvent, ...prev])
      toast.success(
        `Closed-loop feedback committed: ${newEvent.feedbackType} → ${newEvent.policyAction}`,
      )
    }, 450)
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'Policy Tightened':
        return 'bg-rose-100 text-rose-800 border-rose-200'
      case 'Policy Relaxed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Baseline Updated':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Analyst Feedback Loop & Reinforcement Calibration
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Closed-loop human-in-the-loop (HITL) calibration adjusting Bayesian priors, tree branch weights, and policy triggers.
          </p>
        </div>

        {/* Interactive Feedback Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSimulateFeedback('TP')}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-2xs hover:bg-rose-100 disabled:opacity-50"
          >
            <HandThumbDownIcon className="h-3.5 w-3.5" />
            <span>Confirm True Positive</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSimulateFeedback('FP')}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-2xs hover:bg-blue-100 disabled:opacity-50"
          >
            <HandThumbUpIcon className="h-3.5 w-3.5" />
            <span>Mark False Positive</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSimulateFeedback('DRIFT')}
            className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-2xs hover:bg-emerald-100 disabled:opacity-50"
          >
            <SparklesIcon className="h-3.5 w-3.5" />
            <span>Accept Benign Drift</span>
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {eventList.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700">
                  {item.id}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  (Ref: {item.alertId})
                </span>
                <span className="font-semibold text-xs text-slate-900">
                  User: <strong>{item.user}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getActionBadge(
                    item.policyAction,
                  )}`}
                >
                  {item.policyAction}
                </span>
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] text-slate-500">
                  {item.timestamp}
                </span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  ANALYST DECISION
                </span>
                <span className="font-bold text-slate-800">
                  {item.feedbackType}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50 p-2.5">
                <span className="text-[10px] font-semibold text-slate-400 block">
                  REVIEWED BY
                </span>
                <span className="font-medium text-slate-800">
                  {item.analyst}
                </span>
              </div>

              <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                  Machine Learning Model Adaptation
                </span>
                <p className="mt-0.5 font-medium text-indigo-950 text-[11px] leading-tight">
                  {item.modelWeightShift}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
