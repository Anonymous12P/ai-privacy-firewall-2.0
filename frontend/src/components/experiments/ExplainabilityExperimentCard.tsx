import {
  LightBulbIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ExplainabilityExperimentItem } from '../../types/experiments'

interface ExplainabilityExperimentCardProps {
  items: ExplainabilityExperimentItem[]
}

export function ExplainabilityExperimentCard({
  items,
}: ExplainabilityExperimentCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <LightBulbIcon className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">
              Explainability Architecture & SHAP Fidelity Benchmark
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Attribution accuracy, explainability latency overhead, and natural language narrative generation across candidate classifiers.
          </p>
        </div>

        <span className="rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          TreeSHAP Optimized
        </span>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.modelName}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 hover:shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.modelName}
                  </h4>
                  <span className="font-mono text-[10px] text-indigo-700 font-semibold">
                    {item.explainerType}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    item.interpretabilityTier === 'High'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.interpretabilityTier} Interpretability
                </span>
              </div>

              {/* 3 Metric cards */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    FIDELITY
                  </span>
                  <span className="font-mono font-black text-indigo-700 text-sm">
                    {item.fidelityScore}%
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    SHAP CONSISTENCY
                  </span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    {item.shapConsistency}%
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    EXPLAIN LATENCY
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    {item.latencyMs} ms
                  </span>
                </div>
              </div>

              {/* Explanation Narrative Output */}
              <div className="mt-3 rounded-xl bg-indigo-50/40 border border-indigo-100/60 p-3 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
                  Synthesized Natural Language Explanation
                </span>
                <p className="text-[11px] text-indigo-950 font-medium leading-relaxed">
                  "{item.explanationExample}"
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
