import { useState } from 'react'
import {
  CheckBadgeIcon,
  TableCellsIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ConfusionMatrixData } from '../../types/evaluation'

interface ConfusionMatrixCardProps {
  matrices: Record<string, ConfusionMatrixData>
}

export function ConfusionMatrixCard({ matrices }: ConfusionMatrixCardProps) {
  const [selectedModel, setSelectedModel] = useState<string>('XGBoost')
  const current = matrices[selectedModel] ?? Object.values(matrices)[0]!

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TableCellsIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Holdout Test Set Confusion Matrix & Error Partition
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Evaluating true vs. predicted classifications across 37,500 unseen enterprise holdout samples.
          </p>
        </div>

        {/* Model selector tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {Object.keys(matrices).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSelectedModel(name)}
              className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                selectedModel === name
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* 2x2 Matrix */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Top row headers */}
            <div className="p-2 font-bold text-slate-400" />
            <div className="rounded-lg bg-slate-200/60 p-2 font-bold text-slate-700">
              Pred: Benign (Normal)
            </div>
            <div className="rounded-lg bg-slate-200/60 p-2 font-bold text-slate-700">
              Pred: Threat (Anomaly)
            </div>

            {/* Row 1: Actual Benign */}
            <div className="flex items-center justify-center rounded-lg bg-slate-200/60 p-2 font-bold text-slate-700">
              Actual: Benign
            </div>
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                True Negative (TN)
              </span>
              <span className="mt-1 text-xl font-black text-emerald-700 block">
                {current.tn.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Correctly Passed</span>
            </div>
            <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                False Positive (FP)
              </span>
              <span className="mt-1 text-xl font-black text-amber-700 block">
                {current.fp.toLocaleString()}
              </span>
              <span className="text-[10px] text-amber-600 font-medium">False Alarm</span>
            </div>

            {/* Row 2: Actual Threat */}
            <div className="flex items-center justify-center rounded-lg bg-slate-200/60 p-2 font-bold text-slate-700">
              Actual: Threat
            </div>
            <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                False Negative (FN)
              </span>
              <span className="mt-1 text-xl font-black text-rose-700 block">
                {current.fn.toLocaleString()}
              </span>
              <span className="text-[10px] text-rose-600 font-medium">Missed Intrusion</span>
            </div>
            <div className="rounded-xl border border-indigo-300 bg-indigo-50/80 p-3 shadow-2xs">
              <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                True Positive (TP)
              </span>
              <span className="mt-1 text-xl font-black text-indigo-700 block">
                {current.tp.toLocaleString()}
              </span>
              <span className="text-[10px] text-indigo-600 font-medium">Threat Captured</span>
            </div>
          </div>
        </div>

        {/* Statistical Metrics Breakdown */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Accuracy
              </p>
              <p className="mt-1 text-xl font-black text-slate-900">{current.accuracy}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Precision
              </p>
              <p className="mt-1 text-xl font-black text-slate-900">{current.precision}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Recall (Sensitivity)
              </p>
              <p className="mt-1 text-xl font-black text-indigo-700">{current.recall}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Specificity
              </p>
              <p className="mt-1 text-xl font-black text-emerald-700">{current.specificity}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Balanced Accuracy
              </p>
              <p className="mt-1 text-xl font-black text-slate-900">{current.balancedAccuracy}%</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                F1 Score
              </p>
              <p className="mt-1 text-xl font-black text-indigo-800">{current.f1Score}%</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3 text-xs text-slate-600 flex items-center gap-2">
            <CheckBadgeIcon className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>
              <strong>Holdout Total:</strong> Evaluated on {current.total.toLocaleString()} test events. {selectedModel} demonstrates a high Specificity of {current.specificity}% ensuring legitimate business requests pass with minimal false alarms.
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
