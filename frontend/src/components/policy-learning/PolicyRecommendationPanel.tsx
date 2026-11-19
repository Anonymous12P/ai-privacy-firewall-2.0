import { useState } from 'react'
import {
  CheckCircleIcon,
  LightBulbIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { Card } from '../Card'
import type { PolicyRecommendation } from '../../types/policyLearning'

interface PolicyRecommendationPanelProps {
  recommendations: PolicyRecommendation[]
}

function getStatusBadge(status: PolicyRecommendation['status']) {
  switch (status) {
    case 'ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'REJECTED':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'PENDING':
    default:
      return 'bg-amber-50 text-amber-700 border-amber-200'
  }
}

export function PolicyRecommendationPanel({
  recommendations: initialRecs,
}: PolicyRecommendationPanelProps) {
  const [recommendations, setRecommendations] = useState<PolicyRecommendation[]>(initialRecs)

  const handleUpdateStatus = (id: string, newStatus: PolicyRecommendation['status']) => {
    setRecommendations((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          toast.success(`Policy Recommendation ${id} marked as ${newStatus}`)
          return { ...r, status: newStatus }
        }
        return r
      }),
    )
  }

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Autonomous Policy Recommendations & Rule Synthesis
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Machine-synthesized rule adjustments inferred from analyst triage feedback and recurrent edge patterns.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          {recommendations.filter((r) => r.status === 'PENDING').length} Pending Review
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs font-bold text-indigo-700">{rec.id}</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(
                    rec.status,
                  )}`}
                >
                  {rec.status}
                </span>
              </div>

              <h4 className="mt-2 text-sm font-bold text-slate-900 leading-snug">{rec.title}</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed">{rec.description}</p>

              <div className="mt-3 rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-100 space-y-1">
                <p>
                  <strong className="text-slate-800">Rationale: </strong>
                  {rec.reason}
                </p>
                <p className="text-emerald-700 font-semibold">
                  <strong>Impact: </strong>
                  {rec.expectedImpact}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>Target: <strong className="text-slate-700">{rec.departmentTarget}</strong></span>
                <span>Confidence: <strong className="text-indigo-700">{(rec.confidence * 100).toFixed(0)}%</strong></span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              {rec.status !== 'ACCEPTED' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(rec.id, 'ACCEPTED')}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
                >
                  <CheckCircleIcon className="h-3.5 w-3.5" />
                  Accept Rule
                </button>
              )}
              {rec.status !== 'REJECTED' && (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(rec.id, 'REJECTED')}
                  className="cursor-pointer inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <XCircleIcon className="h-3.5 w-3.5 text-slate-400" />
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
