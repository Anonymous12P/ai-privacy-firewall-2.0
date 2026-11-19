import { Card } from '../Card'
import type { ConfusionMatrixData } from '../../types/analytics'

interface ConfusionMatrixProps {
  data: ConfusionMatrixData
}

export function ConfusionMatrix({ data }: ConfusionMatrixProps) {
  const actualThreats = data.tp + data.fn
  const actualNormal = data.tn + data.fp

  const tpRate = actualThreats > 0 ? ((data.tp / actualThreats) * 100).toFixed(1) : '0'
  const fnRate = actualThreats > 0 ? ((data.fn / actualThreats) * 100).toFixed(1) : '0'
  const fpRate = actualNormal > 0 ? ((data.fp / actualNormal) * 100).toFixed(2) : '0'
  const tnRate = actualNormal > 0 ? ((data.tn / actualNormal) * 100).toFixed(1) : '0'

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Threat Classification Confusion Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Ground-truth vs ML predictive alignment evaluated on production access telemetry.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-mono font-semibold text-slate-700">
          N = {data.total.toLocaleString()} Samples
        </span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Header Row: Predicted Labels */}
          <div className="grid grid-cols-[140px_1fr_1fr] gap-3 text-center text-xs font-semibold text-slate-700">
            <div />
            <div className="rounded-t-lg bg-indigo-50/70 py-1.5 text-indigo-900">
              Predicted: Unauthorized (Threat)
            </div>
            <div className="rounded-t-lg bg-emerald-50/70 py-1.5 text-emerald-900">
              Predicted: Authorized (Normal)
            </div>
          </div>

          {/* Row 1: Actual Threat */}
          <div className="mt-3 grid grid-cols-[140px_1fr_1fr] gap-3">
            <div className="flex flex-col justify-center rounded-l-lg bg-slate-50 px-3 py-4 text-xs font-semibold text-slate-800">
              <span>Actual: Unauthorized</span>
              <span className="text-[10px] font-normal text-slate-500">
                ({actualThreats.toLocaleString()} cases)
              </span>
            </div>

            {/* True Positive */}
            <div className="group relative rounded-xl border border-rose-200 bg-rose-50/80 p-4 transition hover:bg-rose-100">
              <div className="flex items-center justify-between text-xs text-rose-700 font-semibold">
                <span>True Positive (TP)</span>
                <span className="rounded bg-rose-200/80 px-1.5 py-0.5 text-[10px]">
                  {tpRate}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-rose-950">
                {data.tp.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-rose-700">
                Correctly blocked unauthorized intrusions
              </p>
            </div>

            {/* False Negative */}
            <div className="group relative rounded-xl border border-amber-200 bg-amber-50/60 p-4 transition hover:bg-amber-100">
              <div className="flex items-center justify-between text-xs text-amber-800 font-semibold">
                <span>False Negative (FN)</span>
                <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px]">
                  {fnRate}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-amber-950">
                {data.fn.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-amber-700">
                Missed anomaly (Type II error)
              </p>
            </div>
          </div>

          {/* Row 2: Actual Normal */}
          <div className="mt-3 grid grid-cols-[140px_1fr_1fr] gap-3">
            <div className="flex flex-col justify-center rounded-l-lg bg-slate-50 px-3 py-4 text-xs font-semibold text-slate-800">
              <span>Actual: Authorized</span>
              <span className="text-[10px] font-normal text-slate-500">
                ({actualNormal.toLocaleString()} cases)
              </span>
            </div>

            {/* False Positive */}
            <div className="group relative rounded-xl border border-orange-200 bg-orange-50/60 p-4 transition hover:bg-orange-100">
              <div className="flex items-center justify-between text-xs text-orange-800 font-semibold">
                <span>False Positive (FP)</span>
                <span className="rounded bg-orange-200/80 px-1.5 py-0.5 text-[10px]">
                  {fpRate}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-orange-950">
                {data.fp.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-orange-700">
                Benign flagged as threat (Type I error)
              </p>
            </div>

            {/* True Negative */}
            <div className="group relative rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 transition hover:bg-emerald-100">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
                <span>True Negative (TN)</span>
                <span className="rounded bg-emerald-200/80 px-1.5 py-0.5 text-[10px]">
                  {tnRate}%
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-emerald-950">
                {data.tn.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-emerald-700">
                Correctly permitted legitimate traffic
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Score Bar */}
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[11px] text-slate-500">Overall Accuracy</p>
          <p className="mt-1 text-base font-bold text-slate-900">{data.accuracy}%</p>
          <p className="text-[10px] text-slate-400">(TP + TN) / Total</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[11px] text-slate-500">Precision</p>
          <p className="mt-1 text-base font-bold text-emerald-600">{data.precision}%</p>
          <p className="text-[10px] text-slate-400">TP / (TP + FP)</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[11px] text-slate-500">Recall / Sensitivity</p>
          <p className="mt-1 text-base font-bold text-indigo-600">{data.recall}%</p>
          <p className="text-[10px] text-slate-400">TP / (TP + FN)</p>
        </div>
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
          <p className="text-[11px] text-slate-500">F1 Harmonized Score</p>
          <p className="mt-1 text-base font-bold text-purple-600">{data.f1Score}%</p>
          <p className="text-[10px] text-slate-400">2 * (P * R) / (P + R)</p>
        </div>
      </div>
    </Card>
  )
}
