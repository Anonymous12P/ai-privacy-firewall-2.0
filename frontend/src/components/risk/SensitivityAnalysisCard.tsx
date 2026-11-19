import { useState } from 'react'
import {
  ArrowRightIcon,
  BoltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { FirewallDecision, SensitivityScenario } from '../../types/riskTuning'

interface SensitivityAnalysisCardProps {
  scenarios: SensitivityScenario[]
}

function getDecisionBadge(decision: FirewallDecision) {
  switch (decision) {
    case 'BLOCK':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'RESTRICT':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'WARN':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'ALLOW':
    default:
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
}

function getSensitivityBadge(rating: SensitivityScenario['sensitivityRating']) {
  switch (rating) {
    case 'Extreme':
      return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'High':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'Moderate':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Low':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

export function SensitivityAnalysisCard({ scenarios }: SensitivityAnalysisCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(scenarios[0]?.id ?? null)
  const [activePerturbations, setActivePerturbations] = useState<Record<string, boolean>>({
    'SENS-01': true,
    'SENS-04': true,
  })

  const togglePerturbation = (id: string) => {
    setActivePerturbations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  // Calculate cumulative simulated perturbation delta
  const cumulativeDelta = scenarios.reduce((acc, s) => {
    return acc + (activePerturbations[s.id] ? s.riskScoreDelta : 0)
  }, 0)

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BoltIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Feature Sensitivity & Perturbation Analysis
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Measures gradient response &Delta;Risk and decision threshold transitions induced by single-feature behavioral perturbations.
          </p>
        </div>

        {/* Live Interactive Cumulative Delta Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 text-xs">
          <SparklesIcon className="h-4 w-4 text-indigo-600" />
          <span className="font-medium text-slate-700">Combined Perturbation:</span>
          <span className="font-black text-indigo-800">+{cumulativeDelta} pts</span>
        </div>
      </div>

      {/* Scenarios Table / Cards */}
      <div className="mt-5 space-y-3">
        {scenarios.map((sc) => {
          const isExpanded = expandedId === sc.id
          const isToggled = Boolean(activePerturbations[sc.id])

          return (
            <div
              key={sc.id}
              className={`rounded-xl border transition ${
                isToggled
                  ? 'border-indigo-200 bg-indigo-50/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  {/* Perturbation toggle switch */}
                  <button
                    type="button"
                    onClick={() => togglePerturbation(sc.id)}
                    className={`cursor-pointer relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                      isToggled ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                    title="Toggle perturbation live"
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        isToggled ? 'translate-x-4.5' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">{sc.id}</span>
                      <h4 className="text-sm font-bold text-slate-900">{sc.factorName}</h4>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSensitivityBadge(
                          sc.sensitivityRating,
                        )}`}
                      >
                        {sc.sensitivityRating} Sensitivity
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span>
                        Baseline: <strong className="text-slate-700">{sc.baselineValue}</strong>
                      </span>
                      <ArrowRightIcon className="h-3 w-3 text-slate-400" />
                      <span>
                        Perturbed: <strong className="text-indigo-600">{sc.perturbedValue}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Decision Transition Badge */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className={`rounded-md border px-2 py-0.5 font-bold ${getDecisionBadge(
                        sc.initialDecision,
                      )}`}
                    >
                      {sc.initialDecision}
                    </span>
                    <ArrowRightIcon className="h-3.5 w-3.5 text-slate-400" />
                    <span
                      className={`rounded-md border px-2 py-0.5 font-bold ${getDecisionBadge(
                        sc.newDecision,
                      )}`}
                    >
                      {sc.newDecision}
                    </span>
                  </div>

                  {/* Delta Badge */}
                  <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-black text-red-800">
                    +{sc.riskScoreDelta} pts
                  </span>

                  {/* Expand button */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : sc.id)}
                    className="cursor-pointer text-slate-400 hover:text-slate-600 p-1"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-4 text-xs text-slate-600">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-900">Policy Sensitivity Impact: </span>
                      <span>{sc.policyImpactDescription}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
