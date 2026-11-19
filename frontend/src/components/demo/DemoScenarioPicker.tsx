import { useMemo, useState } from 'react'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline'
import type { DemoScenario } from '../../utils/demoScenarioData'

interface DemoScenarioPickerProps {
  scenarios: DemoScenario[]
  selectedScenarioId: string
  onSelectScenario: (scenario: DemoScenario) => void
  isScreenshotMode?: boolean
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Scenarios' },
  { id: 'threat', label: 'Critical Threats' },
  { id: 'anomaly', label: 'Behavioral Anomalies' },
  { id: 'benign', label: 'Benign Access' },
  { id: 'adaptation', label: 'Adaptive Feedback' },
]

export function DemoScenarioPicker({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  isScreenshotMode = false,
}: DemoScenarioPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const filteredScenarios = useMemo(() => {
    return scenarios.filter((s) => {
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !query ||
        s.title.toLowerCase().includes(query) ||
        s.actor.name.toLowerCase().includes(query) ||
        s.actor.department.toLowerCase().includes(query) ||
        s.request.resource.toLowerCase().includes(query) ||
        s.policyDecision.action.toLowerCase().includes(query)
      return matchesCategory && matchesQuery
    })
  }, [scenarios, selectedCategory, searchQuery])

  const getDecisionBadge = (action: string) => {
    switch (action) {
      case 'BLOCK':
        return {
          icon: NoSymbolIcon,
          color: 'text-rose-700 bg-rose-50 border-rose-200',
        }
      case 'RESTRICT':
        return {
          icon: ExclamationTriangleIcon,
          color: 'text-amber-700 bg-amber-50 border-amber-200',
        }
      case 'WARN':
        return {
          icon: ShieldExclamationIcon,
          color: 'text-blue-700 bg-blue-50 border-blue-200',
        }
      case 'ALLOW':
      default:
        return {
          icon: CheckCircleIcon,
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        }
    }
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white ${isScreenshotMode ? 'p-6' : 'p-5'} shadow-xs`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Interactive Scenario Presets
            </span>
            <span className="text-xs text-slate-500">8 Preset Evaluation Flows</span>
          </div>
          <h2 className="mt-1 text-base font-bold text-slate-900">
            Select a Real-World Evaluation Scenario
          </h2>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search scenario or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-hidden"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {CATEGORY_TABS.map((tab) => {
          const isSelected = selectedCategory === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition border ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow-2xs'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Scenario Cards Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {filteredScenarios.map((scenario) => {
          const isSelected = scenario.id === selectedScenarioId
          const decisionBadge = getDecisionBadge(scenario.policyDecision.action)
          const DecisionIcon = decisionBadge.icon

          return (
            <div
              key={scenario.id}
              className={`flex flex-col justify-between rounded-xl border p-4 text-left transition cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/40 shadow-sm ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
              onClick={() => onSelectScenario(scenario)}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                      scenario.severity === 'Critical'
                        ? 'border-rose-200 bg-rose-50 text-rose-700'
                        : scenario.severity === 'High'
                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                        : scenario.severity === 'Medium'
                        ? 'border-blue-200 bg-blue-50 text-blue-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {scenario.badge}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${decisionBadge.color}`}
                  >
                    <DecisionIcon className="h-3 w-3" />
                    {scenario.policyDecision.action}
                  </span>
                </div>

                <h3 className="mt-2 text-xs font-bold text-slate-900 line-clamp-1">
                  {scenario.title}
                </h3>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                  {scenario.description}
                </p>

                {/* Actor Info */}
                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[10px] font-bold ${scenario.actor.avatarColor}`}
                  >
                    {scenario.actor.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-800 truncate">
                      {scenario.actor.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {scenario.actor.department}
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom status */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                <span className="text-slate-500">
                  Threat Prob:{' '}
                  <strong className="text-slate-800">
                    {(scenario.aiEvaluation.threatProbability * 100).toFixed(1)}%
                  </strong>
                </span>

                <span
                  className={`font-semibold ${
                    isSelected ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                >
                  {isSelected ? 'Active' : 'Click to Load'}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
