import {
  BoltIcon,
  CheckBadgeIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ShapQualityMetrics } from '../../types/evaluation'

interface ShapQualityCardProps {
  shapQuality: ShapQualityMetrics
}

export function ShapQualityCard({ shapQuality }: ShapQualityCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Explainable AI: TreeSHAP Attribution Quality & Latency
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Axiomatic game-theoretic verification of local accuracy, feature attribution stability, and real-time generation speed.
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
          {shapQuality.interpretabilityTier}
        </span>
      </div>

      {/* 5 Quality Badges */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Explanation Fidelity
          </p>
          <p className="mt-1 text-2xl font-black text-indigo-700">
            {shapQuality.explanationFidelity}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Local Accuracy Concordance</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Local Stability
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {shapQuality.localStability}%
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600 font-semibold">Lipschitz Bounded</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Global Consistency
          </p>
          <p className="mt-1 text-2xl font-black text-slate-900">
            {shapQuality.globalConsistency}%
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Ranking Concordance</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              TreeSHAP Latency
            </p>
            <BoltIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-1 text-2xl font-black text-emerald-700">
            {shapQuality.treeShapLatencyMs} ms
          </p>
          <p className="mt-0.5 text-[10px] text-emerald-600 font-medium">vs 24.2 ms KernelSHAP</p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Speedup Ratio
          </p>
          <p className="mt-1 text-2xl font-black text-indigo-800">
            {shapQuality.speedupFactor}x
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">Real-time Live Inspect</p>
        </div>
      </div>

      {/* Natural Language Attribution Sample Card */}
      <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
        <div className="flex items-start gap-2.5">
          <CheckBadgeIcon className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-indigo-950 uppercase tracking-wider text-[11px]">
              Ground-Truth Explainability Attribution Output (Lundberg et al. Compliant)
            </h4>
            <p className="text-indigo-900 leading-relaxed font-mono bg-white/70 p-2.5 rounded-lg border border-indigo-200/60 text-[11px]">
              {shapQuality.sampleExplanation}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
