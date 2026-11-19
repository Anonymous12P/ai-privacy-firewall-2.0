import { useState } from 'react'
import { TableCellsIcon } from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { ConfusionMatrixData, ModelName } from '../../types/experiments'

interface ConfusionMatrixPanelProps {
  matrices: Record<ModelName, ConfusionMatrixData>
}

export function ConfusionMatrixPanel({ matrices }: ConfusionMatrixPanelProps) {
  const [selectedModel, setSelectedModel] = useState<ModelName>('XGBoost')

  const current = matrices[selectedModel]
  const total = current.tp + current.tn + current.fp + current.fn

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TableCellsIcon className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Confusion Matrix & Contingency Diagnostics
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            True positive, true negative, false positive, and false negative counts on held-out test data ({total.toLocaleString()} records).
          </p>
        </div>

        {/* Model Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
          {(['XGBoost', 'RandomForest', 'DecisionTree', 'LogisticRegression'] as ModelName[]).map(
            (m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSelectedModel(m)}
                className={`cursor-pointer rounded-lg px-3 py-1 transition ${
                  selectedModel === m
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ),
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* 2x2 Matrix */}
        <div className="lg:col-span-7">
          <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Predicted Class →
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {/* Corner header */}
            <div className="flex items-center justify-center p-2 text-[10px] font-bold text-slate-400 uppercase">
              Actual Class ↓
            </div>
            <div className="rounded-xl bg-slate-100 p-2 font-bold text-slate-700">
              Predicted Benign (ALLOW)
            </div>
            <div className="rounded-xl bg-slate-100 p-2 font-bold text-slate-700">
              Predicted Threat (BLOCK)
            </div>

            {/* Actual Benign Row */}
            <div className="flex items-center justify-center rounded-xl bg-slate-100 p-2 text-[10px] font-bold text-slate-700">
              Actual Benign
            </div>
            <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/70 p-4">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                True Negative (TN)
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {current.tn.toLocaleString()}
              </span>
              <span className="text-[10px] text-emerald-600">
                Correctly Allowed
              </span>
            </div>
            <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">
                False Positive (FP)
              </span>
              <span className="text-2xl font-black text-amber-700 mt-1 block">
                {current.fp}
              </span>
              <span className="text-[10px] text-amber-600">
                Benign Falsely Flagged
              </span>
            </div>

            {/* Actual Threat Row */}
            <div className="flex items-center justify-center rounded-xl bg-slate-100 p-2 text-[10px] font-bold text-slate-700">
              Actual Threat
            </div>
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-4">
              <span className="text-[10px] font-bold text-rose-800 uppercase block">
                False Negative (FN)
              </span>
              <span className="text-2xl font-black text-rose-700 mt-1 block">
                {current.fn}
              </span>
              <span className="text-[10px] text-rose-600">
                Threat Missed (Critical)
              </span>
            </div>
            <div className="rounded-2xl border-2 border-indigo-300 bg-indigo-50/70 p-4">
              <span className="text-[10px] font-bold text-indigo-800 uppercase block">
                True Positive (TP)
              </span>
              <span className="text-2xl font-black text-indigo-700 mt-1 block">
                {current.tp}
              </span>
              <span className="text-[10px] text-indigo-600">
                Exfiltration Intercepted
              </span>
            </div>
          </div>
        </div>

        {/* Derived Statistics Breakdown */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-1">
              {selectedModel} Statistical Metrics
            </span>
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              Performance Summary
            </h4>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Accuracy (Overall):</span>
                <span className="font-mono font-bold text-slate-900">{current.accuracy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Precision (Positive Predictive Value):</span>
                <span className="font-mono font-bold text-indigo-700">{current.precision}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Recall (Sensitivity / Detection Rate):</span>
                <span className="font-mono font-bold text-emerald-700">{current.recall}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Specificity (True Negative Rate):</span>
                <span className="font-mono font-bold text-slate-900">{current.specificity}%</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2 font-bold">
                <span className="text-slate-900">Harmonic F1-Score:</span>
                <span className="font-mono text-sm text-indigo-700">{current.f1}%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white p-3 text-[11px] text-slate-500 border border-slate-200">
            <strong>Analyst Insight:</strong> {current.tp} out of 45 real attack chains intercepted with only {current.fp} false positive alerts on 37,455 operational sessions.
          </div>
        </div>
      </div>
    </Card>
  )
}
