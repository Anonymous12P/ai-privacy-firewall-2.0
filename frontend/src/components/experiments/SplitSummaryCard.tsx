import {
  CubeTransparentIcon,
} from '@heroicons/react/24/outline'
import { Card } from '../Card'
import type { SplitSummary } from '../../types/experiments'

interface SplitSummaryCardProps {
  split: SplitSummary
}

export function SplitSummaryCard({ split }: SplitSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <CubeTransparentIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Dataset Partitioning & Stratified Validation Design
            </h3>
            <p className="text-xs text-slate-500">
              Hold-out cross-validation split with reproducible random seed and minority class stratification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
            Seed {split.randomSeed} • Stratified K-Fold Verified
          </span>
        </div>
      </div>

      {/* Visual Split Segmented Bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>70% Training / 15% Validation / 15% Test Partitioning</span>
          <span className="font-mono text-slate-500">Total: 250,000 Records</span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="bg-indigo-600"
            style={{ width: `${split.trainPercent}%` }}
            title={`Train: ${split.trainRecords.toLocaleString()} (${split.trainPercent}%)`}
          />
          <div
            className="bg-purple-500"
            style={{ width: `${split.valPercent}%` }}
            title={`Validation: ${split.valRecords.toLocaleString()} (${split.valPercent}%)`}
          />
          <div
            className="bg-emerald-500"
            style={{ width: `${split.testPercent}%` }}
            title={`Test: ${split.testRecords.toLocaleString()} (${split.testPercent}%)`}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            <span>Training ({split.trainPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-purple-500" />
            <span>Validation ({split.valPercent}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Test Hold-Out ({split.testPercent}%)</span>
          </div>
        </div>
      </div>

      {/* 3 Detail Cards for Train, Val, Test */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Training Set */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
              Training Set
            </span>
            <span className="rounded bg-indigo-100 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-800">
              {split.trainPercent}%
            </span>
          </div>
          <span className="text-xl font-black text-slate-900 mt-2 block">
            {split.trainRecords.toLocaleString()}
          </span>
          <div className="mt-2 text-[10px] text-slate-600 space-y-0.5">
            <div>Benign: {split.classDistribution.train.benign.toLocaleString()}</div>
            <div className="font-semibold text-rose-700">
              Threat: {split.classDistribution.train.threat} sequences
            </div>
          </div>
        </div>

        {/* Validation Set */}
        <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">
              Validation Set
            </span>
            <span className="rounded bg-purple-100 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-800">
              {split.valPercent}%
            </span>
          </div>
          <span className="text-xl font-black text-slate-900 mt-2 block">
            {split.valRecords.toLocaleString()}
          </span>
          <div className="mt-2 text-[10px] text-slate-600 space-y-0.5">
            <div>Benign: {split.classDistribution.val.benign.toLocaleString()}</div>
            <div className="font-semibold text-rose-700">
              Threat: {split.classDistribution.val.threat} sequences
            </div>
          </div>
        </div>

        {/* Test Hold-Out */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
              Test Set (Zero Contamination)
            </span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
              {split.testPercent}%
            </span>
          </div>
          <span className="text-xl font-black text-slate-900 mt-2 block">
            {split.testRecords.toLocaleString()}
          </span>
          <div className="mt-2 text-[10px] text-slate-600 space-y-0.5">
            <div>Benign: {split.classDistribution.test.benign.toLocaleString()}</div>
            <div className="font-semibold text-rose-700">
              Threat: {split.classDistribution.test.threat} sequences
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
