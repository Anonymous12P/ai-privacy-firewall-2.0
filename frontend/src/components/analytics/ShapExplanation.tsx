import { useState } from 'react'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card } from '../Card'
import { FirewallActionBadge } from '../FirewallActionBadge'
import type {
  LocalExplanationEvent,
  RadarFeatureImportance,
  ShapFeatureGlobal,
} from '../../types/analytics'

interface ShapExplanationProps {
  globalShap: ShapFeatureGlobal[]
  localEvents: LocalExplanationEvent[]
  radarImportance: RadarFeatureImportance[]
}

export function ShapExplanation({
  globalShap,
  localEvents,
  radarImportance,
}: ShapExplanationProps) {
  const [selectedEventId, setSelectedEventId] = useState<string>(
    localEvents[0]?.id ?? '',
  )
  const [activeTab, setActiveTab] = useState<'global' | 'local' | 'radar'>('global')

  const currentEvent =
    localEvents.find((e) => e.id === selectedEventId) ?? localEvents[0]

  return (
    <Card className="p-6">
      {/* Header and Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Explainable AI (XAI) Attribution & SHAP Intelligence
            </h3>
            <span className="rounded bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-700">
              KernelSHAP + TreeSHAP
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Game-theoretic feature attributions quantifying each behavioral signal's impact on threat classification.
          </p>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('global')}
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
              activeTab === 'global'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Global Attribution
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
              activeTab === 'local'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Local Event Waterfall
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`cursor-pointer rounded-lg px-3 py-1.5 transition ${
              activeTab === 'radar'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Behavioral Radar
          </button>
        </div>
      </div>

      {/* TAB 1: GLOBAL EXPLAINABILITY */}
      {activeTab === 'global' && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Behavioral Signal / Feature Name
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Threat Escalation (+)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Legitimate Mitigation (-)
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            {globalShap.map((feat) => {
              const isPositive = feat.direction === 'positive'
              return (
                <div
                  key={feat.key}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">
                        {feat.feature}
                      </span>
                      <span className="rounded bg-slate-200/60 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                        {feat.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono font-semibold ${
                          isPositive ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {isPositive ? `+${feat.shapValue.toFixed(3)}` : feat.shapValue.toFixed(3)}
                      </span>
                      <span className="w-12 text-right font-bold text-slate-900">
                        {feat.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, feat.percentage * 2.8)}%`,
                        backgroundColor: feat.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* TAB 2: LOCAL EXPLAINABILITY & WATERFALL */}
      {activeTab === 'local' && currentEvent && (
        <div className="mt-6 space-y-6">
          {/* Event Selector Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">
                Select Telemetry Incident:
              </span>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-900 shadow-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {localEvents.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    [{evt.decision}] {evt.employee} — {evt.resource}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{currentEvent.timestamp}</span>
              <FirewallActionBadge action={currentEvent.decision} />
            </div>
          </div>

          {/* Incident Metadata Overview */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">Employee</span>
              <p className="mt-1 font-semibold text-slate-900">{currentEvent.employee}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">Department</span>
              <p className="mt-1 font-semibold text-slate-900">{currentEvent.department}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">Risk Score</span>
              <p className="mt-1 text-base font-bold text-amber-600">{currentEvent.riskScore} / 100</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="text-[11px] text-slate-500">AI Threat Score</span>
              <p className="mt-1 text-base font-bold text-rose-600">{currentEvent.finalScore} / 100</p>
            </div>
          </div>

          {/* SHAP Waterfall Visualization */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                SHAP Decision Waterfall Attribution
              </h4>
              <span className="text-xs text-slate-500">
                Base Expectation ({currentEvent.baseValue}) → Final Decision ({currentEvent.finalScore})
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {currentEvent.waterfallSteps.map((step, idx) => {
                const isBase = step.type === 'base'
                const isResult = step.type === 'result'
                const isPositive = step.type === 'positive'

                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-40 font-semibold text-slate-700 truncate">
                      {step.name}
                    </span>

                    <div className="relative flex-1 h-6 rounded-md bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-md transition-all duration-300 flex items-center justify-end px-2 text-[10px] font-bold text-white ${
                          isBase
                            ? 'bg-slate-500'
                            : isResult
                            ? 'bg-indigo-600'
                            : isPositive
                            ? 'bg-rose-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.max(12, Math.min(100, step.runningTotal))}%`,
                        }}
                      >
                        {step.runningTotal.toFixed(1)}
                      </div>
                    </div>

                    <span
                      className={`w-16 text-right font-mono font-bold ${
                        isBase || isResult
                          ? 'text-slate-700'
                          : isPositive
                          ? 'text-rose-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {isBase || isResult
                        ? `${step.impact.toFixed(1)}`
                        : isPositive
                        ? `+${step.impact.toFixed(1)}`
                        : `${step.impact.toFixed(1)}`}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Positive vs Top Negative Breakdown */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
              <h4 className="text-xs font-bold text-rose-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Top Positive Threat Escalators
              </h4>
              <div className="mt-3 space-y-2">
                {currentEvent.topPositive.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{p.feature}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-rose-600">
                        +{p.contribution.toFixed(1)}
                      </span>
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-800">
                        {p.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Top Negative Trust Mitigators
              </h4>
              <div className="mt-3 space-y-2">
                {currentEvent.topNegative.map((n, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{n.feature}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-600">
                        {n.contribution.toFixed(1)}
                      </span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">
                        {n.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RADAR CHART (SECTION 6) */}
      {activeTab === 'radar' && (
        <div className="mt-6">
          <div className="border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Behavioral Indicator Risk Sensitivity Radar
            </h4>
            <p className="text-xs text-slate-500">
              Multi-axial sensitivity projection across 9 core behavioral triggers.
            </p>
          </div>

          <div className="mt-4 h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarImportance} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="indicator"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <Radar
                  name="Sensitivity Index"
                  dataKey="importance"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.45}
                />
                <Tooltip
                  formatter={(val: unknown) => [`${Number(val ?? 0)} / 100`, 'Weight']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5 text-center text-xs">
            {radarImportance.map((r) => (
              <div key={r.indicator} className="rounded-lg bg-slate-50 p-2">
                <span className="text-slate-500 text-[11px] block">{r.indicator}</span>
                <span className="font-bold text-slate-900">{r.importance}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
